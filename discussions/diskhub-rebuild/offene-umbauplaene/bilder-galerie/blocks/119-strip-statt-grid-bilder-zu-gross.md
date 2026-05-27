### Strip statt Grid — Bilder zu groß
*— · 27.05.2026*

**Problem**
Die Galerie-Bilder werden als horizontaler Einzelreihen-Strip dargestellt, aber gewünscht ist eine kompakte 2×2-Matrix/Grid-Ansicht.

**Details**
- Aktuell: `.imageGalleryStrip` mit `display: flex; overflow-x: auto` — horizontale Reihe
- Gewünscht: kompaktes Raster (z.B. CSS Grid mit 2 Spalten, quadratische Thumbnails)
- Einzelbilder sind aktuell zu groß (180px Höhe) — sollen kleiner/kompakter
- Horizontaler Scroll-Strip wirkt unstrukturiert bei mehreren Bildern

**Lösungsvorschlag**
- CSS Grid mit `grid-template-columns: repeat(2, 1fr)` oder `repeat(auto-fill, minmax(120px, 1fr))`
- Quadratische Thumbnails mit `aspect-ratio: 1` und `object-fit: cover`
- Kein horizontaler Scroll mehr — Bilder wachsen in die Breite

**Status**
🔜 offen