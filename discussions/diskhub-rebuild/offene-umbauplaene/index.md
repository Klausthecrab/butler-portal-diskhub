# Offene Umbaupläne

**Erstellt:** 21.05.2026 · 12 Sub-Diskussionen · 0 Blöcke

---

### #01: Datei-Struktur (✓ erledigt) || Neue Ordner-Struktur festlegen

*— · 21.05.2026*

> **Ergebnis:** Grundstruktur durch spätere Implementierungen abgedeckt — README.md + index.md + blocks.md + Sub-Ordner sind etabliert. Keine aktiven offenen Punkte mehr.

### #02: UI-Struktur (✓ erledigt) || Header-Body-Aufbau definieren

*— · 21.05.2026*

> **Ergebnis:** Vollständig durch Punkte 3–6 implementiert (Detail-Ansicht, Blocks vs Subs, Single Source of Truth, Duplikate entfernt).

### #03: Detail-Ansicht (✓ erledigt) || Zoom in Sub-Diskussionen

*— · 21.05.2026*

> **Ergebnis:** Browser-History-API + TOC in Sub-View + Technisch-Tab respektiert Subs

### #04: Blöcke vs. Sub-Diskussionen (✓ erledigt) || Klare Trennung einführen

*— · 21.05.2026*

> **Ergebnis:** Promotion-UI + visuelle Unterscheidung + Block-Status verworfen

### #05: Single Source of Truth (✓ erledigt) || Gleicher Text in Akkordeon und Detail-Ansicht

*— · 21.05.2026*

> **Ergebnis:** Sub-Karten zu Akkordeon umgebaut — volle README via renderMarkdown(), kein slice(0,200) mehr. "→ Vollständige Ansicht"-Link für Index/Blocks.

### #06: Doppelte Elemente entfernen (✓ erledigt) || Titel, Datum, ausgeklappte Subs

*— · 21.05.2026*

> **Ergebnis:** `renderIndexMd()` bekommt `mode='footer-only'` — Main-View rendert nur Footer (💬 Sub-Diskussion fortsetzen) ohne Preamble/### Sub: Blöcke. Sub-View bleibt voll.

### #07: Titelzeile im Akkordeon vereinheitlichen (✓ erledigt)

*— · 21.05.2026*

> **Ergebnis:** `readmeTitle()` parst H1 aus README — Header zeigt echten Titel statt `sub.name`. Single Source, kein `.title()`-Bug mehr. Fallback auf `sub.name` bei fehlender README.

### #08: Sub-Diskussionen nummerieren (✓ erledigt) || Sub-Akkordeon mit Nummer-Prefix

*— · 21.05.2026*

> **Ergebnis:** `data.subs.map()` bekommt `idx`-Parameter, Titel wird `#01:`, `#02:`, etc. via `padStart(2, '0')` vorangestellt.

### #09: Status-Auslese in Sub-Akkordeon fixen (✓ erledigt) || Status-Badge in Sub-Header

*— · 21.05.2026*

> **Ergebnis:** `sub.status` aus API-Daten im Header gerendert: grüner Badge bei `erledigt > 0 && offen === 0`, gelber Badge bei `offen > 0`. CSS-Klassen `.badgeDone`/`.badgeOpen` wiederverwendet.

### #10: Header-Box mit weißem Hintergrund + Trennlinien (✓ erledigt) || CSS für hellen Header

*— · 21.05.2026*

> **Ergebnis:** `.discHeader` von dunklem Gradient auf `#f8fafc` umgestellt, Textfarben invertiert (dunkel auf hell), `border-bottom: 2px solid #d1d5db` als Trennlinie.

### #11: Standardmäßig eingeklappte Subs fixen (✓ erledigt) || Ersten offenen Sub auto-expand

*— · 21.05.2026*

> **Ergebnis:** `useEffect` auf `data`: findet `data.subs.find(sub => sub.status?.offen > 0)` und setzt `expandedSubs = new Set([firstOpen.id])`. Alle anderen bleiben zu.

### #12: Kurzbeschreibung im aufgeklappten Akkordeon (✓ erledigt) || README-Präambel als Preview

*— · 21.05.2026*

> **Ergebnis:** `extractPreamble()` extrahiert alles zwischen H1 und erstem `---`/`###` aus `sub.readme`. Akkordeon zeigt diese Präambel + "→ Vollständige Ansicht"-Link — Single Source, kein separater Feld.

### #13: Header-Box Terracotta + Abgrenzung (✓ erledigt)

*— · 21.05.2026*

