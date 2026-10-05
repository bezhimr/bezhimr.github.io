# Kanji practice sheets

Printable kanji and kana practice sheets, grouped by Japanese school grade. A static site: serve this folder and open `index.html`.

## Rebuilding the data

`data/` and the webfont subsets in `fonts/` are generated, and committed so the site needs no build step. The exceptions are `data/kana-table.json`, the kana tables, written by hand, and the full fonts in `tools/fonts/`, which the subsets are cut from. To regenerate from newer sources:

```sh
pip install fonttools brotli
python3 tools/build.py kanjidic2.xml.gz kanjivg/kanji
```

See the top of `tools/build.py` for where to get the sources.

## Credits

All credits and license links shown in the app live in `js/credits.js`; the rest of the app's text is in `js/text.js`.

- Stroke paths and stroke order — [KanjiVG](https://kanjivg.tagaini.net/) © Ulrich Apel, CC BY-SA 3.0
- School grades, readings, meanings, stroke counts — [KANJIDIC2](https://www.edrdg.org/wiki/index.php/KANJIDIC_Project) © EDRDG, CC BY-SA 4.0
- Fonts — Klee One by Fontworks, Zen Kaku Gothic New by Yoshimichi Ohira, SIL OFL 1.1
