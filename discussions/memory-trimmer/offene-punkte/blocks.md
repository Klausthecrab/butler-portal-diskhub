# Blöcke — offene-punkte

---

### #5 — Section-Analyzer-Prompt verbessern (Konsequenz/Scope/Diskussion)
*— · 24.05.2026*

**Auslöser:** Max' Feedback zum Analyse-Prompt. Statische Kategorien (No-Gos=hoch, Projektkontext=mittel) sind zu stumpf. Gewünscht sind konsequenzbasierte Bewertungen.

**Gewünscht — Backend:**
1. **Scope-Feld:** `global` (jede Session) vs `spezifisch` (seltene Kontexte)
2. **Konsequenz-Feld:** Ein Satz "Was passiert konkret, wenn diese Info fehlt?"
3. **Diskussion-Feld:** Optionale offene Frage an Max
4. Bestehende Felder (heading, importance, can_shorten, optimized, rationale) bleiben

**Gewünscht — Frontend:**
1. **Scope-Badge:** 🌐 global / 🎯 spezifisch
2. **Konsequenz-Zeile** unter der rationalen
3. **Diskussion-Callout** hervorgehobene Box mit 💬

**Aufwand:** Gering–Mittel (~30 Min Backend, ~45 Min Frontend). Prompt-Änderung ist Quick-Win.

---

### #9 — Tabs konsolidieren: Übersicht + Monitoring + Nacht-Report (B4)
*— · 24.05.2026*

**Problem:** Drei separate Tabs (Übersicht, Monitoring, Nacht-Report) zeigen ähnliche Metriken mit unterschiedlichem Layout. Verwirrend und redundant.

**Ziel:** Ein Tab "📊 Übersicht" mit:
- Kompakte Statuszeile (Trimmer läuft/pausiert, letzter/nächster Lauf)
- 3–4 Zahlen-Kacheln (Speicher, Bausteine, offene Reviews, Evaluator-Werte)
- Jede Kachel hat `?`-Icon → Tooltip in einfachem Deutsch
- Letzter Nacht-Report als einklappbarer Block unten
- Kein Tab-Wechseln für Status

**Aufwand:** Mittel. Neuer konsolidierter Tab + Metriken zusammenführen + Tooltip-Komponente.

---

### #11 — 🧹 Dead CSS-Klassen nach B3 entfernen
*— · 24.05.2026*

**Problem:** Durch den Umbau der Evaluator-Ergebnis-Liste auf BausteinCard sind CSS-Klassen in `Page.module.css` ungenutzt: `evalLatest`, `evalBar`, `evalDetailBtn`, `evalList`, `evalCard`, `evalCardLeft`, `evalDate`, `evalSize`, `evalArrow`.

**Gewünscht:** Entfernung der ungenutzten Styles.

**Aufwand:** Gering. Reines CSS-Cleanup, `npm run build` zur Prüfung.

---

### #12 — 📋 review-evaluator Logs: Einzel-Entries nachrüsten
*— · 24.05.2026*

**Problem:** Neue `review-evaluator-*.json` Logs speichern nur Aggregatzahlen, aber keine individuellen Einträge mit Text und Begründung. Daher tauchen sie nicht in der BausteinCard-Liste auf.

**Gewünscht:** `run_review_evaluator.py` soll auch die individuellen geprüften Einträge inkl. Kategorie + Begründung loggen → Portal-BausteinCard-Sichtbarkeit.

**Aufwand:** Mittel. Änderung am Review-Runner + neues Log-Format.

---

### #13 — 🔗 review-list.json nicht separat existent
*— · 24.05.2026*

**Problem:** review-list.json als separate Datei existiert nicht — die review_list-Daten stecken in `trimmer-*.json` unter `steps[].step="review_list"`.

**Optionen:**
1. review-list.json als separates Artefakt beim Trimmer-Lauf erzeugen
2. Endpunkt-Doku korrigieren, dass Daten aus trimmer-Logs stammen
3. History-Summaries-Parser auf trimmer-Logs statt review-list.json umstellen

**Aufwand:** Gering.