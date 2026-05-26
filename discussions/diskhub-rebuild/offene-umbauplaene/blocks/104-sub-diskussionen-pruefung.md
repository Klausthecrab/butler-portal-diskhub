### Sub-Diskussionen — Bestandsaufnahme und Prüfung
*— · 25.05.2026*

**Was sind Sub-Diskussionen?**

Sub-Diskussionen sind die zweite Ebene der DiskHub-Hierarchie innerhalb von `offene-umbauplaene/`. Jede ist ein eigener Ordner (z.B. `01-datei-struktur/`) mit:
- **README.md** — Beschreibung, Status, Titelzeile
- **index/** — Index.md-Einträge und Textbox-Verweise
- **blocks/** — Detail-Textboxen (Ebene 3)

Insgesamt 12 Sub-Diskussionen (01–12) — alle bearbeitet. Siehe Plan unten.

**Prüfung abgeschlossen — alle 12 Subs bearbeitet (26.05.2026)**

| # | Sub-Diskussion | Aktion | Status |
|---|---------------|--------|--------|
| 01–07 | datei-struktur bis titelzeile-akkordeon | → `diskhub-regelwerk/` verschoben | ✅ |
| 08–12 | nummerierung bis kurzbeschreibung-akkordeon | → Textboxen in `blocks/` umgewandelt | ✅ |

**Notiz:** `low-prio-zurueckgestellt/` und `blocks/` + `index/` auf Ebene 1 sind nicht Teil dieser Liste — sie werden separat behandelt falls nötig.

---

## Plan: Sub-Diskussionen neu sortieren (26.05.2026) ✅ umgesetzt

**Erkenntnis:** 7 von 12 Subs sind erledigt und beschreiben Architektur/Regeln, keine offenen Umbaupläne. 5 waren offen, aber in den index-Stubs bereits als erledigt dokumentiert.

**Aktion — zwei Schritte (umgesetzt):**

1. **Neue Sub-Diskussion `diskhub-regelwerk/`** direkt unter `diskhub-rebuild/` anlegen. Subs 01–07 (`datei-struktur` bis `titelzeile-akkordeon`) dorthin verschieben. Alle Cross-Referenzen patchen.

2. **Subs 08–12 in Textboxen überführen.** Die Ordner `08-nummerierung` bis `12-kurzbeschreibung-akkordeon` auflösen, README-Inhalte als Textboxen in `offene-umbauplaene/blocks/` anlegen, Ordner löschen. Referenzen korrigieren.

**Ziel:** `offene-umbauplaene/` enthält nur echte offene Punkte (als Textboxen). Architektur-Regeln und Konzepte leben sauber getrennt in `diskhub-regelwerk/`.