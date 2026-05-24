### #48: Status Single Source of Truth — Manuelle Status-Zeilen aus READMEs entfernen
*— · 24.05.2026*

> **Quelle:** Max (Diskussion #46 — Erwartungsbeschreibung Single Source of Truth für Status, 24.05.2026)
>
> Der `diskhub-doc` Skill setzt `(✓ erledigt)` korrekt auf Ebene 3 (Textbox in Sub-Diskussion). Aber die README.md-Dateien auf Ebene 2 (Sub-Diskussion) und Ebene 1 (Hauptdiskussion) enthalten noch manuelle Status-Zeilen (`**Status:** X erledigt · Y offen`). Diese sind redundant, weil `_parse_index_status()` den Status bereits automatisch aus den Textboxen zählt.
>
> **Ziel:** Status wird nur auf der tiefsten Ebene gesetzt (Ebene 3). Alle Eltern-Ebenen leiten den Status dynamisch ab — kein manuelles `**Status:**` mehr in READMEs.
>
> **Sub-Punkte:**
> - [ ] **S.01** — `_parse_index_status()` prüfen: Zählt es korrekt alle Ebenen inkl. Sub-Sub-Diskussionen?
> - [ ] **S.02** — Frontend prüfen: Wird der aggregierte Status aus `_parse_index_status()` auf Ebene 1+2 korrekt angezeigt?
> - [ ] **S.03** — Manuelle `**Status:**`-Zeilen aus README.md von Ebene 2 (offene-umbauplaene/) entfernen
> - [ ] **S.04** — Manuelle `**Status:**`-Zeilen aus README.md von Ebene 1 (diskhub-rebuild/) entfernen
> - [ ] **S.05** — Verifikation: Status-Zähler im UI stimmt nach Entfernung noch (vorher/nachher-Vergleich)
> - [ ] **S.06** — Diskussion #46-Eintrag aktualisieren: `(✓ erledigt)` im Titel bleibt, aber erklären dass auf tieferer Ebene gesetzt wird
>
> **Tests:**
> - [ ] **T.01** — Nach Entfernung: UI zeigt gleichen Status wie vorher
> - [ ] **T.02** — Neuen Punkt erledigen → Status auf Ebene 1+2 aktualisiert sich automatisch
> - [ ] **T.03** — Rückkanal: Status-Werte via API-Endpunkt sind korrekt

---

💬 **Sub-Diskussion fortsetzen**
