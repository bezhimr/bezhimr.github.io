/* The settings panel. Every control carries data-k="<setting name>". */

import { $ } from './util.js';
import { state, save } from './state.js';
import { boxesPerLine, boxCount, MAX_BOX } from './sheet/layout.js';
import { percent, mm, boxesHint } from './text.js';

function readControl(el) {
  if (el.type === 'checkbox') return el.checked;
  if (el.type === 'range') return +el.value;
  if (el.type === 'number') {
    const n = (el.step ? parseFloat(el.value) : parseInt(el.value, 10)) || 0;
    return Math.min(Math.max(n, +el.min), el.max ? +el.max : Infinity);
  }
  if (el.tagName === 'SELECT' && /^\d+$/.test(el.value)) return +el.value;
  return el.value;
}

export function renderSettings() {
  for (const el of document.querySelectorAll('[data-k]')) {
    /* Don't clamp the field being typed in: "3" may be on its way to "30". */
    if (el === document.activeElement) continue;
    const value = state.settings[el.dataset.k];
    if (el.type === 'checkbox') el.checked = !!value;
    else el.value = value;
  }

  document.body.dataset.tableFont = state.settings.tableFont;
  $('opacity-value').textContent = percent(state.settings.opacity);
  $('linewidth-value').textContent = mm(state.settings.lineWidth);
  /* Line width is for the liner only. */
  const isLiner = state.settings.pen === 'liner';
  $('s-linewidth').disabled = !isLiner;
  $('row-linewidth').classList.toggle('off', !isLiner);

  /* Number size matters only while stroke numbers are shown. */
  const hasNumbers = state.settings.order !== 'off';
  $('s-numbersize').disabled = !hasNumbers;
  $('row-numbersize').classList.toggle('off', !hasNumbers);

  /* Stroke order on the model needs the model box. */
  const modelForced = state.settings.order === 'model';
  const modelInput = $('row-model').querySelector('input');
  modelInput.disabled = modelForced;
  if (modelForced) modelInput.checked = true;
  $('row-model').classList.toggle('off', modelForced);

  /* The stroke count is part of the caption. */
  $('row-strokecount').querySelector('input').disabled = !state.settings.info;
  $('row-strokecount').classList.toggle('off', !state.settings.info);

  const { box } = state.settings;
  const perLine = boxesPerLine(box);
  const boxes = boxCount(state.settings);
  $('perline').textContent = boxesHint(perLine, boxes, Math.ceil(boxes / perLine), box > MAX_BOX, MAX_BOX);
}

export function initSettings(onSettingsChange) {
  const controls = document.querySelector('.controls');
  const apply = el => {
    state.settings[el.dataset.k] = readControl(el);
    save();
    onSettingsChange();
  };

  /* A dragged slider redraws at most once a frame. */
  let pending = null;
  const applyNextFrame = el => {
    if (!pending) {
      requestAnimationFrame(() => {
        const next = pending;
        pending = null;
        apply(next);
      });
    }
    pending = el;
  };

  controls.addEventListener('input', event => {
    const el = event.target.closest('[data-k]');
    if (!el) return;
    if (el.type === 'range') applyNextFrame(el);
    else apply(el);
  });

  controls.addEventListener('change', () => {
    renderSettings();   // show the value actually applied
  });
}
