/* The kana tables, from data/kana-table.json: hiragana by row, a i u e o,
 * each row with its romaji; `_` is a hole (no や-i). Katakana is hiragana
 * shifted by 0x60.
 */

import { fetchJson } from './util.js';

const TABLES = await fetchJson('data/kana-table.json');

export const BASIC_ROWS = TABLES.basic;

/* Rows with dakuten (゛) and handakuten (゜). */
export const DAKUTEN_ROWS = TABLES.dakuten;

export const toKatakana = s => s.replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));

export const isKatakana = c => /[゠-ヿ]/.test(c);

const HIRAGANA = [...BASIC_ROWS, ...DAKUTEN_ROWS].map(([chars]) => chars.replaceAll('_', '')).join('');

/** Every kana in the tables, hiragana then katakana. */
export const KANA = HIRAGANA + toKatakana(HIRAGANA);

/** Every kana, hiragana and katakana alike, mapped to its romaji. */
export const ROMAJI = {};
for (const [chars, romaji] of [...BASIC_ROWS, ...DAKUTEN_ROWS]) {
  const syllables = romaji.split(' ');
  [...chars].forEach((char, i) => {
    if (char !== '_') ROMAJI[char] = ROMAJI[toKatakana(char)] = syllables[i];
  });
}
