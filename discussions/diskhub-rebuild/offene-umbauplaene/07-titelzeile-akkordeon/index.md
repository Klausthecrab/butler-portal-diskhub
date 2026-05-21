# Titelzeile im Akkordeon vereinheitlichen

**Erstellt:** 21.05.2026 · 1 Block

### readmeTitle()-Helper + konsistenter Header

Neue Funktion `readmeTitle(md)` parst ersten H1 aus Markdown. Akkordeon-Header zeigt `readmeTitle(sub.readme) || sub.name` statt nur `sub.name`. Single Source: Titel kommt immer aus der README, egal ob zugeklappt oder aufgeklappt.