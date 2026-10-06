#!/usr/bin/env python3
"""Build everything in data/ from the original sources.

    python3 tools/build.py kanjidic2.xml.gz kanjivg/kanji [--out DIR] [--no-fonts]

  kanjidic2.xml.gz  https://www.edrdg.org/kanjidic/kanjidic2.xml.gz
  kanjivg/kanji     the SVGs from a KanjiVG release's "main" zip,
                    https://github.com/KanjiVG/kanjivg/releases

Also extracts glyph outlines from tools/fonts/KleeOne-SemiBold.ttf into
data/outlines/, and subsets the fonts in tools/fonts/ into the webfonts in
fonts/ (see SUBSETS), keeping the UI characters plus every kanji in the
groups. Both need fontTools and brotli (pip install fonttools brotli);
--no-fonts skips them. The rest uses only the standard library. The output
formats are described in js/data.js. The kana come from data/kana-table.json
and the Kanken levels from data/kanken.json, both written by hand.

Groups: the jōyō kanji by Kanken level, 10級 to 2級, as listed in
data/kanken.json: the Kanken association's 級別漢字表 (2020),
https://www.kanken.or.jp/kanken/outline/degree/, with 𠮟 塡 剝 頰 in their
jōyō forms. 10級 to 5級 are the six elementary school grades. names are the
jinmeiyō kanji, KANJIDIC2 grade 9 then grade 10 (older forms of jōyō kanji).
Kanji without KanjiVG strokes are left out.
"""

import argparse
import gzip
import json
import math
import re
from decimal import Decimal, ROUND_HALF_EVEN
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE_FONTS = ROOT / 'tools/fonts'
FONT = SOURCE_FONTS / 'KleeOne-SemiBold.ttf'
SUBSETS = {   # webfont in fonts/: its source in tools/fonts/
    'KleeOne-400.woff2': 'KleeOne-Regular.ttf',
    'KleeOne-600.woff2': 'KleeOne-SemiBold.ttf',
    'ZenKakuGothicNew-400.woff2': 'ZenKakuGothicNew-Regular.ttf',
    'ZenKakuGothicNew-700.woff2': 'ZenKakuGothicNew-Bold.ttf',
}
UI_CHARS = [*range(0x20, 0x7F), *range(0xA0, 0x100), *range(0x2000, 0x2070),
            *range(0x3000, 0x3100), *range(0xFF00, 0xFFF0)]   # Latin, punctuation, kana, full width
KANKEN = json.loads((ROOT / 'data/kanken.json').read_text(encoding='utf-8'))   # group -> its kanji
JOYO = [1, 2, 3, 4, 5, 6, 8]   # KANJIDIC2 grades
GROUPS = {**{level: JOYO for level in KANKEN}, 'names': [9, 10]}   # group -> KANJIDIC2 grades


def kana():
    """The kana in data/kana-table.json: hiragana, then katakana."""
    tables = json.loads((ROOT / 'data/kana-table.json').read_text(encoding='utf-8'))
    hira = [c for rows in tables.values() for chars, _ in rows for c in chars if c != '_']
    return hira + [chr(ord(c) + 0x60) for c in hira]


# --- KANJIDIC2 ---

ENTITIES = {'&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&amp;': '&'}


def parse_dic(path):
    def texts(block, pattern):
        return [re.sub(r'&\w+;', lambda m: ENTITIES[m[0]], s) for s in re.findall(pattern, block)]

    dic = {}
    for block in re.findall(r'<character>.*?</character>', gzip.open(path, 'rt', encoding='utf-8').read(), re.S):
        number = lambda tag: re.search(rf'<{tag}>(\d+)</{tag}>', block)
        grade, freq = number('grade'), number('freq')
        dic[re.search(r'<literal>(.*?)</literal>', block)[1]] = {
            'grade': int(grade[1]) if grade else 0,
            'freq': int(freq[1]) if freq else math.inf,
            'strokes': int(number('stroke_count')[1]),
            'on': texts(block, r'<reading r_type="ja_on">(.*?)</reading>'),
            'kun': texts(block, r'<reading r_type="ja_kun">(.*?)</reading>'),
            'meanings': texts(block, r'<meaning>(.*?)</meaning>'),
        }
    return dic


def meta_of(k):
    title_case = lambda s: ' '.join(w[:1].upper() + w[1:] for w in s.split(' '))
    to_hiragana = lambda s: re.sub('[ァ-ヶ]', lambda m: chr(ord(m[0]) - 0x60), s)
    return [k['strokes'], [title_case(m) for m in k['meanings'][:3]],
            [to_hiragana(r) for r in k['on'][:4]], k['kun'][:4]]


# --- KanjiVG ---


def rnd(x):
    """To 0.1, judged on the exact value of the float, ties to even."""
    return float(Decimal(x).quantize(Decimal('0.1'), rounding=ROUND_HALF_EVEN))


def fmt(v):
    """For a path string: no trailing ".0", and a negative zero keeps its sign."""
    if v == 0:
        return '-0' if math.copysign(1, v) < 0 else '0'
    return str(int(v)) if v == int(v) else repr(v)


def strokes_of(svg):
    paths = sorted(re.findall(r'<path id="kvg:[0-9a-f]+-s(\d+)"[^>]*\sd="([^"]+)"', svg), key=lambda p: int(p[0]))
    numbers = re.findall(r'<text transform="matrix\(1 0 0 1 ([\d.-]+) ([\d.-]+)\)">\d+</text>', svg)
    whole = lambda v: int(v) if v == int(v) else v
    return {
        's': [re.sub(r'-?(?:\d+\.?\d*|\.\d+)', lambda m: fmt(rnd(float(m[0]))), d) for _, d in paths],
        'n': [[whole(rnd(float(x))), whole(rnd(float(y)))] for x, y in numbers],
    }


