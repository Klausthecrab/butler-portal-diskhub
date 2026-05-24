### #39: Dead Code Cleanup — Alten 📷-Button + pendingImage-Logik aus addBoxSection entfernen

*— · 23.05.2026*

> **Quelle:** Max (Feedback zu #37 — alter Bild-Einfügen-Button in addBoxSection ist obsolet)
>
> Mit dem neuen ImageUploadModal (#37) gibt es zwei Wege Bilder einzufügen:
> - **Neu:** 🖼️-Button → Modal → STRG+V/Upload → Bestätigen (bevorzugt)
> - **Alt:** 📷-Button in addBoxSection → Textarea-Paste → pendingImage → Submit (obsolet)
>
> Der alte Weg kann entfernt werden, um die addBoxSection zu verschlanken:
> - `addBoxImageBtn` (📷-Button in addBoxActions, beide Views)
> - `boxImageInputRef` (versteckter `<input type="file">`)
> - `pendingImage`-State + Vorschau-Logik in der Textbox
> - `onPaste`-Handler auf der Textarea (Clipboard-Bild-Erkennung)
>
> **Betroffene Stellen (Page.jsx) — alle im SplitViewModal:**
> - State-Deklaration `pendingImage` + `boxImageInputRef` (Zeilen ~910-919)
> - Vorschau-Block `{pendingImage && (...)}` in Sub-View + Main-View
> - Versteckter File-Input `boxImageInputRef` in Sub-View + Main-View
> - `addBoxImageBtn` (📷) in addBoxActions beider Views
> - `onPaste`-Handler auf Textarea (beide Views)
> - Branch in `handleAddBox`: `if (pendingImage) { multipart } else { json }` → vereinfachen zu reinem JSON
> - Bild-Vorschau-CSS-Klassen: `.pendingImagePreview`, `.pendingImageThumb`, `.pendingImageName`, `.pendingImageRemove`
>
> **Sub-Punkte:**
> - [ ] **C.01** — `pendingImage`-State + `boxImageInputRef` aus SplitViewModal entfernen
> - [ ] **C.02** — `onPaste`-Handler auf beiden Textareas entfernen
> - [ ] **C.03** — Vorschau-Block (`{pendingImage && ...}`) aus Sub-View + Main-View entfernen
> - [ ] **C.04** — Versteckten `<input type="file">` aus Sub-View + Main-View entfernen
> - [ ] **C.05** — `addBoxImageBtn` (📷) aus addBoxActions beider Views entfernen
> - [ ] **C.06** — `handleAddBox` vereinfachen: `if (pendingImage)`-Branch entfernen, nur JSON-Request behalten
> - [ ] **C.07** — CSS-Klassen `.pendingImagePreview`, `.pendingImageThumb`, `.pendingImageName`, `.pendingImageRemove` + `.addBoxImageBtn` aus Page.module.css entfernen
> - [ ] **C.08** — Build + Rest + Health-Check nach Cleanup
>
> **Tests:**
> - [ ] **T.01** — 🖼️-Button öffnet weiterhin ImageUploadModal (kein Regression)
> - [ ] **T.02** — Textbox ohne Bild funktioniert (JSON-Submit)
> - [ ] **T.03** — Build fehlerfrei
