/* The preview: light HTML, redrawn on every settings change. A full sheet can
 * be hundreds of pages, so it is a column of fixed A4 frames, filled only
 * while within a screen of view.
 */

import { $ } from '../util.js';
import { state } from '../state.js';
import { PLACEHOLDER } from '../text.js';
import { svg, strokeOrder, modelNumbers, linerGlyph } from './draw.js';
import { brushPreviewBox } from './brush.js';
import { sheetVars, paginate, page, pageContent } from './layout.js';

const FILL_MARGIN = 1;      // screens beyond the visible one that are kept filled

const sheetEl = $('sheet');

const placeholder = page(`<div class="blank"><b>${PLACEHOLDER.mark}</b><div>${PLACEHOLDER.text}</div></div>`);

/** Cross guides are CSS here (.box.x), not SVG. */
function previewBox(kind, char, settings) {
  const crossed = settings.guidesAll ? ' x' : '';
  const glyphBox = (cls, opacity, over = '') => (settings.pen === 'liner'
    ? `<div class="box${crossed}">${svg(linerGlyph(char, settings, opacity) + over)}</div>`
    : brushPreviewBox(cls, char, crossed, over));
  switch (kind) {
    case 'model': return glyphBox('g', 1, modelNumbers(char, settings));
    case 'trace': return glyphBox('g t', settings.opacity / 100);
    case 'order': return `<div class="box">${svg(strokeOrder(char, settings))}</div>`;
    case 'plain': return `<div class="box${crossed}"></div>`;
    case 'crossed': return '<div class="box x"></div>';
    default: return '<div class="box"></div>';
  }
}

let previewPages = [];
let fillPage = () => {};

const nearView = el => {
  const { top, bottom } = el.getBoundingClientRect();
  return bottom > -FILL_MARGIN * innerHeight && top < (1 + FILL_MARGIN) * innerHeight;
};

const pageObserver = new IntersectionObserver(entries => {
  for (const { target, isIntersecting } of entries) {
    if (!isIntersecting) target.textContent = '';
    else if (!target.hasChildNodes()) fillPage(+target.dataset.page);
  }
}, { rootMargin: `${FILL_MARGIN * 100}% 0px` });

export function renderSheet(chars) {
  const settings = state.settings;
  pageObserver.disconnect();
  sheetEl.style.cssText = sheetVars(settings);
  if (!chars.length) {
    sheetEl.innerHTML = placeholder;
    return;
  }

  previewPages = paginate(chars, settings);
  const boxHtml = (kind, char) => previewBox(kind, char, settings);
  fillPage = i => { sheetEl.children[i].innerHTML = pageContent(previewPages[i], settings, boxHtml, false); };

  sheetEl.innerHTML = previewPages.map((_, i) => `<div class="sheet" data-page="${i}"></div>`).join('');
  /* Fill what is in view now rather than flash blank pages. */
  [...sheetEl.children].forEach((el, i) => {
    if (nearView(el)) fillPage(i);
    pageObserver.observe(el);
  });
}
