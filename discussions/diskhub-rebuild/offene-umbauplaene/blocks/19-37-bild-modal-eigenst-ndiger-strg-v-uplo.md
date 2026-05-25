### #37: Bild-Modal — Eigenständiger STRG+V/Upload-Dialog für Screenshots (✓ erledigt)

*— · 23.05.2026*

> **Quelle:** Max (Diskussion #36 STRG+V aus Zwischenablage — Analyse + Plan vom 23.05.2026)
>
> Eigenständiges Modal für Bild-Upload per STRG+V oder Dateiauswahl, **losgelöst von der addBoxSection**. Bild wird als Block in blocks.md gespeichert, Datei im `assets/`-Ordner der Diskussion. **Kein neuer Block-Typ** — blocks.md bleibt Single Source of Truth (normaler `###`-Block mit `📷`-Prefix + `![alt](assets/…)`-Content). Bestehender `add-box` Endpoint wird genutzt; minimale Backend-Änderung (Default-Titel bei fehlendem Title).
>
> **Konzept:**
> - Neues ImageUploadModal als eigenständige Komponente (Overlay)
> - Globaler onPaste-Listener im Modal (nicht an Textarea gebunden) erkennt Clipboard-Bilder
> - Alternativ: versteckter Datei-Upload-Button
> - Titel optional — Default: `Screenshot DD.MM.YYYY`
> - Submit an bestehenden `/api/diskhub/add-box` (Multipart/FormData)
> - Bestehender 📷-Block-Mechanismus: Backend setzt `📷 <titel>` + `![alt](assets/datei.png)` im Content
> - 📷-Button in der UI (neben "➕ Neue Textbox") öffnet das Modal
> - Bild erscheint als Block in BlocksSection + TOC mit 📷-Icon (keine Änderung nötig)
>
> **Frontend:**
> - [x] **F.01** — ImageUploadModal-Komponente erstellen: Overlay mit zentraler Dropzone, Vorschaubereich, Titel-Eingabefeld, Bestätigen-Button, ❌-Close (Escape + X)
> - [x] **F.02** — onPaste-Listener auf Modal-Container (nicht auf Input-Element): `e.clipboardData.items` → `item.type.startsWith('image/')` → `setPendingImage(file)` + `e.preventDefault()`
> - [x] **F.03** — Versteckter `<input type="file" accept="image/*">` mit onChange-Handler (bestehendes Pattern aus addBoxSection übernehmen)
> - [x] **F.04** — Bild-Vorschau via `URL.createObjectURL(pendingImage)` mit Thumbnail + Dateiname + ❌-Entfernen-Button
> - [x] **F.05** — Titel-Eingabefeld mit Default-Vorbelegung: `Screenshot DD.MM.YYYY` (User kann überschreiben oder leer lassen → Default-Wert wird aus Frontend mitgesendet)
> - [x] **F.06** — `handleImageSubmit()`: FormData an `/api/diskhub/add-box` (discussion_id + title + image + is_sub/sub_id falls in Sub-Ansicht) → bei Erfolg Modal schließen + `fetchDiscussionData()` + Titel zurücksetzen
> - [x] **F.07** — 📷-Button ("Bild einfügen") oberhalb/neben "➕ Neue Textbox" in Main-View + Sub-View → öffnet Modal via `setShowImageModal(true)`
> - [x] **F.08** — CSS für Modal (.imageModalOverlay, .imageModalContent), Dropzone (.imageDropzone mit gestricheltem Border), Vorschau (.imagePreview), Buttons in dezenter Optik
>
> **Backend:**
> - [x] **B.01** — `add-box` Endpoint: Wenn `image_file` vorhanden und `title` leer, Default-Titel generieren: `datetime.now(timezone.utc).strftime('Screenshot %d.%m.%Y')`
>
> **Tests:**
> - [ ] **T.01** — Frontend: Modal öffnet sich bei Klick auf 📷-Button (Main + Sub-View)
> - [ ] **T.02** — Frontend: STRG+V im Modal → Bild-Vorschau erscheint (Clipboard-Erkennung ohne fokussierte Textarea)
> - [ ] **T.03** — Frontend: Dateiauswahl (Upload) → Vorschau erscheint
> - [ ] **T.04** — Frontend: ❌-Button entfernt Vorschau → Zustand zurück auf leere Dropzone
> - [ ] **T.05** — Frontend: Submit mit leerem Titel → Block `📷 Screenshot 23.05.2026` + Bild in assets/
> - [ ] **T.06** — Frontend: Submit mit User-Titel → Block `📷 <User-Titel>` + Bild
> - [x] **T.07** — Backend: Multipart-add-box mit image + leerem title → 200 + Default-Titel in blocks.md
> - [x] **T.08** — Backend: Multipart-add-box mit image + title → 200 + 📷-Präfix + Bild-Referenz
> - [x] **T.09** — Backend: Multipart-add-box ohne image (alter JSON-Fall) → kein 📷-Präfix, kein assets/-Zugriff
> - [x] **T.10** — Backend: 5MB-Limit wird respektiert — größere Datei → 413
> - [ ] **T.11** — Integration: Bild-Block erscheint in BlocksSection + TOC mit 📷-Icon und Action-Buttons (#25 Edit/Delete funktionieren)
> - [ ] **T.12** — Integration: Bild-Block in Sub-Diskussion (sub_id-korrekt in assets/-Pfad + blocks.md)
> - [x] **T.13** — Build + Restart + Health-Check: API 200
