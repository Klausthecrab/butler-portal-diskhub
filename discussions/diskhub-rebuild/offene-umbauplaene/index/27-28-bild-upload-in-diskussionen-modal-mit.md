### #28: Bild-Upload in Diskussionen || Modal mit STRG+V/Dateiauswahl → Diskussions-Ordner (✓ erledigt)

*— · 22.05.2026*

> **Quelle:** "feedback"-Textbox in blocks.md
> Modal öffnet sich bei Klick auf Bild-Button. STRG+V (Zwischenablage) oder Dateiauswahl möglich. Bild wird als Datei im Diskussions-Ordner gespeichert und chronologisch in die Diskussion integriert: Eintrag im Inhaltsverzeichnis mit 📷-Icon, eigener Block mit denselben Buttons/Action-Bar wie Textboxen.

> **Backend:**
> - [x] **B.01** — Neuer Serve-Endpoint `GET /diskhub/assets/<disc_id>/<filename>` via `send_from_directory` (inkl. `?sub_id=`-Unterstützung)
> - [x] **B.02** — `add-box` auf Multipart umstellen: optionaler `image`-File-Upload → `assets/`-Ordner, `![alt](assets/datei.png)` in Content, `📷`-Präfix im Titel
>
> **Frontend:**
> - [x] **F.01** — Versteckter `<input type="file" accept="image/*">` + 📷-Button in `addBoxSection` (Main + Sub)
> - [x] **F.02** — `onPaste`-Handler auf Textarea: Clipboard-Bild erkennen, als `pendingImage`-State speichern
> - [x] **F.03** — Bild-Vorschau unter Textarea mit ❌-Entfernen-Button
> - [x] **F.04** — `handleAddBox` auf FormData umstellen bei pendingImage, sonst JSON
> - [x] **F.05** — `generateToc`: 📷-Prefix im TOC-Eintrag statt 📝 bei Bild-Blöcken
> - [x] **F.06** — CSS für `.pendingImagePreview` + `.pendingImageRemove`
>
> **Tests:**
> - [x] **T.01** — Backend: Multipart-add-box mit PNG → Block in blocks.md + Datei in assets/ + Git-Commit
> - [x] **T.02** — Backend: Serve-Endpoint 200/404 für existente/nicht-existente Bilder
> - [x] **T.03** — Backend: Alter JSON-Request ohne Bild → kein 📷-Präfix, kein assets/-Zugriff
> - [x] **T.04** — Frontend: Dateiauswahl → Vorschau → Submit → Bild erscheint (manuell)
> - [x] **T.05** — Frontend: STRG+V → Vorschau → Submit → Bild online (manuell)
> - [x] **T.06** — Build + Restart + Health-Check: API 200
>
> **Ergebnis:** Neue `POST /diskhub/add-box` unterstützt Multipart mit optionalem Bild-Upload (5MB-Limit). Bild wird in `discussions/<id>/assets/` gespeichert, Block in blocks.md bekommt `📷`-Präfix + Markdown-Referenz. TOC zeigt 📷-Icon statt 📝. Flask-Serve-Endpoint unter `GET /diskhub/assets/<disc_id>/<filename>`. Rückwärtskompatibel — alter JSON-Request ohne Bild verhält sich wie vorher. Build OK, Health-Check bestanden.
