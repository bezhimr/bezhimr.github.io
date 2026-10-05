/* The printout, built for printing or saving: all SVG, with glyphs drawn from
 * outlines, so it needs no font.
 */

import { $ } from '../util.js';
import { state } from '../state.js';
import { VIEWBOX } from './constants.js';
import { box, crossGuides, strokeOrder, modelNumbers, linerGlyph, resetOutlines, defsHtml } from './draw.js';
import { brushGlyph } from './brush.js';
import { sheetVars, paginate, page, pageContent } from './layout.js';

const printoutEl = $('printout');

function printBox(kind, char, settings, guides) {
  const glyph = settings.pen === 'liner' ? linerGlyph : brushGlyph;
  const under = settings.guidesAll ? guides : '';
  const gray = settings.opacity / 100;
  switch (kind) {
    case 'model': return box(under + glyph(char, settings, 1) + modelNumbers(char, settings));
    case 'trace': return box(under + glyph(char, settings, gray));
    case 'order': return box(strokeOrder(char));
    case 'plain': return box(under);
    case 'crossed': return box(guides);
    default: return box('');
  }
}

export function renderPrintout(chars) {
  const settings = state.settings;
  const guides = crossGuides(VIEWBOX / settings.box);
  resetOutlines();
  const boxHtml = (kind, char) => printBox(kind, char, settings, guides);
  const pages = paginate(chars, settings).map(chars => page(pageContent(chars, settings, boxHtml, true))).join('');
  printoutEl.style.cssText = sheetVars(settings);
  printoutEl.innerHTML = defsHtml() + pages;   // defs last to build: the pages fill the set of used outlines
  /* Force layout: Firefox prints a <use> never laid out as nothing. */
  printoutEl.getBoundingClientRect();
  return printoutEl;
}

export function clearPrintout() {
  printoutEl.innerHTML = '';
}
