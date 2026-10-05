/* Wiring. Panels render themselves and report changes here. */

import { $ } from './util.js';
import { state, save, load } from './state.js';
import { STROKES, ensureLoaded, ensureOutlines } from './data.js';
import { renderTabs, renderPicker, refreshPicker, initPicker } from './picker.js';
import { renderSettings, initSettings } from './settings.js';
import { renderSheet } from './sheet/preview.js';
import { renderPrintout, clearPrintout } from './sheet/printout.js';
import { SOURCES, SOURCES_NOTE, LEGAL_HTML } from './credits.js';
import { printSheet, downloadSheet } from './export.js';
import { STATUS } from './text.js';

/* The selection as of the last Generate. */
let sheetChars = [];

/* The liner needs stroke data; characters without it are left off the sheet. */
const undrawn = () => (state.settings.pen === 'liner' ? sheetChars.filter(char => !STROKES[char]) : []);

function drawnChars() {
  const skip = new Set(undrawn());
  return sheetChars.filter(char => !skip.has(char));
}

const statusEl = $('status');

/** `stale`: the sheet lags the selection. `warn`: something selected is not on it. */
function setStatus(text, stale = false, warn = stale) {
  statusEl.textContent = text;
  statusEl.classList.toggle('warn', warn);
  $('generate').classList.toggle('stale', stale);
}

function renderStatus() {
  const selected = [...state.selected];
  if (!sheetChars.length) {
    return setStatus(selected.length ? STATUS.notGenerated(selected.length) : '');
  }
  const upToDate = sheetChars.length === selected.length
    && sheetChars.every((char, i) => char === selected[i]);
  if (!upToDate) return setStatus(STATUS.stale, true);
  const left = undrawn();
  setStatus(STATUS.shows(sheetChars.length - left.length) + (left.length ? STATUS.undrawn(left) : ''), false, left.length > 0);
}

const renderCount = () => { $('count').textContent = state.selected.size || ''; };

function onSelectionChange() {
  save();
  refreshPicker();
  renderTabs();
  renderCount();
  renderStatus();
}

function renderView() {
  for (const el of $('views').children) el.setAttribute('aria-selected', el.dataset.view === state.view);
  $('view-chars').hidden = state.view !== 'chars';
  $('view-settings').hidden = state.view !== 'settings';
}

const loadOutlines = () => ensureOutlines(sheetChars);

/* Outlines are only for printing, so they load in the background. */
async function drawSheet() {
  await ensureLoaded(sheetChars);
  renderSheet(drawnChars());
  loadOutlines().catch(() => {});
}

function onSettingsChange() {
  renderSettings();
  drawSheet().then(renderStatus);
}

async function generate() {
  sheetChars = [...state.selected];
  await drawSheet();
  renderStatus();
}

const withPrintout = action => async () => {
  if (!sheetChars.length && state.selected.size) await generate();
  if (!sheetChars.length) return setStatus(STATUS.nothing, true);
  if (!drawnChars().length) return;   // the status line says why
  await loadOutlines();
  await action(renderPrintout(drawnChars()));
};

const isFirstVisit = load();
initPicker(onSelectionChange);
initSettings(onSettingsChange);

$('views').addEventListener('click', event => {
  const button = event.target.closest('[data-view]');
  if (!button) return;
  state.view = button.dataset.view;
  save();
  renderView();
});

$('clear').addEventListener('click', () => {
  state.selected.clear();
  onSelectionChange();
});

$('generate').addEventListener('click', generate);

$('print').addEventListener('click', withPrintout(printSheet));
$('download').addEventListener('click', withPrintout(async printout => {
  await downloadSheet(printout);
  clearPrintout();
}));

/* The browser's own print menu prints the printout too. */
addEventListener('beforeprint', () => {
  if (!$('printout').hasChildNodes()) renderPrintout(drawnChars());
});
addEventListener('afterprint', clearPrintout);

$('sources').innerHTML = SOURCES.map(([what, who]) => `<dt>${what}</dt><dd>${who}</dd>`).join('');
$('sources-note').textContent = SOURCES_NOTE;
$('legal').innerHTML = LEGAL_HTML;

renderView();
renderTabs();
renderPicker();
renderCount();
renderSettings();

if (isFirstVisit) await generate();
else { renderSheet(sheetChars); renderStatus(); }
