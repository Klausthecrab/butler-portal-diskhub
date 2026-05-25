### 31.A — Backend wandelt interne ### automatisch in ## um (✓ erledigt)
*— · 25.05.2026*

**Ansatz**

Im Backend (routes.py) prüfen die Endpoints `edit_block()` und `add_box()` den Content bevor sie die Datei schreiben: enthält der Content `^###`-Zeilen außerhalb der ersten (Titel-)Zeile? Dann alle internen `###` → `##` umwandeln.

**Vorteile**
- Ghost-Blöcke entstehen gar nicht erst auf der Platte
- Ein einziger Ort, Änderung minimal
- Wirkt für alle Aufrufer (Hermi, Claude Code, ✏️-Button, API-Direktaufrufe)
- Einfach zu testen: eine Datei mit mehreren `###` per API schreiben → prüfen ob nur 1 `###` übrig ist

**Nachteile**
- Versteckt den Fehler still — kein Hinweis dass falsches Format verwendet wurde
- Nur backend-seitig, der Parser bleibt unverändert

**Ort**
`backend/routes.py` — die `edit_block()`- und `add_box()`-Funktionen

**Umsetzung**
Neue Hilfsfunktion `_sanitize_internal_headings()`:
- Empfängt den rohen Content
- Prüft jede Zeile auf `^### ` (außerhalb des Titels)
- Wandelt diese in `## ` um
- Wird in `edit_block()` und `add_box()` vor dem Datei-Schreiben aufgerufen

**Fortschritt (25.05.2026):**
- [x] Hilfsfunktion `_sanitize_internal_headings()` in routes.py eingebaut
- [x] Aufruf in `edit_block()` (Zeile 1703) — Einzeldatei + Legacy-Pfad
- [x] Aufruf in `add_box()` (Zeile 1996) — Einzeldatei + Legacy-Pfad
- [x] Dashboard neugestartet (Port 8090) — Code live
- [x] Verifikation add-box: Content mit 2x `###` → Datei hat 1x `###` (nur Titel)
- [x] Verifikation edit-block: Content mit 2x `###` → Datei hat 1x `###` (nur Titel)

**Status**
✅ erledigt
