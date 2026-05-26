### #39: Kurzbeschreibung im aufgeklappten Akkordeon (✓ erledigt)
*— · 21.05.2026*

**Problem:** Wenn eine Sub-Karte aufgeklappt wird, sieht man sofort die volle README. Es fehlt eine prägnante Einzeiler-Zusammenfassung, die auf einen Blick sagt worum es in dieser Sub-Diskussion geht.

**Lösung:**
- `extractPreamble()` extrahiert alles zwischen H1 und erstem `---`/`###` aus `sub.readme`
- Akkordeon zeigt diese Präambel + "→ Vollständige Ansicht"-Link

**Status**
✅ erledigt