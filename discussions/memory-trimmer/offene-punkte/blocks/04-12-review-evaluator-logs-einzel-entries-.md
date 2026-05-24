### #12 — 📋 review-evaluator Logs: Einzel-Entries nachrüsten
*— · 24.05.2026*

▌Problem:
Neue `review-evaluator-*.json` Logs speichern nur Aggregatzahlen (`categories: {ja, eventuell, nein}`), keine individuellen Einträge mit Text und Begründung. Daher tauchen sie nicht in der BausteinCard-Liste auf — nur alte `evaluator-*.json` Logs liefern Einzel-Entries.

▌Ziel:
Auch die neuen Logs liefern Einzel-Entries → sichtbar als BausteinCard im Portal.

▌Aufgaben:
- `run_review_evaluator.py` erweitern: `entries[]` ins Log-Format aufnehmen (Text + Kategorie + Begründung)
- Backward-compatibel: alte Logs ohne `entries` ignorieren
- Portal-Endpunkt prüfen, ob er neue Logs korrekt parst

▌Aufwand: Mittel

---
