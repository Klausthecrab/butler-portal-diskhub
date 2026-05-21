# Status-Auslese in Sub-Akkordeon fixen

**Erstellt:** 21.05.2026 · **Status:** ● offen

**Problem:** Im aufgeklappten Akkordeon von "Offene Umbaupläne" werden alle 6 Sub-Diskussionen als "offen" angezeigt — obwohl 4 davon (Punkte 3, 4, 5, 6) bereits ✓ erledigt sind. Der Status wird nicht sauber übergeben oder ausgegeben.

**Lösungsansätze:**
1. **Echten Status aus data.subs lesen** — backend liefert `status`-Feld pro Sub, aber wird aktuell im Akkordeon nicht ausgewertet. Fix: `renderIndexMd()` oder die Sub-Rendering-Logik muss den Status auswerten
2. **Status ganz ausblenden** — wenn der Status im Sub-Listing nicht zuverlässig ist, lieber gar nicht anzeigen als falsche Werte

**Keine Option:** Hardcoded "offen" separat pflegen wollen.

**Offene Fragen:**
- Wo genau wird der Status aktuell falsch ausgegeben? (renderIndexMd? discHeader? Sub-Karte?)
- Reicht es den Status aus data.subs zu lesen oder braucht es Backend-Änderungen?