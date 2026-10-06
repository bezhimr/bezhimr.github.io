export const $ = id => document.getElementById(id);

const HTML_ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

/** Escape text before dropping it into a template string that becomes innerHTML. */
export const escapeHtml = s => String(s).replace(/[&<>"]/g, c => HTML_ENTITIES[c]);

/** plural(3, 'box', 'boxes') -> '3 boxes' */
export const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;

/** A path inside the app folder (data/..., css/...), resolved from this file
    rather than from the page, so the page can live anywhere on the site. */
export const appUrl = path => new URL(`../${path}`, import.meta.url);

export async function fetchJson(path) {
  const response = await fetch(appUrl(path));
  if (!response.ok) throw new Error(`Could not load ${path} (${response.status})`);
  return response.json();
}
