### Option B: Parser ignoriert interne ### im Einzeldateien-Modus
*— · 25.05.2026*

**Ansatz**

Im Frontend (Page.jsx) wird `parseBlocksMd()` angepasst: wenn die API `blocks_files[]` geliefert hat (Einzeldateien-Modus), splittet der Parser nicht mehr global bei jedem `###`. Stattdessen wird pro Datei nur die erste `###` als Block-Titel gewertet — alle weiteren `###` im Content bleiben als normale `<h3>`-Überschriften in der Card.

**Vorteile**
- Ghost-Blöcke sind unmöglich — egal was in der Datei steht
- Auch bestehende fehlerhafte Dateien werden im UI korrekt dargestellt (kein Nachbessern nötig)
- Toleranter gegenüber allen Editier-Wegen

**Nachteile**
- Komplexere Änderung im Parser — muss Legacy-Sammeldateien (Fallback ohne `blocks_files[]`) korrekt behandeln
- Fehlerhafte Daten bleiben auf der Platte (werden nur im UI versteckt)
- Test-Aufwand höher (beide Pfade testen: Einzeldateien + Legacy)
- Risiko: Parser-Änderung könnte andere Diskussionen beeinflussen

**Ort**
`frontend/src/portals/diskhub/Page.jsx` — Funktion `parseBlocksMd()`

**Umsetzung**
- Prüfen ob `blocks_files[]` existiert und nicht leer
- Wenn ja: jede Datei einzeln parsen, nur erste `###` als Block zählen
- Wenn nein (Legacy): aktuelles Verhalten beibehalten (global split)

**Status**
🔜 offen
