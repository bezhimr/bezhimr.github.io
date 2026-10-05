/**
 * Every credit, license name and license link in one place. Edit here and the
 * credits panel, the per-page credit line on the sheets and the picker hints
 * all follow. Values containing markup are HTML, the rest plain text.
 */

const a = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;

export const LICENSES = {
  ccBySa3: { name: 'CC BY-SA 3.0', url: 'https://creativecommons.org/licenses/by-sa/3.0/' },
  ccBySa4: { name: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  edrdg:   { name: 'EDRDG licence', url: 'https://www.edrdg.org/edrdg/licence.html' },
  ofl:     { name: 'SIL OFL 1.1', url: 'https://openfontlicense.org/' },
};
const lic = (key) => a(LICENSES[key].url, LICENSES[key].name);

const INSPIRATION_URL = 'https://jensechu.github.io/kanji/index.html';

/** Top of the credits panel: what you may do, in one breath. */
export const USAGE_HTML =
  'Print, share or sell the sheets as you like. If they leave your hands, '
  + 'keep the credit line on: the stroke order and readings data require it.';

export const INSPIRED_BY_HTML = 'Inspired by '
  + (INSPIRATION_URL ? a(INSPIRATION_URL, "jensechu's kanji worksheet generator")
                     : "jensechu's kanji worksheet generator") + '.';

/** Label of the collapsible block holding SOURCES and SOURCES_NOTE. */
export const DETAILS_SUMMARY = 'License details';

/** Inside the details block: one short line of HTML per source and its license. */
export const SOURCES = [
  `Stroke order: ${a('https://kanjivg.tagaini.net/', 'KanjiVG')} © Ulrich Apel, ${lic('ccBySa3')}`,
  `Readings: ${a('https://www.edrdg.org/wiki/index.php/KANJIDIC_Project', 'KANJIDIC2')} © EDRDG, `
    + `${lic('ccBySa4')}, ${lic('edrdg')}`,
  `Fonts: ${a('https://fonts.google.com/specimen/Klee+One', 'Klee One')}, `
    + `${a('https://fonts.google.com/specimen/Zen+Kaku+Gothic+New', 'Zen Kaku Gothic New')}, ${lic('ofl')}`,
];

export const SOURCES_NOTE = 'The bundled data is shared under the same licenses.';

/** A license with its address spelled out, for paper where links don't work. */
const printedLic = (key) => `${LICENSES[key].name} (${LICENSES[key].url.replace(/^https:\/\/|\/$/g, '')})`;

/** Printed at the foot of every sheet page. */
export const CREDIT_LINE = `Stroke order: KanjiVG © Ulrich Apel, ${printedLic('ccBySa3')}. `
  + `Readings and meanings: KANJIDIC2 © EDRDG, ${printedLic('ccBySa4')}. `
  + 'Font: Klee One by Fontworks.';

/** Short source note under each grade tab. */
export const PICKER_SOURCE_NOTE = 'Stroke order from KanjiVG, readings from KANJIDIC2.';