# --- Klee One outlines ---

GRID = 500   # units per em of the output


def outline_of(font, char):
    """The glyph as a path in 1/GRID em, baseline at y=0, centred on x=0, y down.

    Each contour starts at its last point if that is on the curve, else at the
    next on-curve point or midway between two off-curve ones. Contours are left
    open: the fill closes them."""
    name = font.getBestCmap().get(ord(char))
    if name is None:
        raise SystemExit(f'Klee One has no glyph for {char}')
    coords, ends, flags = font['glyf'][name].getCoordinates(font['glyf'])
    scale = GRID / font['head'].unitsPerEm
    dx = -font['hmtx'][name][0] * scale / 2

    round_half_up = lambda v: math.floor(v + 0.5)
    at = lambda p: (round_half_up(dx + p[0] * scale), round_half_up(-p[1] * scale))
    mid = lambda a, b: ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, True)

    out, last, x, y = [], '', 0, 0

    def emit(cmd, *points):
        nonlocal last, x, y
        values = [v for px, py in points for v in (px - x, py - y)]
        repeat = cmd == last and cmd != 'm'
        out.append(('' if repeat else cmd)
                   + ''.join((' ' if (i or repeat) and v >= 0 else '') + str(v) for i, v in enumerate(values)))
        last = cmd
        x, y = points[-1]

    start = 0
    for end in ends:
        contour = [(*coords[i], bool(flags[i] & 1)) for i in range(start, end + 1)]
        start = end + 1
        curr, nxt = contour[-1], contour[0]
        emit('m', at(curr if curr[2] else nxt if nxt[2] else mid(curr, nxt)))
        for i in range(len(contour)):
            curr, nxt = nxt, contour[(i + 1) % len(contour)]
            if not curr[2]:
                emit('q', at(curr), at(nxt if nxt[2] else mid(curr, nxt)))
            elif at(curr) != (x, y):
                emit('l', at(curr))
    return ''.join(out)


# --- everything ---


def main():
    parser = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    parser.add_argument('kanjidic', help='kanjidic2.xml.gz')
    parser.add_argument('kanjivg', type=Path, help="KanjiVG's kanji folder")
    parser.add_argument('--out', type=Path, default=ROOT / 'data')
    parser.add_argument('--no-fonts', action='store_true')
    args = parser.parse_args()

    def write(name, data):
        path = args.out / name
        path.parent.mkdir(parents=True, exist_ok=True)
        text = data if isinstance(data, str) else json.dumps(data, ensure_ascii=False, separators=(',', ':'))
        path.write_text(text, encoding='utf-8')

    dic = parse_dic(args.kanjidic)
    svg = lambda char: args.kanjivg / f'{ord(char):05x}.svg'
    strokes = lambda chars: {c: strokes_of(svg(c).read_text(encoding='utf-8')) for c in chars}
    by_use = lambda c: (dic[c]['freq'], dic[c]['strokes'], ord(c))

    joyo = {c for c, k in dic.items() if k['grade'] in JOYO}
    leveled = [c for chars in KANKEN.values() for c in chars]
    if set(leveled) != joyo or len(leveled) != len(joyo):
        raise SystemExit('data/kanken.json must list every jōyō kanji exactly once: '
                         f'unlisted {"".join(sorted(joyo - set(leveled)))}, '
                         f'not jōyō {"".join(sorted(set(leveled) - joyo))}')

    groups = {}
    for name, grades in GROUPS.items():
        graded = [c for grade in grades for c in sorted((c for c, k in dic.items() if k['grade'] == grade), key=by_use)]
        if name in KANKEN:
            graded = [c for c in graded if c in KANKEN[name]]
        groups[name] = [c for c in graded if svg(c).exists()]
        if missing := [c for c in graded if not svg(c).exists()]:
            print(f'{name}: no KanjiVG strokes for {"".join(missing)}')
        write(f'{name}.json', {'meta': {c: meta_of(dic[c]) for c in groups[name]}, 'strokes': strokes(groups[name])})
        print(f'{name}: {len(groups[name])} kanji')

    write('grades.json', '{\n' + ',\n'.join(f'"{g}": "{"".join(cs)}"' for g, cs in groups.items()) + '\n}\n')
    write('kana.json', {'strokes': strokes(kana())})

    if not args.no_fonts:
        from fontTools import subset
        from fontTools.ttLib import TTFont
        font = TTFont(FONT)
        for name, chars in {**groups, 'kana': kana()}.items():
            write(f'outlines/{name}.json', {c: outline_of(font, c) for c in chars})
        print('outlines: done')

        unicodes = UI_CHARS + [ord(c) for chars in groups.values() for c in chars]
        for webfont, source in SUBSETS.items():
            font = TTFont(SOURCE_FONTS / source)
            subsetter = subset.Subsetter(subset.Options(flavor='woff2'))
            subsetter.populate(unicodes=unicodes)
            subsetter.subset(font)
            font.flavor = 'woff2'
            font.save(ROOT / 'fonts' / webfont)
            print(f'fonts/{webfont}: {len(font.getBestCmap())} characters')


if __name__ == '__main__':
    main()
