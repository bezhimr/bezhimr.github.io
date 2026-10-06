/* Printing, and saving a standalone copy with its fonts embedded. */

import { SAVED_TITLE, SAVED_FILENAME, PRINT_BUTTON } from './text.js';
import { appUrl } from './util.js';

/* The printout draws kanji from outlines, but captions and stroke numbers are
   still text. Printing before these webfonts have arrived would print them in
   a system font. Each is a single file, so loading it once covers every
   character. */
const PRINT_FONTS = ['600 1em "Klee One"', '400 1em "Zen Kaku Gothic New"', '700 1em "Zen Kaku Gothic New"'];

async function waitForFonts() {
  try {
    await Promise.all(PRINT_FONTS.map(font => document.fonts.load(font)));
  } catch {
    /* A font failed to load, or no FontFaceSet support: print anyway. */
  }
}

export async function printSheet() {
  await waitForFonts();
  window.print();
}

const fetchText = path => fetch(appUrl(path)).then(r => r.text());

const asDataUri = blob => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});

/* css/fonts.css with its font files inlined. */
async function embeddedFonts() {
  const css = await fetchText('css/fonts.css');
  const files = [...new Set([...css.matchAll(/\.\.\/(fonts\/[^"]+\.woff2)/g)].map(m => m[1]))];
  const inlined = await Promise.all(files.map(async file => [file, await fetch(appUrl(file)).then(r => r.blob()).then(asDataUri)]));
  return inlined.reduce((out, [file, dataUri]) => out.replaceAll(`../${file}`, dataUri), css);
}

export async function standaloneHtml(sheetEl) {
  const [fonts, page, sheet] = await Promise.all([embeddedFonts(), fetchText('css/standalone.css'), fetchText('css/sheet.css')]);

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${SAVED_TITLE}</title>
<style>${fonts}</style>
<style>${page}</style>
<style>${sheet}</style>
</head>
<body>
<div class="bar"><button onclick="print()">${PRINT_BUTTON}</button></div>
<div class="pages" style="${sheetEl.getAttribute('style')}">${sheetEl.innerHTML}</div>
</body>
</html>`;
}

export async function downloadSheet(sheetEl) {
  const html = await standaloneHtml(sheetEl);
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = SAVED_FILENAME;
  link.click();
  URL.revokeObjectURL(url);
}
