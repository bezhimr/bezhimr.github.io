/* What goes where: the boxes each character gets, how many characters fit on
 * a page, and the HTML of a page. Every character gets the same boxes and a
 * one-line caption, so all blocks are the same height and paging is plain
 * arithmetic.
 */

import { STROKES } from '../data.js';
import { CREDIT_LINE } from '../credits.js';
import { PAGE_HEIGHT, PAGE_PADDING, CONTENT_WIDTH, BORDER, CAPTION, GAP, CREDIT } from './constants.js';
import { caption } from './caption.js';

/* --- boxes --- */

/** The boxes a character gets, left to right; always the same number. A kanji
    without stroke data gets a tracing box in place of the stroke-order box. */
export function boxKinds(char, settings) {
  const kinds = [];
  const orderBox = settings.order === 'box';
  if (orderBox && STROKES[char]) kinds.push('order');
  if (settings.model || settings.order === 'model') kinds.push('model');
  if (orderBox && !STROKES[char]) kinds.push('trace');
  for (let i = 0; i < settings.trace; i++) kinds.push(settings.gray ? 'trace' : 'plain');
  for (let i = 0; i < settings.guide; i++) kinds.push('crossed');
  for (let i = 0; i < settings.blank; i++) kinds.push('empty');
  return kinds;
}

export const boxCount = settings => boxKinds('', settings).length;

export const MAX_BOX = CONTENT_WIDTH;

/** Boxes side by side share a border; at least one, even if too wide. */
export const boxesPerLine = boxMm => Math.max(1, Math.floor((CONTENT_WIDTH - BORDER) / (boxMm - BORDER)));

/* --- pages --- */

function blockHeight(settings) {
  const lines = Math.ceil(boxCount(settings) / boxesPerLine(settings.box));
  return (settings.info ? CAPTION : 0) + lines * (settings.box - BORDER) + BORDER + GAP;
}

const pageRoom = settings => PAGE_HEIGHT - 2 * PAGE_PADDING - (settings.credit ? CREDIT : 0);

function perPage(settings) {
  return Math.max(1, Math.floor(pageRoom(settings) / blockHeight(settings)));
}

/** With `spread`, gaps grow so a full page reaches the credit line. Floored to
    0.01 mm so rounding never pushes the credit off the page. */
function blockGap(settings) {
  if (!settings.spread) return GAP;
  const spread = pageRoom(settings) / perPage(settings) - (blockHeight(settings) - GAP);
  return Math.max(GAP, Math.floor(spread * 100) / 100);
}

/** The sizes sheet.css reads, for the style of the .pages element. */
export const sheetVars = settings => `--box:${settings.box}mm;--cap:${CAPTION}mm;--gap:${blockGap(settings)}mm;`
  + `--credit:${CREDIT}mm;--gray:${settings.opacity / 100}`;

export function paginate(chars, settings) {
  const size = perPage(settings);
  const pages = [];
  for (let i = 0; i < chars.length; i += size) pages.push(chars.slice(i, i + size));
  return pages;
}

export const page = content => `<div class="sheet">${content}</div>`;

/** One page's blocks and credit line; `boxHtml(kind, char)` draws a box. */
export function pageContent(chars, settings, boxHtml, print) {
  const credit = settings.credit ? `<p class="credit">${CREDIT_LINE}</p>` : '';
  const block = char => `<div class="block">${settings.info ? caption(char, print) : ''}`
    + `<div class="boxes">${boxKinds(char, settings).map(kind => boxHtml(kind, char)).join('')}</div></div>`;
  return chars.map(block).join('') + credit;
}
