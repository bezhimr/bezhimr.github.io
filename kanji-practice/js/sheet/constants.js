/* Boxes are SVGs in KanjiVG's coordinate square, sized in mm by CSS. */
export const VIEWBOX = 109;
export const CENTER = VIEWBOX / 2;

/* Klee One in the same square: a 98-unit em, ascender at 0.88 em. */
export const GLYPH_SIZE = 98;
export const BASELINE = CENTER - GLYPH_SIZE / 2 + GLYPH_SIZE * 0.88;
export const OUTLINE_EM = 500;
export const EM_BOX = `${CENTER - GLYPH_SIZE / 2} ${CENTER - GLYPH_SIZE / 2} ${GLYPH_SIZE} ${GLYPH_SIZE}`;

export const SKELETON_WIDTH = 3.2;  // KanjiVG strokes in the stroke-order box
export const INK = '#080806';
export const SHU = '#C4342A';       // 朱 red, for stroke numbers
export const NUMBER_OUTLINE = '#fff';
export const GUIDE_COLOR = '#999999';

/* Page geometry in mm. The page size is fixed in sheet.css; the rest reaches
   the CSS through sheetVars() in layout.js. */
export const PAGE_HEIGHT = 296;     // a hair short of A4, so print rounding never spills a page
export const PAGE_PADDING = 12;
export const CONTENT_WIDTH = 210 - 2 * PAGE_PADDING;
export const BORDER = 0.3;          // boxes overlap by one border, see .boxes in sheet.css
export const CAPTION = 5;           // one caption line plus the space under it
export const GAP = 3.5;             // least space between blocks; see blockGap()
export const CREDIT = 10;           // two lines of credit plus the space above them
