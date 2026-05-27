### Bilder werden nicht angezeigt (broken images)
*— · 27.05.2026*

**Problem**
Die 3 Test-Thumbnails im Galerie-Strip werden nicht visuell dargestellt — stattdessen weißer Bereich oder fehlende Images.

**Details**
- Block #113 (`📷 Galerie Test 3 Bilder`) zeigt im DOM korrekt 3 `<img>`-Tags mit URLs zu `bild-2605-2/3/4.png`
- `.imageGalleryStrip` und `.galleryCounter` werden korrekt gerendert
- Aber Bilder sind visuell nicht sichtbar (entweder broken images oder CORS/Asset-Problem)
- Vermutlich: Asset-URLs laden nicht korrekt oder CSS überschreibt `display`/`visibility`

**Akzeptanzkriterium**
- Die 3 Thumbnails sind im Galerie-Strip sichtbar (nicht nur im DOM, sondern visuell)
- Kein broken-image-Icon (🖼️❌)

**Status**
🔜 offen