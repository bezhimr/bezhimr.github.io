/* Wiring. Panels render themselves and report changes here. */

import { $ } from './util.js';
import { state, save, load } from './state.js';
import { STROKES, ensureLoaded, ensureOutlines } from './data.js';
import { renderTabs, renderPicker, refreshPicker, initPicker } from './picker.js';
import { renderSettings, initSettings } from './settings.js';
import { renderSheet } from './sheet/preview.js';
import { renderPrintout, clearPrintout } from './sheet/printout.js';
import { USAGE_HTML, INSPIRED_BY_HTML, DETAILS_SUMMARY, SOURCES, SOURCES_NOTE } from './credits.js';
import { printSheet, downloadSheet } from './export.js';
import { STATUS, SELECTED } from './text.js';

/* The selection as of the last Generate. */
let sheetChars = [];

/* The liner needs stroke data; characters without it are left off the sheet. */
const undrawn = () => (state.settings.pen === 'liner' ? sheetChars.filter(char => !STROKES[char]) : []);

function drawnChars() {
  const skip = new Set(undrawn());
  return sheetChars.filter(char => !skip.has(char));
}

/* No status line: a dot and a tooltip on Generate say the sheet lags the
   selection, and Print and Save are off while there is nothing to print. */
function renderStatus() {
  const selected = [...state.selected];
  const stale = sheetChars.length !== selected.length || sheetChars.some((char, i) => char !== selected[i]);
  const left = undrawn();
  const generateEl = $('generate');
  generateEl.classList.toggle('stale', stale);
  generateEl.title = stale ? STATUS.stale : STATUS.upToDate + (left.length ? `.${STATUS.undrawn(left)}` : '');
  const nothing = !sheetChars.length && !selected.length;
  $('print').disabled = $('download').disabled = nothing;
}

/* Kept in place while empty, so the bar never shifts. */
function renderCount() {
  const n = state.selected.size;
  $('count').textContent = n ? SELECTED(n) : '';
  $('selection').classList.toggle('empty', !n);
}

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
  if (!drawnChars().length) return;   // Generate's tooltip says why
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

$('usage').innerHTML = USAGE_HTML;
$('inspired-by').innerHTML = INSPIRED_BY_HTML;
$('details-summary').textContent = DETAILS_SUMMARY;
$('sources').innerHTML = SOURCES.map(line => `<li>${line}</li>`).join('');
$('sources-note').textContent = SOURCES_NOTE;

renderView();
renderTabs();
renderPicker();
renderCount();
renderSettings();

if (isFirstVisit) await generate();
else { renderSheet(sheetChars); renderStatus(); }
