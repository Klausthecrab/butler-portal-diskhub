### #46: diskhub-doc Skill || Format-Wissen + Schutz gegen Context Rot (✓ erledigt)

*— · 24.05.2026*
*Erledigt: 24.05.2026*

> **Quelle:** Vision-Workshop Max + Hermi (24.05.2026)
>
> Skill der Hermi erklärt wie Einträge in DiskHub korrekt formatiert werden. Enthält blocks.md-Format (`###`-Struktur, Prefix-Regeln), Commit-Konventionen und Prüf-Logik. Manuell ladbar (nicht automatisch) — Max sagt "dokumentiere das" und lädt den Skill dazu.
>
> **Hintergrund (aus Diskussion 24.05.2026):**
> - `(✓ erledigt)` ist ein reiner Text-String — kein System setzt ihn, kein Timestamp existiert
> - Du sollst ihn nie wieder manuell setzen müssen — Hermi macht das bei der Doku
> - Aber: "Automatisch nach jeder Session setzen" ist zu risikoreich (Fehler unkontrollierbar)
> - Lösung: **Kein Automatismus, sondern strukturierte Checkliste im Skill** — Hermi setzt den Status erst nach deinem expliziten "dokumentiere das"
> - Der Skill zwingt zur Reihenfolge: Status setzen → 🤖-Block → Commit
> - Vor dem Commit prüft der Skill: "Steht `*Erledigt:*` im Eintrag? → nein → abbrechen"
> - Schutz gegen Doppel-Eintrag: Existiert `(✓ erledigt)` bereits → Skill warnt und bricht ab
>
> **Sub-Punkte:**
> - [x] **S.01** — Skill erstellen: blocks.md-Format-Vorgabe, Prefix-Regeln (`🤖`, `📷`), Datums-Format
> - [x] **S.02** — Prüf-Logik: "Sieht der Eintrag aus wie die bestehenden?" vor Commit
> - [x] **S.03** — Commit-Konventionen: Nachricht enthält Punkt-Nummer + Kurzbeschreibung (`done #49: ...`)
> - [x] **S.04** — Skill-Doku: Erklärung wann und wie geladen wird
> - [x] **S.05** — Reihenfolge erzwingen: (1) `(✓ erledigt)` + `*Erledigt: DD.MM.YYYY*` in index.md schreiben, (2) Doku-Content an bestehenden Eintrag anhängen, (3) `git add . && git commit -m "done #49: ..." && git push`
> - [x] **S.06** — Prüfung vor Schritt 1: Existiert `(✓ erledigt)` bereits im Eintrag? → Skill bricht ab mit Warnung "Punkt #49 bereits als erledigt markiert — überschreiben?"
> - [x] **S.07** — Prüfung vor Commit: Steht `*Erledigt:*` im index.md-Eintrag? → nein → Fehler, nicht committen
> - [x] **S.08** — Alte Einträge ohne `*Erledigt:*` sind OK (backward compatible) — der Skill setzt `*Erledigt:*` nur bei neuen Einträgen
> - [x] **S.09** — Tests: Skill geladen → korrekter Eintrag in blocks.md inkl. Status+Datum
>
> **Tests:**
> - [x] **T.01** — Skill geladen → Eintrag folgt Format-Konvention
> - [x] **T.02** — Fehlerfall: ungültiges Format → Skill weist zurück mit Erklärung
> - [x] **T.03** — Skill warnt bei doppeltem Status: `(✓ erledigt)` existiert bereits → Abbruch
> - [x] **T.04** — Skill bricht ab wenn `*Erledigt:*` fehlt → kein Commit ohne Datum
> - [x] **T.05** — Rückkanal: Skill antwortet mit "Eintrag OK" oder "Format-Fehler in Zeile X"

─────────────────────

diskhub-doc Skill erstellt.

Was gemacht:
- Vorschlag → Bestätigung → Umsetzung als strikter Workflow
- Zwei Sicherheits-Gates (Skill laden + Vorschlag bestätigen)
- Bullet-Point-Format statt Wall of Text
- Zweimal iteriert (Gültigkeitsbereich + Ort-Kontext + Option A)
- Altlast bereinigt: doppelter 🤖-Block aus blocks.md entfernt
