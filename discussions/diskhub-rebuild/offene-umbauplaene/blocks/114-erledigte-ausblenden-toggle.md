### "erledigte ausblenden" toggle (✓ erledigt)
*— · 26.05.2026*

**Problem**
Der per Standard auf "Ausblenden" stehende Toggle wirkt korrekt auf den Inhalt (Boxen + Diskussions-Einträge), aber nicht auf das Inhaltsverzeichnis (TOC). Das TOC zeigt weiterhin alle Einträge — es reagiert nur auf manuelle Klicks, nicht auf den initialen Default.

**Ursache (UI-Ebene)**
Der TOC hat einen eigenen Filter ("Alle" / "Nur Offene" / "Nur ✅"), der unabhängig vom Haupt-Toggle startet. Der Haupttoggle startet auf "Ausblenden = an", der TOC-Filter startet aber auf "Alle anzeigen". Erst beim Klick werden beide synchron geschaltet.

**Lösung**
Der TOC-Filter startet jetzt ebenfalls auf "Nur Offene" — synchron zum Haupt-Toggle. Einzeiler im Code: der initiale Wert des TOC-Filters wurde von "Alle" auf "Nur Offene" geändert.

**Status**
✅ umgesetzt

**Fortschritt (26.05.2026):**
- [x] Page.jsx Zeile 1106: `useState('all')` → `useState('open')`
- [x] Frontend-Build
- [x] Browser-Verifikation: TOC zeigt initial nur offene Einträge in Haupt- und Sub-Diskussionen
- [x] Git commit + push