> **Ergebnis:** `.discHeader` auf pastell Terracotta (#f0dbd1), border-radius: 10px, Textfarben auf warme Dunkeltöne umgestellt. `.discStats` mit border-top: 1px solid rgba(0,0,0,0.08) vom Titel getrennt. Stats-Separator-Farbe an neuen Hintergrund angepasst (#a09080).

### #14: Weißes Überbleibsel entfernen (✓ erledigt)

*— · 21.05.2026*

> **Ergebnis:** `.readmeBodySection` (background: #f8fafc, border-radius: 10px) entfernt — die vier JSX-Wrapper in main+sub view durch direktes `.markdownContent` ersetzt, CSS-Regel gelöscht. README-Content läuft jetzt nahtlos im dunklen Theme.  
> Zusätzlich: `.discHeader` bekam `border-bottom: 2px solid #c8b4a8` (Trennlinie), `margin-bottom: 24px` (Abstand) und `box-shadow: 0 2px 8px` (Tiefe) für klar getrennte Zonen.

### #15: Trennlinien um Inhaltsverzeichnis (✓ erledigt)

*— · 21.05.2026*

> **Ergebnis:** Zwei `<hr>`-Elemente mit dezentem Inline-Style (`border-top: 1px solid #2d3a4e`, `opacity: 0.5`) vor und nach dem TOC in `generateToc()` eingefügt. Inline-Style statt CSS Module, da der HTML-String via `dangerouslySetInnerHTML` gerendert wird und CSS-Module-Hashes nicht greifen. Build OK.

### #16: "Box hinzufügen"-Formular (✓ erledigt)

*— · 21.05.2026*

> **Ergebnis:** Formular am Ende jeder Diskussion (main-view + sub-view): Titel-Eingabefeld + Textarea + Button. POST an `/api/diskhub/add-box` hängt `### <titel>`-Block an blocks.md (anlegen falls fehlend) + git commit. Daten werden nach Erfolg automatisch neu geladen.

### #17: "Zu Sub ändern"-Button + Session-Spawn (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** Neuer Endpoint `POST /api/diskhub/start-box-to-sub` (3er-Webhook mit Box-Content als Kontext-Prompt). Neuer Button "🗂️ Zu Sub ändern" in jeder Box in `BlocksSection`. Button startet Session mit dem Box-Content — KI durchgeht Inhalt mit User, leitet Sub-Vorschläge ab. Später per Promote-Button übernehmbar. Zwei Buttons nebeneinander im `.blockActions`-Flexbox: links "Zu Sub ändern", rechts "⬆️ Als Sub übernehmen".

### #18: Connector-Linie + Punkt + Datum für alle Elemente (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** Connector-Pattern (`blockWrapper > blockConnector > connectorDot + connectorLine + connectorDate`) auf alle Listenelemente ausgeweitet:
> - **BlocksSection** (React, blocks.md): Jeder Block jetzt mit blockWrapper, Datum wird aus Content-Zeile `*— · DD.MM.YYYY*` extrahiert und in den Connector verschoben. CSS auf `.blockCard`/`.blockHeader`/`.blockContent` umgestellt (uniform mit index.md-Blöcken).
> - **Sub-Akkordeons:** Jeder Sub jetzt mit blockWrapper, Datum wird aus README `**Erstellt:** DD.MM.YYYY` geparst.
> - Helfer: `parseBlockDate()` (für blocks.md) und `parseCreatedDate()` (für README).

### #19: "Zuletzt aktualisiert" dynamisch aus Git-Log (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** `_parse_discussion_header()`-Aufruf in `get_discussion()` um Git-Log-Logik ergänzt: nach dem Parsen wird `header['updated_at']` durch das tatsächliche Änderungsdatum aus `git log -1 --format=%ct -- .` im Diskussions-Ordner ersetzt. Fallback auf hartcodiertes README-Datum bei Fehlern. Frontend rendert `updated_at` bereits via `discStats` — keine Frontend-Änderung nötig. Build OK.

### #20: Status-Zähler dynamisch aus index.md parsen (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** Neue Hilfsfunktion `_parse_index_status()` zählt `### #XX:`-Einträge und `(✓ erledigt)`-Marker aus index.md. Angewandt in `get_discussion()` (überschreibt README-basierte `done_count`/`open_count` im parsed-Header) und in `_scan_discussions()` (List-Endpoint + Sub-Status). Frontend rendert die Werte bereits via `discStats` und Sub-Badges — keine Frontend-Änderung. Enthüllt dass #15 (Trennlinien) noch nicht als erledigt markiert ist — 18/5 statt 19/4. README-Metadaten beider Diskussionen synchronisiert.

### #21: Statusfelder optisch vom README-Text trennen (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** `discStats` aus `discHeader` in beiden Views (Main + Sub) herausgezogen — eigenständiger Block zwischen Header und README-Content. `discStats` bekam Dark-Theme-Stil (`color: #94a3b8`, `border-bottom: 1px solid #2d3a4e`, `margin: 0 0 20px 0`) als klare Trennlinie zum Markdown-Content. Sub-View hatte vorher gar keine `discStats` — jetzt identisch zur Main-View. `discHeader` verlor `border-bottom`/`margin-bottom` (unnötig bei getrennten Blöcken). `.statsSep`-Farbe auf `#475569` (Dark-Theme) umgestellt. Build OK.

### #22: Inhaltsverzeichnis (TOC) im Sub-Akkordeon statt README-Präambel (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** Expanded Body der Sub-Akkordeons (Main-View) zeigt jetzt `generateToc(sub.blocks, sub.index)` statt der README-Präambel. Der TOC zeigt 📝-Einträge aus `blocks.md` und 🗂️-Subs aus `index.md` im ├── Einzeiler-Stil — inkl. Sub-Sub-Diskussionen. Fallback auf README-Präambel/README wenn weder blocks noch index vorhanden. `generateToc()` war bereits vorhanden — musste nur im Akkordeon-Kontext aufgerufen werden. Build OK.

### #23: Box-Formular eingerahmt + Label-Änderung (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** "➕ Neue Box" → "➕ Neue Textbox" in Main-View + Sub-View. `.addBoxSection` von `border-top` auf vollständigen `border: 1px solid #475569` + `border-radius: 8px` + `padding: 16px` umgestellt. Sichtbarer Rahmen um das gesamte Formular. Build OK, Health-Check bestanden.

### #24: Button-Unterscheidbarkeit für Textboxen (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** Zwei Buttons ("Zu Sub ändern" + "Als Sub übernehmen") auf einen reduziert: **💬 In Sub entwickeln** mit Sprechblasen-Icon. Ausführlicher Tooltip (title-Attribut) erklärt den gesamten Flow: Discord-Session-Start, Preview-Panel, schrittweises Durchgehen + Sub-Vorschläge. Dead Code entfernt: `handlePromoteBlock()`-Funktion, `promoteBtn`-CSS-Klasse, `onPromote`-Prop aus `BlocksSection`. Build OK, Health-Check bestanden. Webhook-Session-Start verifiziert (3×204).

### #25: Textbox-Operationen: Bearbeiten + Löschen (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** Zwei neue Buttons pro Textbox — ✏️ Bearbeiten (schaltet in Edit-Modus mit Titel-Input + Content-Textarea + ✅ Speichern / ❌ Abbrechen) und 🗑️ Löschen (Doppelklick-Bestätigung: erster Klick zeigt "⚠️ Sicher?", zweiter Klick löscht). Backend: neue Endpoints `POST /diskhub/edit-block` und `POST /diskhub/delete-block` (block_index-basiertes Parsen/Ersetzen/Entfernen in blocks.md + Git-Commit). Beide Endpoints respektieren `is_sub`/`sub_id` für Sub-Diskussionen. Edit-Formular im Dark-Theme mit Labeln, Input-Feldern und Indigo-Save-Button. Delete mit Danger-Stil (rot). Dead Code-Entfernung: alter `convertBtn`-CSS-Duplikat. Build OK, Health-Check bestanden. API-Tests: edit-block (Titel+Content-Änderung) + delete-block (Entfernung) erfolgreich verifiziert — Formatierung korrekt (Leerzeilen zwischen Blöcken).

### #26: Textbox-Referenz (Pfad/Identifikator) (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** Jede Textbox bekommt eine sichtbare ID `#box-<index>` im Header (rechtsbündig, monospace, dezent). Ein 🔗-Button in der Action-Bar kopiert `#box-<idx>` in die Zwischenablage (wechselt auf ✅ Kopiert für 2s). Die `<details>`-Box hat die HTML-ID `box-<idx>`, sodass `#box-3` in der URL direkt zur Box scrollt (Auto-Scroll via `useEffect` + `scrollIntoView` beim Laden). Nutzung: in einer Sub-Diskussion einfach `#box-1` schreiben, um auf eine bestimmte Textbox in derselben Diskussion zu verweisen. Nur Frontend-Änderung (kein Backend nötig). Build OK, Health-Check bestanden.

### #27: Chronologische Sortierung per Datei-Position || Einträge in korrekter Reihenfolge (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** Kein Timestamp-Tracking nötig. Neue Boxen werden via `add-box` immer ans Ende von `blocks.md` angehängt — Datei-Position = Erstellungs-Reihenfolge. `BlocksSection` reversed die Liste per `useMemo` (`reversedBlocks` mit `originalIdx`-Mapping), sodass die neueste Box oben, die älteste unten erscheint. Foolproof: egal ob via Textfeld, Prompt oder API angelegt — `add-box` hängt immer unten an. Bearbeiten ändert die Position nicht (korrekt: chronologisch ≠ letzte Aktivität). Backend-Operationen (edit/delete/copy) nutzen `originalIdx` für korrekte Datei-Indizes. Build OK, Health-Check bestanden.

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

### #29: UI-Layout: Preview auf 30-35 % || Diskussionsbereich verbreitern

*— · 22.05.2026*

> **Quelle:** "feedback"-Textbox in blocks.md
> Rechte Preview-Spalte auf 30-35 % reduzieren, Diskussionselement links entsprechend vergrößern, Außenrand links/rechts verkleinern. Die Datumanzeige im Connector soll optisch besser zwischen Punkt und Textbox-Element passen.

### #30: Zwei-Phasen-Button "In Sub entwickeln" || Bestätigung + Prompt in Zwischenablage

*— · 22.05.2026*

> **Quelle:** "feedback zu '+Textbox'" in blocks.md
> Erster Klick auf "💬 In Sub entwickeln": Button wechselt auf "Chat starten?" (Bestätigungsanzeige) und kopiert den Session-Prompt automatisch in die Zwischenablage. Zweiter Klick startet die Discord-Session. Der Prompt selbst als Single Source of Truth definieren (nicht hartcodiert im Frontend).

### #31: Technisch korrekte Referenz im Pfad-Button || Vollständiger Diskussionspfad

*— · 22.05.2026*

> **Quelle:** "feedback zu '+Textbox'" in blocks.md
> Der 🔗-Pfad-Button (#26) soll nicht nur `#box-<idx>` kopieren, sondern den technisch korrekten Referenzbegriff — z. B. den vollständigen Diskussionspfad inkl. Sub-ID. Ziel: in einer laufenden KI-Session den genauen Bezugspunkt einer Box referenzieren können.

### #32: Prompt-Vorlagen bei "+ Neue Textbox" || Dynamische Templates

*— · 22.05.2026*

> **Quelle:** "Feedback unsortiert"-Textbox in blocks.md
> Vorschläge/Templates unterhalb der "+ Neue Textbox"-Eingabefelder. Dynamisch basierend auf erkannten offenen Punkten in der Diskussion? Startprompt-Idee: "Starte mit dem nächsten offenen Punkt — lies alles dazu und diskutiere mit mir."

### #33: Sticky-Header-Overlap fixen || Header schließt bündig ab (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** `.docPanel` hatte `padding: 20px 24px` — der sticky `.docTabs` bei `top: 0` saß innerhalb dieser Padding-Lücke. Beim Scrollen wanderte Content (Terracotta-`.discHeader`) hinter die Tabs und schimmerte durch die 20px-Lücke durch. Fix: `.docPanel` padding-top entfernt (`padding: 0 24px 20px`), `.docTabs` mit `margin: 0 -24px` edge-to-edge gespannt und eigenes `padding: 0 24px` für horizontale Innenabstände. Tabs sitzen jetzt bündig am Panel-Top — kein Schlitz mehr. Build OK, Health-Check bestanden.

### #34: Diskussions-Struktur-Konzept / Archiv || README als Single Source ausbauen

*— · 22.05.2026*

> **Quelle:** "Feedback unsortiert"-Textbox in blocks.md
> Vollständiges Konzept für Diskussions-Struktur:
> 1. Titel / Grundsätzliche Fragestellung
> 2. Status quo (aktueller Stand)
> 3. Offene Punkte
> 4. Entscheidungen / Archiv (ausgelagert für schlanke KI-Sessions)
> 5. Erklärung / Anleitung (Human- + Machine-Readable)
>
> Prüfen ob README diesen Kern bereits abdeckt und wie die Struktur für KI-Sessions optimiert werden kann (nur 1+2+3 laden, Archiv auslagern).

### #35: Lightbox für Bilder || Skalierte Anzeige + Klick auf Originalgröße

*— · 22.05.2026*

> **Quelle:** Max (Diskussion #28 Bild-Upload)
> Bilder werden aktuell als rohes `<img>` ohne Größenbeschränkung gerendert — große Bilder zerreißen das Layout.
>
> Gewünscht:
> - Bilder im Content automatisch skalieren (z.B. `max-width: 100%`, `max-height: 400px`, `object-fit: contain`, `cursor: zoom-in`)
> - Klick auf skaliertes Bild öffnet Lightbox-Modal: Bild in Originalgröße, dunkler Hintergrund, zentriert, Close per X oder Klick außerhalb
> - Nur Frontend (kein Backend) — ändert `renderMarkdown()` + neue `.imageLightbox`-Komponente + CSS
>
> **Sub-Punkte:**
> - [ ] **L.01** — CSS für `.docBody img` / `.markdownContent img`: max-height + zoom-in-Cursor
> - [ ] **L.02** — Lightbox-Komponente: onClick → Overlay mit Bild in Originalgröße
> - [ ] **L.03** — Beispielbild in Diskussion eintragen (z.B. Screenshot) um die Lightbox zu demonstrieren

### #36: STRG+V aus Zwischenablage (Screenshots) in Diskussionen

*— · 22.05.2026*

> **Quelle:** Max (Diskussion #28 Bild-Upload)
> Möglichkeit per STRG+V ein Bild aus der Zwischenablage (z.B. Screenshot) in eine Diskussion einzufügen.
>
> ⚠️ **Bereits in #28 F.02 implementiert** — `onPaste`-Handler auf der Textarea in `addBoxSection` erkennt Clipboard-Bilder und speichert sie als `pendingImage`. Das Bild wird beim nächsten "Box hinzufügen" mit hochgeladen.
>
> **Offen:** Soll STRG+V auch außerhalb der `addBoxSection` funktionieren? Z.B. direkt in eine Sub-Diskussion oder als eigenständigen Bild-Block ohne Textbox? Oder ist der aktuelle Flow (Textbox mit Bild) ausreichend?

### #37: Bild-Modal — Eigenständiger STRG+V/Upload-Dialog für Screenshots (geplant)

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

### #38: Bild-Rendering — Relativer Pfad in blocks.md korrigieren (✓ erledigt) || Absoluter API-Pfad in blocks.md

*— · 23.05.2026*

> **Quelle:** Max (Feedback zu #37 — Bild wird in Diskussion nicht dargestellt)
>
> Das Backend schrieb in `add_box()` (Zeile 1799 `routes.py`) einen **relativen Pfad**:
> ```python
> image_md = f'\n![{clean_title}](assets/{filename})'
> ```
>
> `renderMarkdown()` erzeugte `<img src="assets/bild-2305-1.png">`. Der Browser löste relativ zur Dashboard-Basis-URL auf — falscher Pfad. Korrekt ist `GET /api/diskhub/assets/<disc_id>/<filename>` über den Flask-Serve-Endpoint.
>
> **Sub-Punkte:**
> - [x] **R.01** — `image_md` in `add_box()`: relativen Pfad durch API-Pfad ersetzen (discussion_id + optional sub_id als Query-Param)
>
> **Tests:**
> - [x] **T.01** — Bild-Block mit korrektem API-Pfad in blocks.md geschrieben und per HTTP 200 ausgeliefert
> - [x] **T.02** — sub_id wird im Code berücksichtigt (`?sub_id=`), manuell noch nicht getestet
> - [x] **T.03** — Alte Bild-Blöcke (3 Stück) wurden aufgeräumt: aus blocks.md entfernt + Assets gelöscht
> - [x] **T.04** — Bild kann gelöscht werden (#25 Delete-Block) — kein Code-Konflikt (nur content geändert)
> - [x] **T.05** — TOC zeigt 📷-Icon + Titel (nur `###`-Parser, kein Regression-Risiko)
>
> **Ergebnis:** `assets/{filename}` durch `/api/diskhub/assets/{discussion_id}/{filename}` ersetzt. Sub-Diskussionen bekommen `?sub_id=`. Backend-Neustart (debug=True) + Testbild verifiziert. Alte Bild-Blöcke bereinigt. Commit `d8c4104`.

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

### #40: Bild-Darstellung in UI — Skalieren + immer sichtbar (kein Akkordeon) (✓ erledigt) || CSS-Skalierung + no-accordion für 📷-Blöcke

*— · 23.05.2026*

> **Quelle:** Max (Feedback zu #38 — Testbild wird als blauer Kasten dargestellt)
>
> Bilder wurden als rohes `<img>` im Block-Content gerendert. Große Bilder zerrissen das Layout. Zudem waren Bild-Blöcke wie Textboxen im `<details>`-Accordion versteckt.
>
> **Sub-Punkte:**
> - [x] **B.01** — `.blockContent img`: max-height 400px + object-fit contain + cursor zoom-in
> - [x] **B.02** — `.markdownContent img`: gleiche Regeln für README-Bild-Content
> - [x] **B.03** — Neue CSS-Klasse `.imageBlockHeader`: kein cursor pointer + kein ::after-Pfeil
> - [x] **B.04** — JSX-Detektion: headingText.startsWith('📷') → kein `<details>`-Wrap, stattdessen `<div>` mit `.blockCard`
>
> **Ergebnis:** Bilder werden jetzt skaliert (max-width 100%, max-height 400px, object-fit contain, cursor zoom-in). 📷-Blöcke sind immer sichtbar — kein Accordion-Toggle. Header ohne Pfeil, aber gleiche Optik. Action-Buttons (Edit/Delete/Kopieren/In Sub entwickeln) bleiben erhalten.

### #41: Chronologie umkehren — Neu = unten (Elemente + Inhaltsverzeichnis) (✓ erledigt) || reversedBlocks.reverse() entfernt

*— · 23.05.2026*

> **Quelle:** Max (Feedback zu #38 — neue Box erscheint oben, erwartet: unten)
>
> Aktuell sortierte `BlocksSection` die Liste via `useMemo` reversed (`.reverse()`), sodass die neueste Box oben erschien. Das Inhaltsverzeichnis (TOC) hatte das Problem nicht — es iterierte blocks.md in Datei-Reihenfolge.
>
> **Sub-Punkte:**
> - [x] **C.01** — `.reverse()` aus `reversedBlocks`-useMemo entfernt
> - [x] **C.02** — TOC nicht verändert (bereits korrekt: Datei-Reihenfolge = chronologisch)
>
> **Ergebnis:** Neue Elemente erscheinen jetzt unten in der Liste (blocks.md-Datei-Reihenfolge). TOC war bereits korrekt. Keine weiteren Änderungen nötig.

### #42: Jedes Element als Session-Starter || Textbox, Bild, offener Punkt klickbar

*— · 24.05.2026*

> **Quelle:** Vision-Workshop Max + Hermi (24.05.2026)
>
> Aktuell haben nur Boxen den "In Sub entwickeln"-Button. Jedes Diskussionselement soll zum Session-Starter werden können: Textboxen, Bild-Blöcke, offene Punkte in index.md. Der Prompt muss je Element-Typ unterschiedlich sein:
> - **Textbox:** Inhalt lesen → mit Max diskutieren
> - **Bild-Block:** Bild analysieren → was soll damit passieren?
> - **Offener Punkt (index.md):** Punkt verstehen → Plan vorschlagen
>
> **Sub-Punkte:**
> - [ ] **E.01** — Button-Integration für alle Element-Typen in BlocksSection (Textbox, Bild, Sub-Akkordeon)
> - [ ] **E.02** — Button für offene Punkte in renderIndexMd() / renderBlock()
> - [ ] **E.03** — Unterschiedliche Prompts je Element-Typ im Webhook-Handler
> - [ ] **E.04** — Hover-Over-Infotext für alle neuen Buttons (erklärt Ziel und Flow des Session-Starts)
> - [ ] **E.05** — Tests: Jeder Button-Typ → korrekter Prompt → Session gestartet (Rückkanal-Check)
>
> **Tests:**
> - [ ] **T.01** — Textbox-Button → Prompt enthält Box-Inhalt + "erkläre was du vor hast"
> - [ ] **T.02** — Bild-Button → Prompt enthält Bild-Referenz + Aufforderung zur Analyse
> - [ ] **T.03** — Offener-Punkt-Button → Prompt enthält Punkt-Beschreibung + Status-Kontext
> - [ ] **T.04** — Rückkanal: Session-Start liefert 204/200, Webhook erreicht Discord

### #43: Plan-Phase vor Umsetzung || "erklär was du vor hast" als Default

*— · 24.05.2026*

> **Quelle:** Vision-Workshop Max + Hermi (24.05.2026)
>
> Jeder Session-Start soll standardmäßig **nicht** direkt umsetzen, sondern erst erklären was Hermi vorhat. Max gibt dann Go oder widerspricht. Der Plan ist Session-intern (kein DiskHub-Eintrag) — nur das Ergebnis wird dokumentiert.
>
> **Sub-Punkte:**
> - [ ] **P.01** — Webhook-Prompt um "erklären, nicht umsetzen"-Instruktion erweitern (Default-Verhalten)
> - [ ] **P.02** — Klare Erwartung an Hermi: Startprompt referenzieren + konkreten Vorschlag liefern
> - [ ] **P.03** — User gibt Go → Umsetzung startet. User widerspricht → Korrektur/Neurichtung
> - [ ] **P.04** — Tests: Rückkanal nach Plan-Phase funktioniert (Session läuft nicht ins Leere)
>
> **Tests:**
> - [ ] **T.01** — Session startet → Hermi erklärt Plan → wartet auf Go
> - [ ] **T.02** — Bei "Go" → Umsetzung läuft. Bei "Stop" → Session bricht ab
> - [ ] **T.03** — Rückkanal: Go/Stop erreicht Hermi korrekt

### #44: Prompt-Baukasten im Webhook || Dynamischer Prompt statt roher README

*— · 24.05.2026*

> **Quelle:** Vision-Workshop Max + Hermi (24.05.2026)
>
> Aktuell schiebt der Webhook die komplette README in den Prompt. Stattdessen: dynamisch aus den API-Daten bauen:
> `📋 Grundfrage + 📌 Stand + 🔜 [genau das eine Element]`
> Fallback auf volle README bei fehlender Struktur.
>
> **Hintergrund (aus Diskussion 24.05.2026):**
> - Kein separates Archiv nötig — der Prompt-Baukasten filtert erledigte Punkte raus, statt sie umzuziehen
> - `(✓ erledigt)` ist aktuell ein Hardcoded-String ohne Timestamp — keine Information "seit wann"
> - Lösung: Der Eintrag bekommt `*Erledigt: DD.MM.YYYY*` vom Skill gesetzt (nicht hardcoded, nicht geraten)
> - Der Prompt-Baukasten prüft dieses Datum: "erledigt < 3 Tage → optional erwähnen", "erledigt > 3 Tage → nur als 📚-Zahl"
> - Fallback bei fehlendem `*Erledigt:*`: Volle README laden (backward compatible)
>
> **Sub-Punkte:**
> - [ ] **B.01** — Prompt-Baukasten-Funktion in routes.py: Grundfrage (H1 + Frage), Stand (Zusammenfassung), Element-Kontext
> - [ ] **B.02** — Element-Typ-Detektion: Box vs. Bild vs. offener Punkt → unterschiedlicher Prompt-Aufbau
> - [ ] **B.03** — Fallback auf volle README wenn kein spezifisches Element referenziert wird
> - [ ] **B.04** — Statusbewusster Prompt: Erledigt-Punkte mit Datum prüfen (`*Erledigt: DD.MM.YYYY*`), nur als 📚-Zahl in den Prompt übernehmen
> - [ ] **B.05** — Alte Einträge ohne `*Erledigt:*` → Fallback auf volle README oder komplette Erwähnung
> - [ ] **B.06** — Tests: Rückkanal prüft ob Prompt-Inhalt korrekt gebaut wurde
>
> **Tests:**
> - [ ] **T.01** — Box-Referenz → Prompt enthält Box-Content + Kontext
> - [ ] **T.02** — Keine Referenz → volle README als Fallback
> - [ ] **T.03** — Rückkanal: Webhook liefert Prompt-Inhalt zur Verifikation

### #45: Auto-Rückkanal || Session-Ergebnis als Block in blocks.md

*— · 24.05.2026*

> **Quelle:** Vision-Workshop Max + Hermi (24.05.2026)
>
> Nach erfolgreicher Umsetzung + Verifikation schreibt Hermi das Ergebnis automatisch als neuen Block an das Ende von blocks.md. Format: `### 🤖 <Kurztitel>` + Content (Zusammenfassung, Findings, Commit-Ref). Git-Commit + Push. Der Auto-Rückkanal ersetzt das manuelle Eintragen.
>
> **Sub-Punkte:**
> - [ ] **R.01** — CLI-basierte Doku: Ergebnis ans Ende von blocks.md schreiben (read_file + patch)
> - [ ] **R.02** — Format-Konvention: Prefix `🤖`, Datum im Content, Commit-Hash im Content
> - [ ] **R.03** — Git-Commit + Push nach jedem Schreibvorgang
> - [ ] **R.04** — Fehlerbehandlung: Bei Schreibfehler → Max benachrichtigen, nichts halb in blocks.md hinterlassen
> - [ ] **R.05** — Tests: Rückkanal funktioniert korrekt — Block erscheint in blocks.md, Commit auf remote
>
> **Tests:**
> - [ ] **T.01** — Nach Session: `🤖`-Block am Ende von blocks.md
> - [ ] **T.02** — Content enthält Zusammenfassung + Commit-Hash
> - [ ] **T.03** — Git-Commit + Push auf remote sichtbar
> - [ ] **T.04** — Rückkanal: Diskussion-UI zeigt neuen Block nach Reload

### #46: diskhub-doc Skill || Format-Wissen + Schutz gegen Context Rot (✓ erledigt)

*— · 24.05.2026*
*Erledigt: 24.05.2026*

> **Quelle:** Vision-Workshop Max + Hermi (24.05.2026)
>
> Skill der Hermi erklärt wie Einträge in DiskHub korrekt formatiert werden. Enthält blocks.md-Format (`###`-Struktur, Prefix-Regeln), Commit-Konventionen und Prüf-Logik. Manuell ladbar (nicht automatisch) — Max sagt "dokumentiere das" und lädt den Skill dazu.
>
> **Hintergrund (aus Diskussion 24.05.2026):**
> - `(✓ erledigt)` ist ein reiner Text-String — kein System setzt ihn, kein Timestamp existiert
> - Du sollst ihn nie wieder manuell setzen müssen — Hermi macht das bei der Doku
> - Aber: "Automatisch nach jeder Session setzen" ist zu risikoreich (Fehler unkontrollierbar)
> - Lösung: **Kein Automatismus, sondern strukturierte Checkliste im Skill** — Hermi setzt den Status erst nach deinem expliziten "dokumentiere das"
> - Der Skill zwingt zur Reihenfolge: Status setzen → 🤖-Block → Commit
> - Vor dem Commit prüft der Skill: "Steht `*Erledigt:*` im Eintrag? → nein → abbrechen"
> - Schutz gegen Doppel-Eintrag: Existiert `(✓ erledigt)` bereits → Skill warnt und bricht ab
>
> **Sub-Punkte:**
> - [x] **S.01** — Skill erstellen: blocks.md-Format-Vorgabe, Prefix-Regeln (`🤖`, `📷`), Datums-Format
> - [x] **S.02** — Prüf-Logik: "Sieht der Eintrag aus wie die bestehenden?" vor Commit
> - [x] **S.03** — Commit-Konventionen: Nachricht enthält Punkt-Nummer + Kurzbeschreibung (`done #49: ...`)
> - [x] **S.04** — Skill-Doku: Erklärung wann und wie geladen wird
> - [x] **S.05** — Reihenfolge erzwingen: (1) `(✓ erledigt)` + `*Erledigt: DD.MM.YYYY*` in index.md schreiben, (2) 🤖-Block in blocks.md anhängen, (3) `git add . && git commit -m "done #49: ..." && git push`
> - [x] **S.06** — Prüfung vor Schritt 1: Existiert `(✓ erledigt)` bereits im Eintrag? → Skill bricht ab mit Warnung "Punkt #49 bereits als erledigt markiert — überschreiben?"
> - [x] **S.07** — Prüfung vor Commit: Steht `*Erledigt:*` im index.md-Eintrag? → nein → Fehler, nicht committen
> - [x] **S.08** — Alte Einträge ohne `*Erledigt:*` sind OK (backward compatible) — der Skill setzt `*Erledigt:*` nur bei neuen Einträgen
> - [x] **S.09** — Tests: Skill geladen → korrekter Eintrag in blocks.md inkl. Status+Datum
>
> **Tests:**
> - [x] **T.01** — Skill geladen → Eintrag folgt Format-Konvention
> - [x] **T.02** — Fehlerfall: ungültiges Format → Skill weist zurück mit Erklärung
> - [x] **T.03** — Skill warnt bei doppeltem Status: `(✓ erledigt)` existiert bereits → Abbruch
> - [x] **T.04** — Skill bricht ab wenn `*Erledigt:*` fehlt → kein Commit ohne Datum
> - [x] **T.05** — Rückkanal: Skill antwortet mit "Eintrag OK" oder "Format-Fehler in Zeile X"

### #47: Session-interne Verifikation || Check vor Dokumentation

*— · 24.05.2026*

> **Quelle:** Vision-Workshop Max + Hermi (24.05.2026)
>
> Bevor Hermi das Ergebnis dokumentiert, prüft er ob die Zielbedingung erfüllt ist:
> - **Code:** Tests, Build, Health-Check
> - **Konzept:** Rückfragen bei Unklarheiten
> - **Allgemein:** "Ziel war X → wurde X erreicht?"
> Verifikation läuft in derselben Session (kein externer Check nötig). Schützt gegen Context Rot und stellt sicher dass nur saubere Ergebnisse in DiskHub landen.
>
> **Hintergrund (aus Diskussion 24.05.2026):**
> - Verifikation und Status-Setzen gehören zusammen, sind aber zwei getrennte Schritte
> - Verifikation prüft "wurde das Ziel erreicht?" — das ist die **Entscheidung**
> - Status+Datum setzen ist die **Dokumentation** dieser Entscheidung — das macht der Skill (#46)
> - Fehlgeschlagene Verifikation → kein Status-Setzen, nur Benachrichtigung an Max
> - Erledigte Verifikation + dein "dokumentiere das" → Skill laden → Status+Datum → 🤖-Block → Commit
>
> **Sub-Punkte:**
> - [ ] **V.01** — Verifikations-Schritt als separater Schritt vor "dokumentieren" (Teil des Session-Ablaufs)
> - [ ] **V.02** — Code-Verifikation: Tests laufen lassen, Build prüfen, Health-Check aufrufen
> - [ ] **V.03** — Konzept-Verifikation: Zielbedingung aus Prompt extrahieren + mit Ergebnis abgleichen
> - [ ] **V.04** — Verifikation bestanden → Skill #46 laden → Status+Datum setzen → 🤖-Block → Commit
> - [ ] **V.05** — Verifikation fehlgeschlagen → nichts setzen, Max benachrichtigen mit Grund
> - [ ] **V.06** — Fehlerfall: Verifikation unklar (kein klares Ja/Nein) → Rückfrage an Max vor Entscheidung
> - [ ] **V.07** — Tests: Rückkanal nach Verifikation funktioniert (OK/NOK erreicht Max)

> **Tests:**
> - [ ] **T.01** — Code-Punkt: Tests grün + Build OK → Verifikation bestanden
> - [ ] **T.02** — Code-Punkt: Tests rot → Verifikation fehlgeschlagen, Max wird informiert
> - [ ] **T.03** — Konzept-Punkt: Zielbedingung erfüllt → OK
> - [ ] **T.04** — Konzept-Punkt: Unklarheit → Rückfrage an Max
> - [ ] **T.05** — Verifikation bestanden + Skill #46 geladen → Status+Datum in index.md + 🤖-Block in blocks.md
> - [ ] **T.06** — Verifikation fehlgeschlagen → kein Commit, keine Änderung an index.md/blocks.md
> - [ ] **T.07** — Rückkanal: Verifikations-Ergebnis erreicht Max korrekt

---

💬 **Sub-Diskussion fortsetzen**