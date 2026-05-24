### #19: "Zuletzt aktualisiert" dynamisch aus Git-Log (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** `_parse_discussion_header()`-Aufruf in `get_discussion()` um Git-Log-Logik ergänzt: nach dem Parsen wird `header['updated_at']` durch das tatsächliche Änderungsdatum aus `git log -1 --format=%ct -- .` im Diskussions-Ordner ersetzt. Fallback auf hartcodiertes README-Datum bei Fehlern. Frontend rendert `updated_at` bereits via `discStats` — keine Frontend-Änderung nötig. Build OK.
