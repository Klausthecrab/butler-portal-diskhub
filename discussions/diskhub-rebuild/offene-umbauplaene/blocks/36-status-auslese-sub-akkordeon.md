### #36: Status-Auslese in Sub-Akkordeon fixen (✓ erledigt)
*— · 21.05.2026*

**Problem:** Im aufgeklappten Akkordeon von "Offene Umbaupläne" werden alle Sub-Diskussionen als "offen" angezeigt — obwohl einige bereits ✓ erledigt sind. Der Status wird nicht sauber übergeben oder ausgegeben.

**Lösung:**
- `sub.status` aus API-Daten im Header gerendert: grüner Badge bei `erledigt > 0 && offen === 0`, gelber Badge bei `offen > 0`
- Kein hardcoded "offen" mehr

**Status**
✅ erledigt