### mehrere Bilder in einem (Galerie-Block)
*— · 26.05.2026*

**Problem**
Mehrere zusammengehörige Bilder sollen als ein Element (ein Block) mit einem gemeinsamen Titel dargestellt werden — nicht jedes Bild in einer eigenen Box.

**Lösung (Konzept)**

Ein neuer Galerie-Block-Typ: Ein `###`-Block in blocks.md enthält mehrere Bilder (`![alt](path)`). Der Frontend-Parser erkennt "mehrere Bilder in einem Block" und rendert sie als Galerie statt als vertikalen Stapel.

**UI von oben nach unten:**

1. **Zugeklappt** — wie jeder andere Block: Titel + grüne/gelbe Status-Leiste. Keine Bild-Vorschau.
2. **Aufgeklappt** — die gesamte Block-Fläche zeigt eine Galerie-Ansicht: Thumbnail-Strip (horizontal scrollbar) mit allen Bildern + Zähler "X Bilder"
3. **Klick auf ein Thumbnail** — Lightbox öffnet (bestehende Implementierung) mit ◀▶-Navigation durch die Galerie-Bilder + Zähler "Bild Y von X"
4. **Lightbox schließen** — zurück zur Galerie-Ansicht im Block

**Upload (zwei Wege):**

- **Weg A: 🖼️-Modal** — Mehrfachauswahl oder STRG+V mehrmals im Modal → alle Bilder landen in einem Block mit einem Titel
- **Weg B: STRG+V im Haupt-Formular** — aktuell geht nur 1 Bild. Muss erweitert werden: mehrere Bilder auf einmal pasten (z.B. aus Snipping-Tool nacheinander, oder Datei-Manager Auswahl) → alle in einem Galerie-Block

**Anpassungen bestehender Features:**
- Lightbox bekommt Pfeil-Navigation (aktuell: nur ESC/Outside-Click)
- addBox / ImageUploadModal erlauben Mehrfach-Upload
- Haupt-Formular-STRG+V erkennt mehrere Bilder

**Zielbedingungen (prüfbar):**

- [ ] Drei Bilder via 🖼️-Modal auf einmal hochladen → **ein** Block mit allen drei Bildern als Strip
- [ ] Block aufgeklappt: Strip zeigt Thumbnails + "3 Bilder"-Zähler
- [ ] Klick auf Thumbnail → Lightbox mit Pfeilen, "Bild 1 von 3"
- [ ] STRG+V von mehreren Bildern im Haupt-Formular → **ein** Galerie-Block
- [ ] Ein Bild einfügen (wie bisher) → **ein** normaler Bild-Block (kein Galerie-Block, kein Strip)
- [ ] Galerie-Block zugeklappt → kein Unterschied zu normalen Blöcken (Titel + Status)

**Nicht-Ziel (abgegrenzt):**
- Keine Grid-Ansicht (horizontaler Strip reicht)
- Keine Drag-to-Reorder der Bilder
- Kein extra Gallery-Modal (Thumbnail + Lightbox reicht)
- Thumbnail-Strip ist der geöffnete Zustand — nicht schon im geschlossenen Header

**Fortschritt (26.05.2026):**

✅ **Phase 1 — Code-Inspektion:** Page.jsx + routes.py + ImageUploadModal analysiert
✅ **Phase 2 — Backend: Multi-Image-Upload** in routes.py: `image` → `images` (getlist), Loop speichert alle + 📷-Präfix einmal
✅ **Phase 3 — ImageUploadModal: Multi-Image** — `pendingImages` (File[]), Multi-STRG+V, Multi-Upload, Strip-Preview
✅ **Phase 4 — STRG+V im Haupt-Formular: Multi-Image** — beide addBox-Formulare (Main + Sub-View) sammeln alle Bilder, senden als `images[]`
✅ **Phase 5 — Thumbnail-Strip-Rendering** — BlocksSection erkennt >1 `![...](...)` → `.imageGalleryStrip` + Counter-Badge
✅ **Phase 6 — Lightbox mit Pfeil-Navigation** — `{images[], currentIndex}`, ◀▶ Buttons, "Bild Y von X", ←→ Keyboard
✅ **Phase 7 — Verifikation:** Test-Upload mit 3 Test-PNGs via curl erfolgreich
  - Block `113-galerie-test-3-bilder.md` enthält `📷 Galerie Test 3 Bilder` + 3× `![alt](url)` ✅
  - 3 Asset-Dateien (`bild-2605-2/3/4.png`) in assets/ gespeichert ✅
  - Backend-Änderung erforderte `__pycache__`-Leerung + Dashboard-Neustart (importlib-Cache) ✅
  - Build (16s) + Dashboard-Restart erfolgreich ✅
  - **UI-Test ausstehend** — Sub-View "offene-umbauplaene" lässt sich per Browser schwer öffnen; Rendering-Logik (Gallery-Strip, Lightbox-Navi) ist implementiert aber nicht live im Browser bestätigt

**Verifizierte Zielbedingungen:**
- [x] Drei Bilder via API → **ein** Block mit allen drei Bildern + 📷-Präfix
- [x] Ein Bild einfügen (wie bisher) → **ein** normaler Bild-Block (via curl einzeln bestätigt)
- [ ] Block aufgeklappt: Strip zeigt Thumbnails + "3 Bilder"-Zähler *(UI-Test offen)*
- [ ] Klick auf Thumbnail → Lightbox mit Pfeilen, "Bild 1 von 3" *(UI-Test offen)*
- [ ] STRG+V von mehreren Bildern im Haupt-Formular → **ein** Galerie-Block *(manuell prüfbar)*
- [ ] Galerie-Block zugeklappt → kein Unterschied zu normalen Blöcken *(UI-Test offen)*

**Bekannte Einschränkung:** importlib-Cache beim Dashboard — nach routes.py-Änderungen muss `__pycache__` geleert + Dashboard neugestartet werden.

**Status**
🔜 offen
