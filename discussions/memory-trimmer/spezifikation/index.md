# Spezifikation

**Sub-Diskussion von:** memory-trimmer  
**Status:** ✅ Abgeschlossen (Stand 22.05.2026)

---

## Kernlogik

- **Trimmer:** Nächtlicher Cron (02:00) — liest MEMORY.md, zählt Zeichen, trimmed auf Puffer-Größe (default 1.800 Zeichen), schiebt Überlauf ins Graveyard
- **Evaluator:** Bewertet MEMORY.md-Einträge nach Wichtigkeit (A/B/C) + Genre-Kategorien — liefert Lösch-Empfehlungen
- **Review-Evaluator:** Automatische Qualitäts-Reviews — prüft ob Trimmer sinnvoll getrimmt hat

## Portal (Frontend)

- 4 Tabs: Übersicht, memory.md, Review, Config
- Kill-Switch für Cron
- Registry-Integration (Service-Eintrag in butler-registry)
- Status/Health-Endpoints

## Setup

- Python 3.12, Flask-Backend im Dashboard-Blueprint
- Frontend: React (kein Router, Page-Komponente)
- via n8n gesteuert (Cron-Trigger → run_memory_trimmer.sh → hermes CLI)
