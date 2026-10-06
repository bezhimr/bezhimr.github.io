# Kanji practice sheets

Printable kanji and kana practice sheets, grouped by Kanken level, the first six of which are the Japanese school grades. A static site: serve this folder and open `index.html`.

## Rebuilding the data

`data/` and the webfont subsets in `fonts/` are generated, and committed so the site needs no build step. The exceptions are `data/kana-table.json` and `data/kanken.json`, the kana tables and Kanken levels, written by hand, and the full fonts in `tools/fonts/`, which the subsets are cut from. To regenerate from newer sources:

```sh
pip install fonttools brotli
python3 tools/build.py kanjidic2.xml.gz kanjivg/kanji
```

See the top of `tools/build.py` for where to get the sources.

## Credits

All credits and license links shown in the app live in `js/credits.js`; the rest of the app's text is in `js/text.js`.

- Stroke paths and stroke order — [KanjiVG](https://kanjivg.tagaini.net/) © Ulrich Apel, CC BY-SA 3.0
- Jōyō and jinmeiyō lists, readings, meanings, stroke counts — [KANJIDIC2](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project) © EDRDG, CC BY-SA 4.0
- Kanken levels (`data/kanken.json`, written by hand) — the [Japan Kanji Aptitude Testing Foundation](https://www.kanken.or.jp/kanken/outline/degree/)'s 級別漢字表, 2020
- Fonts — Klee One by Fontworks, Zen Kaku Gothic New by Yoshimichi Ohira, SIL OFL 1.1
