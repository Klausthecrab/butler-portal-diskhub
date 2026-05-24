# Blöcke — offene-punkte

---

### #4 — Automatischer MEMORY_BASE.md-Update (T1) ❌ zurückgestellt
*— · 24.05.2026*

▌Problem:
Automatische Übernahme von Evaluator-Vorschlägen in MEMORY_BASE.md nach X Vorkommen. Der Trimmer erkennt wiederkehrende Patterns ("zum 3. Mal") und könnte theoretisch auto-accepten.

▌Entscheidung:
❌ **Nicht umsetzen.** Der Review-Workflow (E1–E4) ist der richtige Weg: Evaluator macht Vorschläge, Max entscheidet im Review-Tab. Auto-Accept würde Entscheidungslogik in unsichtbare Automatismen verlagern.

▌Aufwand:
Nicht relevant — zurückgestellt. Nur umsetzen wenn Max das später nochmal diskutieren will.

---

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

### #9 — Tabs konsolidieren: Übersicht + Monitoring + Nacht-Report (B4)
*— · 24.05.2026*

▌Problem:
Drei separate Tabs (Übersicht, Monitoring, Nacht-Report) zeigen ähnliche Metriken mit unterschiedlichem Layout. Das ist verwirrend und redundant.

▌Ziel:
Ein Tab "📊 Übersicht" als Single-Pane-of-Glass:
- Kompakte Statuszeile (Trimmer läuft/pausiert, letzter Lauf, nächster Lauf)
- 3–4 Zahlen-Kacheln (Speicher, Bausteine, offene Reviews, Evaluator-Werte)
- **Jede Zahl hat ein `?`-Icon** → Tooltip in einfachem Deutsch (kein Fachjargon)
- Letzter Nacht-Report als einklappbarer Block
- **Kein Tab-Wechseln** mehr für Status-Infos

▌Aufgaben:
- Bestehende Metriken aus 3 Tabs in eine Komponente zusammenführen
- `?`-Tooltip-Komponente bauen (simpler Ein-Satz-Tooltip)
- Alte Tabs entfernen oder als Aliase behalten
- `npm run build`

▌Aufwand: Mittel

---

### #11 — 🧹 Dead CSS-Klassen nach B3 entfernen
*— · 24.05.2026*

▌Problem:
Durch den Umbau der Evaluator-Liste auf BausteinCard sind CSS-Klassen in `Page.module.css` ungenutzt: `evalLatest`, `evalBar`, `evalDetailBtn`, `evalList`, `evalCard`, `evalCardLeft`, `evalDate`, `evalSize`, `evalArrow`.

▌Ziel:
Sauberer Code ohne tote Styles.

▌Aufgaben:
- Ungenutzte CSS-Klassen aus `Page.module.css` entfernen
- Prüfen ob irgendwo anders noch referenziert (`grep -r`)
- `npm run build` zur Bestätigung

▌Aufwand: Gering (~10 Min)

---

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

### #13 — 🔗 review-list.json nicht separat existent
*— · 24.05.2026*

▌Problem:
Die Zielbedingung in B3 (und history-summaries) referenziert `review-list.json` als Datenquelle. Diese Datei existiert nicht als separates JSON — die review_list-Daten stecken in `trimmer-*.json` unter `steps[].step="review_list"`.

▌Ziel:
Konsistente Datenquelle — entweder review-list.json extrahieren oder Doku anpassen.

▌Optionen:
1. review-list.json als separates Artefakt beim Trimmer-Lauf erzeugen
2. Endpunkt-Doku korrigieren, dass Daten aus trimmer-Logs stammen
3. History-Summaries-Parser auf trimmer-Logs statt review-list.json umstellen

▌Aufwand: Gering