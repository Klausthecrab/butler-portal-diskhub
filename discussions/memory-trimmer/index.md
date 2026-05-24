# Memory Trimmer — Vision & Konzept

**Sub-Diskussionen:** offene-punkte

---

### Vision || Tolerantes Memory-System
*— · 04.05.2026*

Tolerantes Memory-System für Hermes: MEMORY.md mit Puffer, nächtlicher Trimmer + Evaluator, Portal-Visualisierung. Der Agent kann ohne Umbau-Training wachsen — der Trimmer kümmert sich um Limits, Puffer und Struktur. Kein Hermes-Core-Code, reines Sidecar.

### Architektur: Trimmer vs. Evaluator || Zwei strikt getrennte Verantwortlichkeiten
*— · 17.05.2026*

**Kernentscheidung:** Zwei strikt getrennte Verantwortlichkeiten.

**Trimmer** — liefert Rohdaten. Resettet MEMORY.md täglich auf MEMORY_BASE.md. Output pro Lauf: review-list mit rausgefallenen §-Abschnitten. Keine Bewertung, keine Kategorisierung, kein LLM.

**Evaluator** — bewertet die Rohdaten. Liest unreviewed-Einträge aus review-list. LLM bewertet jeden Eintrag: Ja / Eventuell / Nein. Pattern Detection für wiederholte Einträge.

**Datenfluss:**
```
Trimmer-Lauf (02:00) → MEMORY.md zurücksetzen auf MEMORY_BASE.md
→ Diff: was ist rausgefallen?
→ review-list += {text, date, status: "unreviewed"}
→ Evaluator (nach Trimmer) → LLM → Ja/Eventuell/Nein + Begründung
→ Review-Tab (Portal — Max entscheidet):
  ├─ Bestätigen ✅ → schreibt Vorschlag in MEMORY_BASE.md
  ├─ Ablehnen ❌ → rejected
  └─ Zurückstellen ⏸️ → deferred
```

**Sicherheitsmechanismen:**
| Mechanismus | Beschreibung |
|---|---|
| Atomic Replace | MEMORY.md via Temp-Datei + mv — nie leer |
| Verifikation | diff nach Reset — Fehler erkannt |
| Live-Backup | Jeder Zustand archiviert |
| Kein LLM beim Reset | Reines cp — keine Halluzination |
| LLM-Isolation | Evaluator bekommt nur Diffs |
| Fallback | Bei Fehler: Live-Backup wiederherstellen |
| Puffer | MEMORY.md hat bewusst freien Platz |

> **Ergebnis:** Zwei strikt getrennte Verantwortlichkeiten ohne LLM im Reset-Pfad.
*session: spec-20260517 · 17.05.2026*

### Setup (Python/Flask/n8n) || Technische Basis
*— · 17.05.2026*

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

### Komponenten || Script-Übersicht
*— · 17.05.2026*

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

### Features v1.0–v1.9 || Release-Übersicht (✓ erledigt)
*— · 24.05.2026*

| Feature | Version | Beschreibung |
|---------|---------|-------------|
| Tabs konsolidiert (B4) | v1.9 | Übersicht+Monitoring+Nacht-Report → 📊 Übersicht |
| Running-Badge (🟢/🔄/💤) | v1.8 | Live-Status mit Polling + Pulse-Glow |
| Per-Sektion-Analyse + Pfad-Kopieren | v1.8 | 🔍-Button pro § + 📋 Pfad |
| Kategorien-Trend-Grafik | v1.6 | Stacked-Bar-Chart + Projekt-Tracking |
| History-Formatierte Zusammenfassungen | v1.7 | Trimmer+Evaluator+Reviews lesbar |
| Zeitleisten-Visualisierung | v1.5 | Memory-Verlauf mit Tag-Ansicht + Diff |
| Config editierbar | v1.5 | Cron, LLM-Modell, Puffer via UI |
| USER_BASE.md editierbar | v1.4 | Textarea statt Read-Only |
| Memory-Tab Base-Vergleich | v1.2 | 🟢/🟡/🔴 Markierung + Metriken |
| Konsolidierter Nacht-Report | v1.3 | Pipeline-Visualisierung 3 Sektionen |
| Live-Countdown | v1.5 | Bis zum nächsten Cron-Lauf (02:00) |
| Review-Tab Frontend | v1.3 | Sortierung + Action-Buttons + Modal |
| Dry-Run History-Fix | v1.3 | Filename-Lookup + Cache-Key-Fix |
| Repair #1: Section Analysis | v1.8 | §-Überschriften + Post-Endpoint |

Alle Feature-Sub-Diskussionen wurden in diesen Block konsolidiert — kein Datenverlust.

### Legacy: Alter Evaluator
*— · 22.05.2026*

`run_evaluator.py` — ⛔ deprecated, liegt als Fallback. Ersetzt durch Review-Evaluator (`run_review_evaluator.py`).