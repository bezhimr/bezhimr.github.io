/**
 * Every piece of text the scripts show, in one place. Labels that never change
 * are in index.html, credits and licenses in credits.js. Values containing
 * markup are HTML, the rest plain text.
 */

import { plural } from './util.js';
import { PICKER_SOURCE_NOTE } from './credits.js';

/* --- the Characters panel --- */

/** The picker's tabs, in order: [key, label]. Kanji tab keys match data/grades.json. */
export const TABS = [
  ['kanken10', 'Kanken 10級'], ['kanken9', '9級'], ['kanken8', '8級'], ['kanken7', '7級'], ['kanken6', '6級'],
  ['kanken5', '5級'], ['kanken4', '4級'], ['kanken3', '3級'], ['kanken-pre2', '準2級'], ['kanken2', '2級'],
  ['names', 'Names'],
  ['hira', 'ひらがな'], ['kata', 'カタカナ'], ['paste', 'Paste'],
];

const KANKEN_URL = 'https://en.wikipedia.org/wiki/Kanji_Kentei';
const JOYO_URL = 'https://en.wikipedia.org/wiki/Jōyō_kanji';
const JINMEIYO_URL = 'https://en.wikipedia.org/wiki/Jinmeiyō_kanji';

const kankenAbout = (level, stage) => n => `<a href="${KANKEN_URL}" target="_blank"
  rel="noopener">Kanken</a> level ${level} adds <b>${n} kanji</b>, roughly what's
  learned by ${stage}. Levels 10級 to 2級 add up to the 2,136
  <a href="${JOYO_URL}" target="_blank" rel="noopener">jōyō kanji</a>.`;

const endOfGrade = n => `the end of elementary school grade ${n}`;

const GROUP_ABOUT = {
  kanken10: kankenAbout('10 (10級)', endOfGrade(1)),
  kanken9: kankenAbout('9 (9級)', endOfGrade(2)),
  kanken8: kankenAbout('8 (8級)', endOfGrade(3)),
  kanken7: kankenAbout('7 (7級)', endOfGrade(4)),
  kanken6: kankenAbout('6 (6級)', endOfGrade(5)),
  kanken5: kankenAbout('5 (5級)', endOfGrade(6)),
  kanken4: kankenAbout('4 (4級)', 'mid junior high'),
  kanken3: kankenAbout('3 (3級)', 'the end of junior high'),
  'kanken-pre2': kankenAbout('pre-2 (準2級)', 'mid high school'),
  kanken2: kankenAbout('2 (2級)', 'the end of high school'),
  names: n => `<b>${n}</b> <a href="${JINMEIYO_URL}" target="_blank"
    rel="noopener">jinmeiyō kanji</a>, the extra characters allowed in Japanese names.`,
};

const SHIFT_HINT = 'Shift-click to select or clear a range.';

/** The note under a kanji tab: a list of paragraphs. */
export const groupAbout = (group, n) => [
  GROUP_ABOUT[group](n),
  ['Most common first.', PICKER_SOURCE_NOTE, SHIFT_HINT].join(' '),
];

export const ALL = n => `All ${n}`;
export const ALL_OF_GROUP = 'Select or clear the whole tab';

export const KANA_ALL = 'All';
export const KANA_ALL_OF_TABLE = 'Whole table';
export const KANA_COLUMNS = ['a', 'i', 'u', 'e', 'o'];
export const kanaRow = romaji => `Row ${romaji}`;
export const DAKUTEN_HEADING = 'With dakuten and handakuten';

export function kanaAbout(script) {
  const name = script === 'kata' ? 'katakana' : 'hiragana';
  const small = script === 'kata' ? 'ャ ュ ョ ッ' : 'ゃ ゅ ょ っ';
  return `<b>46 basic ${name}</b> plus 25 with dakuten and handakuten. Small kana (${small})
    are written the same as the full-size ones, so they are not listed separately.
    Tap a row label to add the whole row.`;
}

/** The hover hint of a character without data. */
export const NO_DATA_HINT = 'Not in any list: no stroke data';

export const PASTE = {
  label: 'Paste any text. Every kanji and kana in it is selected.',
  placeholder: '日本語を勉強します',
  note: `Not every kanji has stroke data: only the 2,136 jōyō kanji, the
    jinmeiyō name kanji, and kana, do. The rest stay selected but are left off the sheet for now.`,
  button: 'Add to selection',
  about: `Kanji and kana with stroke data show up selected in their own tabs. Other kanji are
    listed here, where they can be turned off and on again.`,
  extrasHeader: 'Not in any list · no stroke data',
  extrasAll: 'Select or clear every pasted kanji',
};

export const pasteResult = (added, skipped) => `Added ${plural(added, 'character')}.`
  + (skipped.length ? ` Skipped, no practice data: ${skipped.join(' ')}` : '');

/* --- the Settings panel --- */

export const percent = n => `${n}%`;
export const mm = n => `${n.toFixed(1)} mm`;

export const boxesHint = (perLine, boxes, lines, tooWide, maxBox) =>
  `${plural(perLine, 'box fits', 'boxes fit')} on a line. `
  + `Each character uses ${plural(boxes, 'box', 'boxes')} (${plural(lines, 'line')}).`
  + (tooWide ? ` Boxes over ${maxBox} mm are wider than the page and get cut off.` : '');

/* --- selection and sheet state --- */

const LIST_MAX = 20;
const listOf = chars => chars.slice(0, LIST_MAX).join(' ')
  + (chars.length > LIST_MAX ? ` and ${chars.length - LIST_MAX} more` : '');

export const SELECTED = n => `${n} selected`;

/* Tooltips on Print and Save. */
export const STATUS = {
  print: 'Print the sheet',
  save: 'Save the sheet as a file that prints anywhere, no internet or fonts needed',
  undrawn: chars => `. Not drawn, the liner has no stroke data for ${listOf(chars)}.`,
};

/* --- the sheet --- */

export const PLACEHOLDER = { mark: '練', text: 'Pick characters on the left.' };

export const strokes = n => plural(n, 'stroke');
export const HIRAGANA = 'hiragana';
export const KATAKANA = 'katakana';
export const NOT_IN_ANY_LIST = 'not in any list';

/* --- saved sheets --- */

export const SAVED_TITLE = '練習帳 practice sheet';
export const SAVED_FILENAME = 'renshucho-sheet.html';
export const PRINT_BUTTON = 'Print';
