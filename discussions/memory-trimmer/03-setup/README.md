# Setup (Python/Flask/n8n) || Technische Basis

**Erstellt:** 24.05.2026 · **Status:** 0 erledigt · 1 offen

- Python 3.12, Flask-Backend im Dashboard-Blueprint
- Frontend: React (kein Router, Page-Komponente)
- via n8n gesteuert (Cron-Trigger → run_memory_trimmer.sh → hermes CLI)
- Portal-Code: `~/repos/butler-portal-memory-trimmer/`
- Projekt-Daten: `~/data/projects/memory-trimmer/`
- Cron-Logs: `~/data/projects/memory-trimmer/logs/`
- MEMORY_BASE.md ist SSoT (versioniert im Config-Repo) — Read-Only für Hermi, nur Max ändert sie
- Registry-Eintrag: type=portal, has_backend=1, Route: `/memory-trimmer`
- Kill-Switch: `POST /api/trimmer/toggle` — .trimmer_enabled Flag

> **Ergebnis:** Setup abgeschlossen und läuft stabil.
*session: setup-20260517 · 17.05.2026*