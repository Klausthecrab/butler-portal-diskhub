### #43: Plan-Phase vor Umsetzung

*— · 24.05.2026*

> **Quelle:** Vision-Workshop Max + Hermi (24.05.2026)
>
> Jeder Session-Start soll standardmäßig **nicht** direkt umsetzen, sondern erst erklären was Hermi vorhat. Max gibt dann Go oder widerspricht. Der Plan ist Session-intern (kein DiskHub-Eintrag) — nur das Ergebnis wird dokumentiert.
>
> **Sub-Punkte:**
> - [ ] **P.01** — Webhook-Prompt um "erklären, nicht umsetzen"-Instruktion erweitern (Default-Verhalten)
> - [ ] **P.02** — Klare Erwartung an Hermi: Startprompt referenzieren + konkreten Vorschlag liefern
> - [ ] **P.03** — User gibt Go → Umsetzung startet. User widerspricht → Korrektur/Neurichtung
> - [ ] **P.04** — Tests: Rückkanal nach Plan-Phase funktioniert (Session läuft nicht ins Leere)
>
> **Tests:**
> - [ ] **T.01** — Session startet → Hermi erklärt Plan → wartet auf Go
> - [ ] **T.02** — Bei "Go" → Umsetzung läuft. Bei "Stop" → Session bricht ab
> - [ ] **T.03** — Rückkanal: Go/Stop erreicht Hermi korrekt
