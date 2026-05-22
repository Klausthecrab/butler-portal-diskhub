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

### #24: Button-Unterscheidbarkeit für Textboxen

*— · 22.05.2026*

Die zwei Buttons pro Textbox ("Zu Sub ändern" / "Als Sub übernehmen") sind im Unterschied unklar. Möglichkeit: Hover-Text/Tooltip zur Erklärung, oder auf einen Button reduzieren. Der verbleibende Button soll eine Discord-Session starten (im rechten Preview-Panel sichtbar) mit Prompt: "Lass uns aus dieser Textbox-Notiz eine Sub-Diskussion entwickeln. Mache Vorschläge für das Anlegen"

### #25: Textbox-Operationen: Bearbeiten + Löschen

*— · 22.05.2026*

Es fehlen Bearbeiten- und Löschen-Buttons für Textboxen.

### #26: Textbox-Referenz (Pfad/Identifikator)

*— · 22.05.2026*

Ein "Pfad"/Identifikator fehlt, um in einer offenen Diskussion auf eine bestimmte Textbox verweisen/linken zu können.

---

💬 **Sub-Diskussion fortsetzen**