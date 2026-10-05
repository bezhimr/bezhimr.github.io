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
  ofl:     { name: 'SIL Open Font License 1.1', url: 'https://openfontlicense.org/' },
};

/** The credits panel: [what it is used for, credit as HTML]. */
export const SOURCES = [
  ['Stroke order and stroke paths',
    `${a('https://kanjivg.tagaini.net/', 'KanjiVG')} © Ulrich Apel and contributors, ${LICENSES.ccBySa3.name}.`],
  ['School grades, readings, meanings and stroke counts',
    `${a('https://www.edrdg.org/wiki/index.php/KANJIDIC_Project', 'KANJIDIC2')} © Electronic Dictionary Research and Development Group, ${LICENSES.ccBySa4.name}.`],
  ['Fonts',
    `${a('https://fonts.google.com/specimen/Klee+One', 'Klee One')} by Fontworks and `
    + `${a('https://fonts.google.com/specimen/Zen+Kaku+Gothic+New', 'Zen Kaku Gothic New')} by Yoshimichi Ohira, ${LICENSES.ofl.name}.`],
];

export const SOURCES_NOTE = "The bundled data is shared under the same licenses. Inspired by jensechu's kanji worksheet generator.";

/** The "actual terms" line at the end of the license summary. */
export const LEGAL_HTML = 'This is a plain summary, not legal advice. The actual terms: '
  + `${a(LICENSES.ccBySa3.url, LICENSES.ccBySa3.name)} (KanjiVG), `
  + `${a(LICENSES.edrdg.url, LICENSES.edrdg.name)}, i.e. ${a(LICENSES.ccBySa4.url, LICENSES.ccBySa4.name)} (KANJIDIC2), `
  + `${a(LICENSES.ofl.url, LICENSES.ofl.name)} (fonts).`;

/** Printed at the foot of every sheet page. */
export const CREDIT_LINE = `Stroke order: KanjiVG © Ulrich Apel, ${LICENSES.ccBySa3.name}. `
  + `Readings and meanings: KANJIDIC2 © EDRDG, ${LICENSES.ccBySa4.name}. `
  + 'Font: Klee One by Fontworks.';

/** Short source note under each grade tab. */
export const PICKER_SOURCE_NOTE = 'Stroke order from KanjiVG, readings from KANJIDIC2.';
