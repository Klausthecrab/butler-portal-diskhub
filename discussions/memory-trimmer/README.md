Memory Trimmer
Erstellt: 04.05.2026 · Zuletzt aktualisiert: 24.05.2026
Status: 12 umgesetzt · 5 offen · Portal v1.1 live ✅
Portal-Route: /memory-trimmer (Dashboard Port 8090)
Projekt-Pfad: ~/data/projects/memory-trimmer/ (Code + Scripte + Config)
Cron: täglich 02:00 (Trimmer + Evaluator + Review-Evaluator)
Sub-Diskussionen: spezifikation · implementierung · offene-punkte · features
Vision
Tolerantes Memory-System für Hermes: MEMORY.md mit Puffer, nächtlicher Trimmer + Evaluator, Portal-Visualisierung. Der Agent kann ohne Umbau-Training wachsen — der Trimmer kümmert sich um Limits, Puffer und Struktur. Kein Hermes-Core-Code, reines Sidecar.
Architektur: Trimmer vs. Evaluator
Zwei strikt getrennte Verantwortlichkeiten:
Trimmer — liefert Rohdaten: Resetet MEMORY.md täglich auf MEMORY_BASE.md, Output pro Lauf ist eine review-list mit rausgefallenen §-Abschnitten. Keine Bewertung, kein LLM.
Evaluator — bewertet die Rohdaten: Liest unreviewed-Einträge aus review-list, LLM bewertet (Ja/Eventuell/Nein), Pattern Detection für wiederholte Einträge.
Datenfluss
Trimmer-Lauf (02:00) → MEMORY.md zurücksetzen auf MEMORY_BASE.md → Diff: was ist rausgefallen? → review-list += {text, date, status: "unreviewed"} → Evaluator (nach Trimmer) → LLM → review-list += {category, reason} → Review-Tab (Portal) → Bestätigen ✅ (schreibt in MEMORY_BASE.md) / Ablehnen ❌ / Zurückstellen ⏸️
Komponenten
| Script | Aufgabe |
|--------|---------|
| run_trimmer.py | Nächtlicher Cron: MEMORY.md trimmen auf Puffer |
| run_evaluator.py | Alte Version — ⛔ deprecated |
| run_review_evaluator.py | Aktiver Evaluator mit Ja/Eventuell/Nein |
| run_section_analyzer.py | Per-Sektion-Analyse mit KI-Einschätzung |
Portal (butler-portal-memory-trimmer)
- memory.md-Tab — Live-Ansicht + Highlighting + localStorage
- Review-Tab — Evaluator-Ergebnisse mit Action-Buttons
- Config-Tab — trimmer_config.json editierbar
- History-Tab — Zeitleiste + Kategorien-Trend
Quellpfade
- Portal-Code: ~/repos/butler-portal-memory-trimmer/
- Projekt-Daten: ~/data/projects/memory-trimmer/
- Cron-Logs: ~/data/projects/memory-trimmer/logs/
- Archivierte Session-Dokus: ~/data/projects/memory-trimmer/archive/
Baseline-Umstellung
MEMORY_BASE.md ist SSoT (versioniert im Config-Repo), READ-ONLY für Hermi — nur Max ändert sie. Fundort: ~/repos/butler-hermi-config/hermi-dummy-memory-2026-05-03.md
Registry
memory-trimmer entry: type=portal, has_backend=1, Health-Check: GET /api/trimmer/status, Route: /memory-trimmer
Kill-Switch
POST /api/trimmer/toggle — .trimmer_enabled Flag. Kill aktiv → Cron bricht ab (gilt nicht als Ausfall für Health-Check). Portal zeigt Status (Aktiv/Pausiert).
Offene Punkte
- Section-Analyzer-Prompt
- Tabs konsolidieren
- Graveyard-UI
- Review-Evaluator-Entries