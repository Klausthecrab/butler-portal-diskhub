# OOM-Vorbeugung — Swap voll → OOM-Killer → Freeze (26.05.2026)

**Erstellt:** 27.05.2026 · **Zuletzt aktualisiert:** 27.05.2026  
**Status:** 0 erledigt · 4 offen

Butler hat in der Nacht zum 27.05.2026 einen Freeze erlebt — kein harter Absturz, das System hat sich nach ~2 Minuten wieder gefangen. Die Kernel-Logs zeigen eine klare Kausalkette:

1. **Swap war 100% voll** (8GB, alles belegt)
2. **OOM-Killer** hat einen Python-Prozess im `hermes-gateway.service` gekillt (PID 198431, ~333MB RSS)
3. **Kernel-Workqueue** (`delayed_fput`) hing fest → CPU-Hog → System-Freeze

SAR-Daten belegen: Der Rechner hatte zum Zeitpunkt ~55% RAM-Auslastung (17.6GB/31GB), aber der gesamte Swap war ausgereizt. Dashboard und Registry waren nach dem Freeze nicht mehr erreichbar — die Python-Prozesse wurden während des Freezes abgeräumt.

Diese Sub-Diskussion sammelt Maßnahmen zur Vorbeugung — sowohl kurzfristige (Swap vergrößern, OOM-Schutz) als auch langfristige (Monitoring, RAM-Limits setzen).