/* The line above each character's boxes: the character, its stroke count,
 * readings and meanings, or romaji for kana.
 */

import { escapeHtml } from '../util.js';
import { META, OUTLINES, strokeCount } from '../data.js';
import { ROMAJI, isKatakana, toKatakana } from '../kana.js';
import { state } from '../state.js';
import * as T from '../text.js';
import { EM_BOX } from './constants.js';
import { outlineRef } from './draw.js';

/** In the printout, drawn from its outline so it needs no font. */
function captionChar(char, print) {
  return print && OUTLINES[char]
    ? `<svg class="k" viewBox="${EM_BOX}" aria-label="${char}">${outlineRef(char)}/></svg>`
    : `<span class="k">${char}</span>`;
}

const strokesLabel = strokes => (state.settings.strokeCount ? `<span>${T.strokes(strokes)}</span>` : '');

function kanjiCaption(char, print) {
  const [strokes, meanings, onReadings, kunReadings] = META[char];
  const on = onReadings.map(toKatakana).join('、');
  const kun = kunReadings.join('、');

  /* "radical" glosses say nothing, unless they are all there is. Past the
     second meaning they get obscure ("See, Hopes, Chances"). */
  const useful = meanings.filter(m => !/radical/i.test(m));
  const gloss = (useful.length ? useful : meanings).slice(0, 2).join(', ');

  return [
    captionChar(char, print),
    strokesLabel(strokes),
    on && `<span>${on}</span>`,
    kun && `<span>${kun}</span>`,
    `<span class="m">${escapeHtml(gloss)}</span>`,
  ].filter(Boolean).join('');
}

function kanaCaption(char, print) {
  return `${captionChar(char, print)}<span>${ROMAJI[char] || ''}</span>`
    + strokesLabel(strokeCount(char))
    + `<span class="m">${isKatakana(char) ? T.KATAKANA : T.HIRAGANA}</span>`;
}

function plainCaption(char) {
  return `<span class="k">${char}</span><span class="m">${T.NOT_IN_ANY_LIST}</span>`;
}

export function caption(char, print) {
  const body = META[char] ? kanjiCaption(char, print) : ROMAJI[char] ? kanaCaption(char, print) : plainCaption(char);
  return `<div class="cap">${body}</div>`;
}
