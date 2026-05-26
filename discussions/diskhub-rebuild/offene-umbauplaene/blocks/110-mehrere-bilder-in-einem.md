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

**Status**
🔜 offen
