### #42: Jedes Element als Session-Starter

*— · 24.05.2026*

> **Quelle:** Vision-Workshop Max + Hermi (24.05.2026)
>
> Aktuell haben nur Boxen den "In Sub entwickeln"-Button. Jedes Diskussionselement soll zum Session-Starter werden können: Textboxen, Bild-Blöcke, offene Punkte in index.md. Der Prompt muss je Element-Typ unterschiedlich sein:
> - **Textbox:** Inhalt lesen → mit Max diskutieren
> - **Bild-Block:** Bild analysieren → was soll damit passieren?
> - **Offener Punkt (index.md):** Punkt verstehen → Plan vorschlagen
>
> **Sub-Punkte:**
> - [ ] **E.01** — Button-Integration für alle Element-Typen in BlocksSection (Textbox, Bild, Sub-Akkordeon)
> - [ ] **E.02** — Button für offene Punkte in renderIndexMd() / renderBlock()
> - [ ] **E.03** — Unterschiedliche Prompts je Element-Typ im Webhook-Handler
> - [ ] **E.04** — Hover-Over-Infotext für alle neuen Buttons (erklärt Ziel und Flow des Session-Starts)
> - [ ] **E.05** — Tests: Jeder Button-Typ → korrekter Prompt → Session gestartet (Rückkanal-Check)
>
> **Tests:**
> - [ ] **T.01** — Textbox-Button → Prompt enthält Box-Inhalt + "erkläre was du vor hast"
> - [ ] **T.02** — Bild-Button → Prompt enthält Bild-Referenz + Aufforderung zur Analyse
> - [ ] **T.03** — Offener-Punkt-Button → Prompt enthält Punkt-Beschreibung + Status-Kontext
> - [ ] **T.04** — Rückkanal: Session-Start liefert 204/200, Webhook erreicht Discord
