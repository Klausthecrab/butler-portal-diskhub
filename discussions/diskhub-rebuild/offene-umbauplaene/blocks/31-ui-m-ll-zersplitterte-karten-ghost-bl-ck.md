### 31 UI Müll / zersplitterte Karten — Ghost-Blöcke durch ### im Content (✓ erledigt)
*— · 25.05.2026*

**Problem**

Wenn Hermi beim Editieren einer Textbox in blocks/ interne Überschriften mit `###` statt `##` schreibt, splittet der Frontend-Parser `parseBlocksMd()` bei *jedem* `###`. Ergebnis: statt einer zusammenhängenden Accordion-Karte entstehen im UI mehrere separate Karten (Ghost-Blöcke).

**Beispiel (25.05.2026):** box-30 "Erledigte ausblenden — Globaler Toggle für DiskHub" enthielt intern 10x `###` (z.B. `### Ansatz`, `### UI-Effekt`, `### Betroffene Dateien`). Im UI erschienen 10 zusätzliche Karten — visueller Müll, der wie separate Einzelthemen aussah, obwohl es nur Update-Einträge innerhalb einer Box waren.

**Ursache**
Intern: Hermi hat beim Schreiben der Textbox instinktiv `###` für Zwischenüberschriften verwendet (Markdown-Gewohnheit).
Systemisch: Der Parser splittet global — ohne Rücksicht auf Dateigrenzen. Die API prüft nicht ob eine blocks/*.md-Datei mehr als ein `###` enthält.

**Betroffene Sicht**
Kazzle sieht im UI eine zersplitterte, unübersichtliche Kartenwüste. Die visuelle Struktur verspricht vollwertige Einzelthemen — aber beim Aufklappen sind es nur Abschnitte einer einzigen Box. Das verwirrt und stört.

**Lösung**
31.A: Backend-Konvertierung — `_sanitize_internal_headings()` wandelt interne `###` automatisch in `##` um bevor die Datei geschrieben wird. Greift in `edit_block()` und `add_box()`. Implementiert und live.
31.B: Parser-seitig — `parseBlocksMd()` im Einzeldateien-Modus nur erste `###` pro Datei als Block-Titel werten. Noch offen.

**Fortschritt (25.05.2026):**
- [x] Ursache identifiziert: interne `###` in box-30 erzeugten 10 Ghost-Blöcke
- [x] Box-30 behoben: interne `###` zu `##` umgewandelt
- [x] Option 31.A umgesetzt: Backend-Konvertierung in routes.py
- [x] Verifiziert: add-box + edit-block wandeln interne `###` automatisch um
- [x] Option 31.B dokumentiert als Alternative (Parser-seitig)

**Status**
✅ erledigt
