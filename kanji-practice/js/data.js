/* Character data, built by tools/build.py. One file per picker group, fetched
 * only when needed:
 *
 *   data/grades.json            group -> its kanji, most common first
 *   data/<group>.json           { meta, strokes }
 *   data/kana.json              { strokes }
 *   data/kana-table.json        the kana tables (written by hand, see kana.js)
 *   data/kanken.json            Kanken level -> its kanji (written by hand, see tools/build.py)
 *   data/outlines/<group>.json  char -> Klee One SemiBold outline
 *
 *   meta     kanji -> [strokeCount, meanings[], onReadings[], kunReadings[]]
 *   strokes  char  -> { s: [svgPath, …] in stroke order, n: [[x, y], …] stroke-number positions }
 *
 * Stroke coordinates are in KanjiVG's 109x109 box. Outlines are SVG paths in
 * 1/500 em, baseline at y=0, centred on x=0.
 */

import { fetchJson } from './util.js';
import { KANA } from './kana.js';

export const GRADES = await fetchJson('data/grades.json');

export const META = {};
export const STROKES = {};
export const OUTLINES = {};

const fileOf = new Map();
for (const [file, chars] of Object.entries(GRADES)) {
  for (const char of chars) fileOf.set(char, file);
}
for (const char of KANA) fileOf.set(char, 'kana');

/** Has stroke data: every kanji in data/grades.json, and the kana. */
export const isPractisable = char => fileOf.has(char);

export const isKanji = char => /[㐀-鿿]/.test(char);

export const strokeCount = char => (STROKES[char] ? STROKES[char].s.length : 0);

const requests = new Map();   // path -> its fetch, so each file is fetched once

function loadFor(chars, dir, apply) {
  const paths = new Set([...chars].filter(c => fileOf.has(c)).map(c => `data/${dir}${fileOf.get(c)}.json`));
  return Promise.all([...paths].map(path => {
    if (!requests.has(path)) {
      const request = fetchJson(path).then(apply);
      request.catch(() => requests.delete(path));   // let a failed fetch be retried
      requests.set(path, request);
    }
    return requests.get(path);
  }));
}

export const ensureLoaded = chars => loadFor(chars, '', ({ meta, strokes }) => {
  Object.assign(META, meta);   // kana.json has no meta
  Object.assign(STROKES, strokes);
});

export const ensureOutlines = chars => loadFor(chars, 'outlines/', outlines => Object.assign(OUTLINES, outlines));
