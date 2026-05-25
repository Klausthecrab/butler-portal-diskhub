### Option A: Backend wandelt interne ### automatisch in ## um
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
`server.py` oder `routes.py` im Butler-Dashboard — die `edit_block()`- und `add_box()`-Funktionen

**Umsetzung**
- Nach dem Empfangen des Contents, vor dem Datei-Schreiben
- Regex oder Split: erste Zeile behalten, rest auf `^### ` prüfen
- Nur umwandeln, wenn `^### ` in Zeilen 2..N vorkommt

**Status**
🔜 offen
