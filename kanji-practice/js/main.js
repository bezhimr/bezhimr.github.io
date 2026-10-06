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

/* The selection as drawn on the sheet. */
let sheetChars = [];

/* The liner needs stroke data; characters without it are left off the sheet. */
const undrawn = () => (state.settings.pen === 'liner' ? sheetChars.filter(char => !STROKES[char]) : []);

function drawnChars() {
  const skip = new Set(undrawn());
  return sheetChars.filter(char => !skip.has(char));
}

/* No status line: Print and Save are off while there is nothing to print, and
   their tooltips say which characters the sheet leaves out. */
function renderStatus() {
  const left = undrawn();
  const note = left.length ? STATUS.undrawn(left) : '';
  $('print').title = STATUS.print + note;
  $('download').title = STATUS.save + note;
  $('print').disabled = $('download').disabled = !sheetChars.length;
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
  generate();
}

function renderView() {
  for (const el of $('views').children) el.setAttribute('aria-selected', el.dataset.view === state.view);
  $('view-chars').hidden = state.view !== 'chars';
  $('view-settings').hidden = state.view !== 'settings';
}

const loadOutlines = () => ensureOutlines(sheetChars);

function onSettingsChange() {
  renderSettings();
  generate();
}

/* The sheet follows the selection. A slow data fetch for an older selection
   must not draw over a newer one. */
let drawing = 0;
async function generate() {
  sheetChars = [...state.selected];
  const mine = ++drawing;
  renderStatus();
  await ensureLoaded(sheetChars);
  if (mine !== drawing) return;
  renderSheet(drawnChars());
  renderStatus();
  loadOutlines().catch(() => {});   // only printing needs them, so they load in the background
}

const withPrintout = action => async () => {
  if (!drawnChars().length) return;   // the tooltip says why
  await loadOutlines();
  await action(renderPrintout(drawnChars()));
};

load();
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
$('license-close').addEventListener('click', () => { document.querySelector('.license').open = false; });

renderView();
renderTabs();
renderPicker();
renderCount();
renderSettings();

await generate();
