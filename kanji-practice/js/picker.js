/* The "Characters" panel: a tab per Kanken level, one for name kanji, per kana syllabary, and one for
 * pasting text. A tab is drawn once; selection changes only restyle its
 * buttons, so scrolling survives a click. Group buttons carry their characters
 * in data-g.
 */

import { $, escapeHtml } from './util.js';
import { GRADES, META, ensureLoaded } from './data.js';
import { BASIC_ROWS, DAKUTEN_ROWS, KANA, ROMAJI, isKatakana, toKatakana } from './kana.js';
import { state, save, isSelected, isSelectable, select, deselect, addExtras, toggleGroup } from './state.js';
import * as T from './text.js';

const TAB_CHARS = {
  ...Object.fromEntries(Object.entries(GRADES).map(([key, chars]) => [key, [...chars]])),
  hira: [...KANA].filter(c => !isKatakana(c)),
  kata: [...KANA].filter(isKatakana),
};
const charsOfTab = key => (key === 'paste' ? [...state.extras] : TAB_CHARS[key]);

const tabsEl = $('tabs');
const pickerEl = $('picker');

function groupFill(chars) {
  const selectedCount = chars.filter(isSelected).length;
  return selectedCount === 0 ? '' : selectedCount === chars.length ? 'full' : 'part';
}

function groupButton(chars, label, title) {
  return `<button class="g ${groupFill(chars)}" data-g="${chars.join('')}" title="${escapeHtml(title)}">${label}</button>`;
}

function charButton(char) {
  const on = isSelected(char);
  const hint = META[char] ? META[char][1].join(', ') : ROMAJI[char] || T.NO_DATA_HINT;
  return `<button class="ch${on ? ' on' : ''}" data-c="${char}" aria-pressed="${on}"`
    + ` title="${escapeHtml(hint)}">${char}</button>`;
}

export function renderTabs() {
  tabsEl.innerHTML = T.TABS.map(([key, label]) => {
    const count = charsOfTab(key).filter(isSelected).length;
    const has = count ? ` has" title="${T.SELECTED(count)}` : '';
    return `<button class="tab${has}" aria-selected="${state.tab === key}" data-tab="${key}">${label}</button>`;
  }).join('');
}

/* --- tabs --- */

/* about: one paragraph, or a list of them. */
const layout = ({ body, about = [] }) =>
  `<div class="body">${body}</div>`
  + (about.length ? `<div class="about">${[about].flat().map(p => `<p>${p}</p>`).join('')}</div>` : '');

const SECTION = 50;   // kanji per numbered section

const header = (label, button = '') => `<span class="sec"><span>${label}</span>${button}</span>`;

const allButton = (chars, title) => groupButton(chars, T.ALL(chars.length), title);

const sectionedGrid = (chars, button = '') => `<div class="grid">${chars.map((char, i) =>
  (i % SECTION ? '' : header(`${i + 1}–${Math.min(i + SECTION, chars.length)}`, i ? '' : button)) + charButton(char)).join('')}</div>`;

function groupHtml(group) {
  const chars = [...GRADES[group]];
  return layout({
    body: sectionedGrid(chars, allButton(chars, T.ALL_OF_GROUP)),
    about: T.groupAbout(group, chars.length),
  });
}

/* Six columns: the row button, then a i u e o (unlabelled). */
function kanaGridHtml(rows, script) {
  const convert = script === 'kata' ? toKatakana : (s => s);
  const cellsOf = chars => [...convert(chars)];
  const present = cells => cells.filter(c => c !== '_');

  const head = groupButton(rows.flatMap(([chars]) => present(cellsOf(chars))), T.KANA_ALL, T.KANA_ALL_OF_TABLE)
    + '<span></span>'.repeat(5);

  const body = rows.map(([chars, romaji]) => {
    const cells = cellsOf(chars);
    return groupButton(present(cells), cells[0], T.kanaRow(romaji.split(' ')[0]))
      + cells.map(c => (c === '_' ? '<span></span>' : charButton(c))).join('');
  }).join('');

  return `<div class="kana">${head}${body}</div>`;
}

function kanaHtml(script) {
  return layout({
    body: kanaGridHtml(BASIC_ROWS, script)
      + `<p class="sub">${T.DAKUTEN_HEADING}</p>`
      + kanaGridHtml(DAKUTEN_ROWS, script),
    about: T.kanaAbout(script),
  });
}

