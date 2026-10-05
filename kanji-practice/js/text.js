/**
 * Every piece of text the scripts show, in one place. Labels that never change
 * are in index.html, credits and licenses in credits.js. Values containing
 * markup are HTML, the rest plain text.
 */

import { plural } from './util.js';
import { PICKER_SOURCE_NOTE } from './credits.js';

/* --- the Characters panel --- */

/** The picker's tabs, in order: [key, label]. Grade keys match data/grades.json. */
export const TABS = [
  ['grade1', 'Grade 1'], ['grade2', '2'], ['grade3', '3'], ['grade4', '4'], ['grade5', '5'], ['grade6', '6'],
  ['secondary', 'Secondary'], ['names', 'Names'],
  ['hira', 'ひらがな'], ['kata', 'カタカナ'], ['paste', 'Paste'],
];

const GRADE_ABOUT = {
  secondary: n => `<b>${n} kanji</b> taught in secondary school: the rest of the 2,136 jōyō kanji, Japan's
    official list for everyday use, that come after the six elementary grades.`,
  names: n => `<b>${n} jinmeiyō kanji</b>, allowed in personal names on top of the jōyō ones. The last
    ones are older forms of jōyō kanji, still seen in names (澤, 廣).`,
};

const SHIFT_HINT = 'Shift-click a second kanji to select or clear everything between it and the last one clicked.';

/** The note under a grade tab. */
export const gradeAbout = (grade, n) => [
  GRADE_ABOUT[grade] ? GRADE_ABOUT[grade](n) : `<b>${n} kanji</b> taught in year ${grade.slice(-1)} of elementary school in Japan.`,
  'Most common first.', PICKER_SOURCE_NOTE, SHIFT_HINT,
].join(' ');

export const ALL = n => `All ${n}`;
export const ALL_OF_GRADE = 'Select or clear the whole grade';

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

/* --- the status line --- */

const LIST_MAX = 20;
const listOf = chars => chars.slice(0, LIST_MAX).join(' ')
  + (chars.length > LIST_MAX ? ` and ${chars.length - LIST_MAX} more` : '');

export const STATUS = {
  notGenerated: n => `${n} selected. Press Generate to lay them out.`,
  stale: 'Selection changed. Press Generate to update the sheet.',
  shows: n => `Sheet shows ${plural(n, 'character')}. Layout changes apply right away.`,
  undrawn: chars => ` Not drawn, the liner has no stroke data for ${listOf(chars)}.`,
  nothing: 'Select characters and generate a sheet first.',
};

/* --- the sheet --- */

export const PLACEHOLDER = { mark: '練', text: 'Pick characters on the left, then press Generate.' };

export const strokes = n => plural(n, 'stroke');
export const HIRAGANA = 'hiragana';
export const KATAKANA = 'katakana';
export const NOT_IN_ANY_LIST = 'not in any list';

/* --- saved sheets --- */

export const SAVED_TITLE = '練習帳 practice sheet';
export const SAVED_FILENAME = 'renshucho-sheet.html';
export const PRINT_BUTTON = 'Print';
