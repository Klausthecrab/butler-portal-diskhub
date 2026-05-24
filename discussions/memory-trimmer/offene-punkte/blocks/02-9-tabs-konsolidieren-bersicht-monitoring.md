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
