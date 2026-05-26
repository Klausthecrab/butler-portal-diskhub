### #47: Session-interne Verifikation

*— · 24.05.2026*

> **Quelle:** Vision-Workshop Max + Hermi (24.05.2026)
>
> Bevor Hermi das Ergebnis dokumentiert, prüft er ob die Zielbedingung erfüllt ist:
> - **Code:** Tests, Build, Health-Check
> - **Konzept:** Rückfragen bei Unklarheiten
> - **Allgemein:** "Ziel war X → wurde X erreicht?"
> Verifikation läuft in derselben Session (kein externer Check nötig). Schützt gegen Context Rot und stellt sicher dass nur saubere Ergebnisse in DiskHub landen.
>
> **Hintergrund (aus Diskussion 24.05.2026):**
> - Verifikation und Status-Setzen gehören zusammen, sind aber zwei getrennte Schritte
> - Verifikation prüft "wurde das Ziel erreicht?" — das ist die **Entscheidung**
> - Status+Datum setzen ist die **Dokumentation** dieser Entscheidung — das macht der Skill (#46)
> - Fehlgeschlagene Verifikation → kein Status-Setzen, nur Benachrichtigung an Max
> - Erledigte Verifikation + dein "dokumentiere das" → Skill laden → Status+Datum → 🤖-Block → Commit
>
> **Sub-Punkte:**
> - [ ] **V.01** — Verifikations-Schritt als separater Schritt vor "dokumentieren" (Teil des Session-Ablaufs)
> - [ ] **V.02** — Code-Verifikation: Tests laufen lassen, Build prüfen, Health-Check aufrufen
> - [ ] **V.03** — Konzept-Verifikation: Zielbedingung aus Prompt extrahieren + mit Ergebnis abgleichen
> - [ ] **V.04** — Verifikation bestanden → Skill #46 laden → Status+Datum setzen → 🤖-Block → Commit
> - [ ] **V.05** — Verifikation fehlgeschlagen → nichts setzen, Max benachrichtigen mit Grund
> - [ ] **V.06** — Fehlerfall: Verifikation unklar (kein klares Ja/Nein) → Rückfrage an Max vor Entscheidung
> - [ ] **V.07** — Tests: Rückkanal nach Verifikation funktioniert (OK/NOK erreicht Max)

> **Tests:**
> - [ ] **T.01** — Code-Punkt: Tests grün + Build OK → Verifikation bestanden
> - [ ] **T.02** — Code-Punkt: Tests rot → Verifikation fehlgeschlagen, Max wird informiert
> - [ ] **T.03** — Konzept-Punkt: Zielbedingung erfüllt → OK
> - [ ] **T.04** — Konzept-Punkt: Unklarheit → Rückfrage an Max
> - [ ] **T.05** — Verifikation bestanden + Skill #46 geladen → Status+Datum in index.md + 🤖-Block in blocks.md
> - [ ] **T.06** — Verifikation fehlgeschlagen → kein Commit, keine Änderung an index.md/blocks.md
> - [ ] **T.07** — Rückkanal: Verifikations-Ergebnis erreicht Max korrekt
