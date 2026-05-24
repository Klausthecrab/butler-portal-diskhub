# Memory Trimmer — Vision & Konzept

**Sub-Diskussionen:** spezifikation · implementierung · offene-punkte · features

---

## Vision

Tolerantes Memory-System für Hermes: MEMORY.md mit Puffer, nächtlicher Trimmer + Evaluator, Portal-Visualisierung. Der Agent kann ohne Umbau-Training wachsen — der Trimmer kümmert sich um Limits, Puffer und Struktur.

## Architektur: Klare Trennung Trimmer vs. Evaluator

**Kernentscheidung:** Zwei strikt getrennte Verantwortlichkeiten.

### Trimmer — liefert Rohdaten
- Resetet MEMORY.md täglich auf MEMORY_BASE.md
- **Output pro Lauf:** review-list mit rausgefallenen §-Abschnitten
- Keine Bewertung, keine Kategorisierung, kein LLM

### Evaluator — bewertet die Rohdaten
- Liest `unreviewed`-Einträge aus review-list
- LLM bewertet jeden Eintrag: Ja / Eventuell / Nein
- Pattern Detection: wiederholte Einträge erkennen

### Datenfluss
```
Trimmer-Lauf (02:00)
  │
  ├─ MEMORY.md → zurücksetzen auf MEMORY_BASE.md
  ├─ Diff: was ist rausgefallen?
  └─ review-list += {text, date, status: "unreviewed"}
       │
       ▼
Evaluator (nach Trimmer)
  │
  ├─ LLM → Ja/Eventuell/Nein + Begründung
  └─ review-list += {category, reason}
       │
       ▼
Review-Tab (Portal — Max entscheidet)
  ├─ Bestätigen ✅ → schreibt Vorschlag in MEMORY_BASE.md
  ├─ Ablehnen ❌ → rejected
  └─ Zurückstellen ⏸️ → deferred
```

### Komponenten

| Script | Aufgabe |
|--------|---------|
| `run_trimmer.py` | Nächtlicher Cron: MEMORY.md trimmen auf Puffer |
| `run_evaluator.py` | Alte Version — ⛔ deprecated |
| `run_review_evaluator.py` | Aktiver Evaluator mit Ja/Eventuell/Nein |
| `run_section_analyzer.py` | Per-Sektion-Analyse mit KI-Einschätzung |

### Portal (butler-portal-memory-trimmer)
- **memory.md-Tab** — Live-Ansicht + Highlighting + localStorage
- **Review-Tab** — Evaluator-Ergebnisse mit Action-Buttons
- **Config-Tab** — trimmer_config.json editierbar
- **History-Tab** — Zeitleiste + Kategorien-Trend

### Quellpfade
- Portal-Code: `~/repos/butler-portal-memory-trimmer/`
- Projekt-Daten: `~/data/projects/memory-trimmer/`
- Cron-Logs: `~/data/projects/memory-trimmer/logs/`

### Baseline-Umstellung
- MEMORY_BASE.md ist SSoT (versioniert im Config-Repo)
- Baseline ist READ-ONLY für Hermi — nur Max ändert sie
- Fundort: `~/repos/butler-hermi-config/hermi-dummy-memory-2026-05-03.md`

### Registry
- `memory-trimmer` entry: type=portal, has_backend=1
- Health-Check: `GET /api/trimmer/status`
- Route: `/memory-trimmer`

### Kill-Switch
- `POST /api/trimmer/toggle` — `.trimmer_enabled` Flag
- Kill aktiv → Cron bricht ab (gilt nicht als Ausfall für Health-Check)
- Portal zeigt Status (Aktiv/Pausiert)