function extrasHtml() {
  const chars = [...state.extras];
  if (!chars.length) return '';
  return `<div class="grid extras">${header(T.PASTE.extrasHeader, allButton(chars, T.PASTE.extrasAll))}`
    + `${chars.map(charButton).join('')}</div>`;
}

function pasteHtml(message = '', warn = false) {
  return layout({
    body: `
      <label for="pastebox" class="sub">${T.PASTE.label}</label>
      <textarea id="pastebox" placeholder="${T.PASTE.placeholder}"></textarea>
      <p class="note">${T.PASTE.note}</p>
      <button class="btn" id="pasteadd">${T.PASTE.button}</button>
      <p class="note${warn ? ' warn' : ''}" id="pastemsg">${escapeHtml(message)}</p>
      ${extrasHtml()}`,
    about: T.PASTE.about,
  });
}

export async function renderPicker() {
  if (!T.TABS.some(([key]) => key === state.tab)) state.tab = 'kanken10';   // saved by an older version
  const tab = state.tab;
  if (tab === 'paste') { pickerEl.innerHTML = pasteHtml(); return; }
  if (tab === 'hira' || tab === 'kata') { pickerEl.innerHTML = kanaHtml(tab); return; }

  let html;
  try {
    await ensureLoaded(GRADES[tab]);
    html = groupHtml(tab);
  } catch (error) {
    html = layout({ body: `<p class="note warn">${escapeHtml(error.message)}</p>` });
  }
  if (state.tab === tab) pickerEl.innerHTML = html;   // a slow fetch may be stale
}

export function refreshPicker() {
  for (const el of pickerEl.querySelectorAll('[data-c]')) {
    const on = isSelected(el.dataset.c);
    el.classList.toggle('on', on);
    el.setAttribute('aria-pressed', on);
  }
  for (const el of pickerEl.querySelectorAll('[data-g]')) {
    const fill = groupFill([...el.dataset.g]);
    el.classList.toggle('part', fill === 'part');
    el.classList.toggle('full', fill === 'full');
  }
}

/* --- paste --- */

const IS_JAPANESE = /[぀-ヿ一-鿿]/;

function addPastedText() {
  const chars = [...new Set($('pastebox').value)];
  const added = chars.filter(c => isSelectable(c) && !isSelected(c));
  const skipped = chars.filter(c => !isSelectable(c) && IS_JAPANESE.test(c));

  addExtras(chars);
  select(added);
  pickerEl.innerHTML = pasteHtml(T.pasteResult(added.length, skipped), skipped.length > 0);
}

/* --- shift-click ranges --- */

/* A shift-click gives everything from the last plain-clicked character up to
   this one that character's state. */
let anchor = null;

function rangeTo(char) {
  const shown = [...pickerEl.querySelectorAll('[data-c]')].map(el => el.dataset.c);
  const from = shown.indexOf(anchor);
  const to = shown.indexOf(char);
  if (from < 0) return null;
  return shown.slice(Math.min(from, to), Math.max(from, to) + 1);
}

function clickChar(char, shift) {
  const range = shift && rangeTo(char);
  if (!range) {
    toggleGroup([char]);
    anchor = char;
  } else if (isSelected(anchor)) select(range);
  else deselect(range);
}

/* --- wiring --- */

export function initPicker(onSelectionChange) {
  tabsEl.addEventListener('click', event => {
    const button = event.target.closest('[data-tab]');
    if (!button || button.dataset.tab === state.tab) return;
    state.tab = button.dataset.tab;
    save();
    renderTabs();
    renderPicker();
  });

  /* Keep shift-click from selecting page text. */
  pickerEl.addEventListener('mousedown', event => {
    if (event.shiftKey && event.target.closest('[data-c]')) event.preventDefault();
  });

  pickerEl.addEventListener('click', event => {
    const button = event.target.closest('[data-c], [data-g]');
    if (button?.dataset.c) clickChar(button.dataset.c, event.shiftKey);
    else if (button) toggleGroup([...button.dataset.g]);
    else if (event.target.id === 'pasteadd') addPastedText();
    else return;
    onSelectionChange();
  });
}
