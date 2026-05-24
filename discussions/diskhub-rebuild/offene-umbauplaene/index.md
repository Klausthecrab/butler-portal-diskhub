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

### #10: Header-Box mit weißem Hintergrund + Trennlinien || CSS für hellen Header (✓ erledigt)

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

### #33: Sticky-Header-Overlap fixen || Header schließt bündig ab (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** `.docPanel` hatte `padding: 20px 24px` — der sticky `.docTabs` bei `top: 0` saß innerhalb dieser Padding-Lücke. Beim Scrollen wanderte Content (Terracotta-`.discHeader`) hinter die Tabs und schimmerte durch die 20px-Lücke durch. Fix: `.docPanel` padding-top entfernt (`padding: 0 24px 20px`), `.docTabs` mit `margin: 0 -24px` edge-to-edge gespannt und eigenes `padding: 0 24px` für horizontale Innenabstände. Tabs sitzen jetzt bündig am Panel-Top — kein Schlitz mehr. Build OK, Health-Check bestanden.

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
> - [x] **S.05** — Reihenfolge erzwingen: (1) `(✓ erledigt)` + `*Erledigt: DD.MM.YYYY*` in index.md schreiben, (2) Doku-Content an bestehenden Eintrag anhängen, (3) `git add . && git commit -m "done #49: ..." && git push`
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

─────────────────────

diskhub-doc Skill erstellt.

Was gemacht:
- Vorschlag → Bestätigung → Umsetzung als strikter Workflow
- Zwei Sicherheits-Gates (Skill laden + Vorschlag bestätigen)
- Bullet-Point-Format statt Wall of Text
- Zweimal iteriert (Gültigkeitsbereich + Ort-Kontext + Option A)
- Altlast bereinigt: doppelter 🤖-Block aus blocks.md entfernt

### #29: UI-Layout: Preview auf 30-35 % → Textbox #box-12

### #30: Zwei-Phasen-Button "In Sub entwickeln" → Textbox #box-13

### #31: Technisch korrekte Referenz im Pfad-Button → Textbox #box-14

### #32: Prompt-Vorlagen bei "+ Neue Textbox" → Textbox #box-15

### #34: Diskussions-Struktur-Konzept / Archiv → Textbox #box-16

### #35: Lightbox für Bilder → Textbox #box-17

### #36: STRG+V aus Zwischenablage (Screenshots) in Diskussionen → Textbox #box-18

### #37: Bild-Modal — Eigenständiger STRG+V/Upload-Dialog für Screenshots (geplant) → Textbox #box-19

### #39: Dead Code Cleanup — Alten 📷-Button + pendingImage-Logik aus addBoxSection entfernen → Textbox #box-20

### #42: Jedes Element als Session-Starter → Textbox #box-21

### #43: Plan-Phase vor Umsetzung → Textbox #box-22

### #44: Prompt-Baukasten im Webhook → Textbox #box-23

### #45: Auto-Rückkanal → Textbox #box-24

### #47: Session-interne Verifikation → Textbox #box-25

### #48: Status Single Source of Truth — Manuelle Status-Zeilen aus READMEs entfernen → Textbox #box-26

---

💬 **Sub-Diskussion fortsetzen**
