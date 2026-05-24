### #5 — Section-Analyzer-Prompt verbessern (Konsequenz/Scope/Diskussion)
*— · 24.05.2026*

▌Problem:
Der Analyse-Prompt in `run_section_analyzer.py` kategorisiert zu stumpf (No-Gos = immer hoch, Projektkontext = immer mittel). Gewünscht sind konsequenzbasierte Bewertungen statt statischer Regeln.

▌Ziel:
Jede Sektion-Analyse liefert:
- **Scope-Feld:** `🌐 global` (jede Session) vs `🎯 spezifisch` (seltene Kontexte)
- **Konsequenz-Feld:** "Was passiert konkret, wenn diese Info fehlt?"
- **Diskussion-Feld:** Optionale offene Frage an Max zur Entscheidung
- Bestehende Felder (heading, importance, can_shorten, optimized, rationale) bleiben erhalten

▌Aufgaben:
- **Backend:** Prompt in `run_section_analyzer.py` um Scope/Konsequenz/Diskussion erweitern
- **Frontend:** Scope-Badge (🌐/🎯), Konsequenz-Zeile, Diskussion-Callout in §-Karte
- Neue CSS-Klassen: `.sectionScopeBadge`, `..sectionScopeGlobal`, `..sectionScopeSpecific`, `.sectionConsequence`, `.sectionDiscussion`
- Backward-compatibel bleiben

▌Aufwand: Gering–Mittel (~30 Min Backend, ~45 Min Frontend)

---
