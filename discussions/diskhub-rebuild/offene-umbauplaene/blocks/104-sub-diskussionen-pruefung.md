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

**Fortschritt (26.05.2026):**
- [x] `diskhub-regelwerk/` angelegt — README.md, blocks/, index/ mit eigenem Stub
- [x] Subs 01–07 von `offene-umbauplaene/` → `diskhub-regelwerk/` verschoben (mv)
- [x] Subs 08–12 aufgelöst — README-Inhalte als Textboxen #35–#39 in `offene-umbauplaene/blocks/`
- [x] Index-Stubs für 01–07 von `offene-umbauplaene/index/` → `diskhub-regelwerk/index/` verschoben
- [x] Subs 08–12 Ordner gelöscht (`rm -rf`)
- [x] Cross-Referenzen gepatcht: `03-c`, `08-h`, `09-i`, `27-phase-3`, `07-titelzeile`, READMEs
- [x] READMEs aktualisiert: `diskhub-rebuild/`, `offene-umbauplaene/`, `diskhub-regelwerk/`
- [x] Haupdiskussion index/ stubs aktualisiert (beide Subs gelistet)
- [x] API-Verifikation: `subs: [Blocks, Diskhub Regelwerk, Index, Offene Umbauplaene]` ✅
- [x] `blocks_files` korrekt, `index_files` korrekt, Response 200 ✅