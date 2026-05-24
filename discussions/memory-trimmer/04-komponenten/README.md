# Komponenten || Script-Übersicht

**Erstellt:** 24.05.2026 · **Status:** 0 erledigt · 1 offen

| Script | Aufgabe |
|--------|---------|
| `run_trimmer.py` | Nächtlicher Cron: MEMORY.md trimmen auf Puffer |
| `run_evaluator.py` | Alte Version — ⛔ deprecated |
| `run_review_evaluator.py` | Aktiver Evaluator mit Ja/Eventuell/Nein |
| `run_section_analyzer.py` | Per-Sektion-Analyse mit KI-Einschätzung |

**Portal (butler-portal-memory-trimmer) — 4 Tabs:**
- **memory.md-Tab** — Live-Ansicht + Highlighting + localStorage
- **Review-Tab** — Evaluator-Ergebnisse mit Action-Buttons ✅❌⏸️
- **Config-Tab** — trimmer_config.json editierbar
- **History-Tab** — Zeitleiste + Kategorien-Trend

> **Ergebnis:** Vollständiger 4-Tab-Portal-Stack mit Backend v1.1.
*session: komponenten-20260517 · 17.05.2026*