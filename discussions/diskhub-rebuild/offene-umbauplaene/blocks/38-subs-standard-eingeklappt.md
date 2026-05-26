### #38: Standardmäßig eingeklappte Subs fixen (✓ erledigt)
*— · 21.05.2026*

**Problem:** In der Detail-Ansicht einer Diskussion sind alle Sub-Karten standardmäßig aufgeklappt. Das ist falsch — sie sollen standardmäßig eingeklappt sein.

**Lösung:**
- `useEffect` auf `data`: findet `data.subs.find(sub => sub.status?.offen > 0)` und setzt `expandedSubs = new Set([firstOpen.id])`
- Alle anderen Subs bleiben zugeklappt
- Nur der erste offene Sub wird automatisch geöffnet

**Status**
✅ erledigt