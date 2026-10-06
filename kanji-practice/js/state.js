/* All mutable state, persisted to localStorage. */

import { isPractisable, isKanji } from './data.js';

const DEFAULT_SETTINGS = {
  trace: 3,          // boxes with a faint glyph to trace over
  guide: 3,          // empty boxes with dotted cross guides
  blank: 2,          // entirely empty boxes
  box: 18,           // box edge in mm
  pen: 'liner',      // model and tracing glyphs: 'brush' (Klee One SemiBold) or 'liner' (thin KanjiVG stroke lines)
  lineWidth: 0.5,    // the liner's line, in mm on paper whatever the box size
  opacity: 20,       // strength of the gray glyphs, in percent
  order: 'box',      // stroke order: 'box' (its own first box), 'model' (numbered on the model) or 'off'
  model: true,       // the character in solid ink, to copy from
  gray: true,
  guidesAll: true,   // cross guides behind the model and tracing glyphs; crossed boxes always have them
  info: true,
  strokeCount: true, // "12 strokes" in the caption
  credit: true,
  tableFont: 'default', // font of the characters in the picker tables: 'default' (the system's) or 'klee' (handwriting)
  spread: true,      // spread blocks down the page; off packs them at the top
};

const STORAGE_KEY = 'renshucho.v2';

const DEFAULT_SELECTION = '今日は';

export const state = {
  view: 'chars',     // or 'settings'
  tab: 'kanken10',
  /* Insertion order is the order on the sheet. */
  selected: new Set(),
  /* Pasted kanji without stroke data; they stay listed once added. */
  extras: new Set(),
  settings: { ...DEFAULT_SETTINGS },
};

export function save() {
  const saved = {
    view: state.view,
    tab: state.tab,
    selected: [...state.selected].join(''),
    extras: [...state.extras].join(''),
    settings: state.settings,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    /* Private browsing or a full quota. */
  }
}

/** Restore saved state. Returns true on a first visit. */
export function load() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
  } catch {
    /* Corrupt storage: use the defaults. */
  }
  if (saved.view) state.view = saved.view;
  if (saved.tab) state.tab = saved.tab;
  const settings = { ...saved.settings };
  if ('direction' in settings) {   // older saves: a stroke order box, on or off
    settings.order ??= settings.direction ? 'box' : 'off';
    delete settings.direction;
  }
  Object.assign(state.settings, settings);
  /* The brush pen is paused, see js/sheet/brush.js. To bring it back, drop
     this line and unhide its setting in renshucho.html. */
  state.settings.pen = 'liner';

  const isFirstVisit = !('selected' in saved);
  select(isFirstVisit ? DEFAULT_SELECTION : saved.selected);
  addExtras([...(saved.extras || ''), ...state.selected]);   // older saves have no extras list
  return isFirstVisit;
}

export const isSelected = char => state.selected.has(char);

/** Every listed kanji and basic kana, and any other kanji. */
export const isSelectable = char => isPractisable(char) || isKanji(char);

/** Remember kanji without stroke data, for the Paste tab. */
export function addExtras(chars) {
  for (const char of chars) {
    if (isKanji(char) && !isPractisable(char)) state.extras.add(char);
  }
}

export function select(chars) {
  for (const char of chars) {
    if (isSelectable(char)) state.selected.add(char);
  }
}

export function deselect(chars) {
  for (const char of chars) state.selected.delete(char);
}

/** Select the whole group, unless it is already fully selected — then clear it. */
export function toggleGroup(chars) {
  const usable = chars.filter(isSelectable);
  if (usable.every(isSelected)) deselect(usable);
  else select(usable);
}
