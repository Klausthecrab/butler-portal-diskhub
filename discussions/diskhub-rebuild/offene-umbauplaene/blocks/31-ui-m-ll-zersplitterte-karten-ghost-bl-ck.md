### UI Müll / zersplitterte Karten — Ghost-Blöcke durch ### im Content
*— · 25.05.2026*

**Problem**

Wenn Hermi beim Editieren einer Textbox in blocks/ interne Überschriften mit `###` statt `##` schreibt, splittet der Frontend-Parser `parseBlocksMd()` bei *jedem* `###`. Ergebnis: statt einer zusammenhängenden Accordion-Karte entstehen im UI mehrere separate Karten (Ghost-Blöcke).

**Beispiel (25.05.2026):** box-30 "Erledigte ausblenden — Globaler Toggle für DiskHub" enthielt intern 10x `###` (z.B. `### Ansatz`, `### UI-Effekt`, `### Betroffene Dateien`). Im UI erschienen 10 zusätzliche Karten — visueller Müll, der wie separate Einzelthemen aussah, obwohl es nur Update-Einträge innerhalb einer Box waren.

**Ursache**
Intern: Hermi hat beim Schreiben der Textbox instinktiv `###` für Zwischenüberschriften verwendet (Markdown-Gewohnheit).
Systemisch: Der Parser splittet global — ohne Rücksicht auf Dateigrenzen. Die API prüft nicht ob eine blocks/*.md-Datei mehr als ein `###` enthält.

**Betroffene Sicht**
Kazzle sieht im UI eine zersplitterte, unübersichtliche Kartenwüste. Die visuelle Struktur verspricht vollwertige Einzelthemen — aber beim Aufklappen sind es nur Abschnitte einer einzigen Box. Das verwirrt und stört.

**Lösungsrichtung (technisch)**
Zwei Ansätze stehen zur Wahl:

1. **Backend-seitig:** Der `edit-block`/`add-box`-Endpoint in routes.py wandelt interne `###`-Zeilen automatisch in `##` um, BEVOR die Datei geschrieben wird. Ghost-`###` landen gar nicht erst auf der Platte.

2. **Parser-seitig:** `parseBlocksMd()` in Page.jsx splittet im Einzeldateien-Modus (wenn `blocks_files[]` existiert) nicht mehr global, sondern wertet nur die erste `###` pro Datei als Block-Titel. Alle weiteren `###` bleiben Content — egal was in der Datei steht.

**Status**
🔜 offen — Entscheidung steht aus.
