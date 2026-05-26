### fertige ausblenden als default (✓ erledigt)
*— · 26.05.2026*

**Problem**
quasi selbsterklärend. ich will den toggle (also somit auch das Inhaltsverzeichnis) auf "erledigt ausblenden" setzen

**Lösung**
—

**Status**
✅ umgesetzt

**Fortschritt (26.05.2026):**
- [x] `useState(false)` → `useState(true)` in Page.jsx Z. 1105
- [x] Frontend-Build via `vite build` (16s)
- [x] Verifikation im Browser: Toggle "Ausblenden ✓" ist standardmäßig aktiviert (checked=true)
- [x] Git commit + push (diskhub-repo + dashboard-repo)

**🚩 Bekanntes Problem — TOC ignoriert Default**
Der Default-Toggle funktioniert (checked=true), aber das Inhaltsverzeichnis (TOC) respektiert ihn **nicht** — weder in Haupt- noch in Sub-Diskussionen. Der TOC zeigt weiterhin alle Einträge, auch erledigte. Er reagiert nur auf **manuelle** Toggle-Klicks, nicht auf den initialen `hideDone=true`-State.

→ **In Box #114 `erledigte-ausblenden-toggle` als offenes Issue erfasst.**
