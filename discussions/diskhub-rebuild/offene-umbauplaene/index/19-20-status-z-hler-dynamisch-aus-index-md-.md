### #20: Status-Zähler dynamisch aus index.md parsen (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** Neue Hilfsfunktion `_parse_index_status()` zählt `### #XX:`-Einträge und `(✓ erledigt)`-Marker aus index.md. Angewandt in `get_discussion()` (überschreibt README-basierte `done_count`/`open_count` im parsed-Header) und in `_scan_discussions()` (List-Endpoint + Sub-Status). Frontend rendert die Werte bereits via `discStats` und Sub-Badges — keine Frontend-Änderung. Enthüllt dass #15 (Trennlinien) noch nicht als erledigt markiert ist — 18/5 statt 19/4. README-Metadaten beider Diskussionen synchronisiert.
