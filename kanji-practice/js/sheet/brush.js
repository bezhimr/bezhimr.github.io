/* The brush pen: model and tracing glyphs in Klee One SemiBold instead of
 * KanjiVG stroke lines. Paused, because its strokes thicken with the box size
 * (see load() in state.js); kept here, with its CSS in css/brush.css, so it
 * can come back.
 */

import { OUTLINES } from '../data.js';
import { escapeHtml } from '../util.js';
import { CENTER, GLYPH_SIZE, BASELINE, INK } from './constants.js';
import { svg, outlineRef } from './draw.js';

const BRUSH_WEIGHT = 600;          // Klee One SemiBold

/** For the printout: the outline, or the webfont where there is none. */
export function brushGlyph(char, settings, opacity) {
  if (OUTLINES[char]) return `${outlineRef(char)} fill-opacity="${opacity}"/>`;
  return `<text x="${CENTER}" y="${BASELINE.toFixed(2)}" font-size="${GLYPH_SIZE}"`
    + ` text-anchor="middle" font-family="'Klee One'" font-weight="${BRUSH_WEIGHT}"`
    + ` fill="${INK}" fill-opacity="${opacity}">${escapeHtml(char)}</text>`;
}

/** For the preview: the webfont glyph, `over` (stroke numbers) on top of it. */
export const brushPreviewBox = (cls, char, crossed, over) =>
  `<div class="box${crossed}"><div class="${cls}"><span>${char}</span></div>${over && svg(over, 'over')}</div>`;
