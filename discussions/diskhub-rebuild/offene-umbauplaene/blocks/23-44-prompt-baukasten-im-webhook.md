### #44: Prompt-Baukasten im Webhook

*— · 24.05.2026*

> **Quelle:** Vision-Workshop Max + Hermi (24.05.2026)
>
> Aktuell schiebt der Webhook die komplette README in den Prompt. Stattdessen: dynamisch aus den API-Daten bauen:
> `📋 Grundfrage + 📌 Stand + 🔜 [genau das eine Element]`
> Fallback auf volle README bei fehlender Struktur.
>
> **Hintergrund (aus Diskussion 24.05.2026):**
> - Kein separates Archiv nötig — der Prompt-Baukasten filtert erledigte Punkte raus, statt sie umzuziehen
> - `(✓ erledigt)` ist aktuell ein Hardcoded-String ohne Timestamp — keine Information "seit wann"
> - Lösung: Der Eintrag bekommt `*Erledigt: DD.MM.YYYY*` vom Skill gesetzt (nicht hardcoded, nicht geraten)
> - Der Prompt-Baukasten prüft dieses Datum: "erledigt < 3 Tage → optional erwähnen", "erledigt > 3 Tage → nur als 📚-Zahl"
> - Fallback bei fehlendem `*Erledigt:*`: Volle README laden (backward compatible)
>
> **Sub-Punkte:**
> - [ ] **B.01** — Prompt-Baukasten-Funktion in routes.py: Grundfrage (H1 + Frage), Stand (Zusammenfassung), Element-Kontext
> - [ ] **B.02** — Element-Typ-Detektion: Box vs. Bild vs. offener Punkt → unterschiedlicher Prompt-Aufbau
> - [ ] **B.03** — Fallback auf volle README wenn kein spezifisches Element referenziert wird
> - [ ] **B.04** — Statusbewusster Prompt: Erledigt-Punkte mit Datum prüfen (`*Erledigt: DD.MM.YYYY*`), nur als 📚-Zahl in den Prompt übernehmen
> - [ ] **B.05** — Alte Einträge ohne `*Erledigt:*` → Fallback auf volle README oder komplette Erwähnung
> - [ ] **B.06** — Tests: Rückkanal prüft ob Prompt-Inhalt korrekt gebaut wurde
>
> **Tests:**
> - [ ] **T.01** — Box-Referenz → Prompt enthält Box-Content + Kontext
> - [ ] **T.02** — Keine Referenz → volle README als Fallback
> - [ ] **T.03** — Rückkanal: Webhook liefert Prompt-Inhalt zur Verifikation
