/* The SVG pieces inside a box: KanjiVG strokes, stroke numbers, cross guides,
 * and the Klee One outlines the printout draws glyphs with.
 */

import { STROKES, OUTLINES } from '../data.js';
import {
  VIEWBOX, CENTER, GLYPH_SIZE, BASELINE, OUTLINE_EM,
  SKELETON_WIDTH, NUMBER_OUTLINE_RATIO, INK, SHU, NUMBER_OUTLINE, GUIDE_COLOR,
} from './constants.js';

export const svg = (contents, cls = '') =>
  `<svg${cls && ` class="${cls}"`} viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" aria-hidden="true">${contents}</svg>`;

export const box = contents => `<div class="box">${svg(contents)}</div>`;

/* --- outlines --- */

/* Each outline is defined once per printout and drawn with <use>; this
   collects the ones used while the pages are built. */
let usedOutlines = new Set();

const outlineId = char => `g${char.codePointAt(0)}`;

export function resetOutlines() {
  usedOutlines = new Set();
}

/** An unclosed <use> of the char's outline, for the caller to add attributes. */
export function outlineRef(char) {
  usedOutlines.add(char);
  return `<use href="#${outlineId(char)}"`;
}

export function defsHtml() {
  const paths = [...usedOutlines].map(char =>
    `<path id="${outlineId(char)}" transform="translate(${CENTER} ${BASELINE.toFixed(2)}) scale(${GLYPH_SIZE / OUTLINE_EM})"`
    + ` d="${OUTLINES[char]}"/>`);
  return `<svg class="defs" aria-hidden="true"><defs>${paths.join('')}</defs></svg>`;
}

/* --- strokes --- */

/** Solid vertical and horizontal centre lines. */
export function crossGuides(unitsPerMm) {
  const width = (0.2 * unitsPerMm).toFixed(2);
  return `<g stroke="${GUIDE_COLOR}" stroke-width="${width}" fill="none">`
    + `<line x1="${CENTER}" y1="0" x2="${CENTER}" y2="${VIEWBOX}"/>`
    + `<line x1="0" y1="${CENTER}" x2="${VIEWBOX}" y2="${CENTER}"/></g>`;
}

function skeleton(char, width = SKELETON_WIDTH) {
  const data = STROKES[char];
  if (!data) return '';
  return `<g fill="none" stroke="${INK}" stroke-width="${width}"`
    + ` stroke-linecap="round" stroke-linejoin="round">`
    + data.s.map(path => `<path d="${path}"/>`).join('')
    + `</g>`;
}

export function strokeNumbers(char, settings) {
  const data = STROKES[char];
  if (!data) return '';
  const size = settings.numberSize * VIEWBOX / settings.box;   // mm on paper to box units
  const labels = data.n.map(([x, y], i) => `<text x="${x}" y="${y}">${i + 1}</text>`).join('');
  return `<g font-family="'Zen Kaku Gothic New',sans-serif" font-weight="700" font-size="${size.toFixed(2)}"`
    + ` fill="${SHU}" stroke="${NUMBER_OUTLINE}" stroke-width="${(size * NUMBER_OUTLINE_RATIO).toFixed(2)}" paint-order="stroke"`
    + ` stroke-linejoin="round">${labels}</g>`;
}

export const strokeOrder = (char, settings) => skeleton(char) + strokeNumbers(char, settings);

/** Stroke numbers for the model box, when the stroke order goes there. */
export const modelNumbers = (char, settings) => (settings.order === 'model' ? strokeNumbers(char, settings) : '');

/** The character to copy or trace, in KanjiVG stroke lines of the liner's
    width. Opacity goes on the group so crossing strokes do not darken. */
export function linerGlyph(char, settings, opacity) {
  const width = (settings.lineWidth * VIEWBOX / settings.box).toFixed(2);
  return `<g opacity="${opacity}">${skeleton(char, width)}</g>`;
}
