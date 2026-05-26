### #42: Jedes Element als Session-Starter

*— · 24.05.2026*

> **Quelle:** Vision-Workshop Max + Hermi (24.05.2026)
>
> Aktuell haben nur Boxen den "In Sub entwickeln"-Button. Jedes Diskussionselement soll zum Session-Starter werden können: Textboxen, Bild-Blöcke, offene Punkte in index.md. Der Prompt muss je Element-Typ unterschiedlich sein:
> - **Textbox:** Inhalt lesen → mit Max diskutieren
> - **Bild-Block:** Bild analysieren → was soll damit passieren?
> - **Offener Punkt (index.md):** Punkt verstehen → Plan vorschlagen
>
## Plan: Session-Starter für alle Element-Typen

**Schritt 1 — Button für offene Punkte (index.md)**
renderBlock() bekommt einen "💬 Diskutieren"-Button (neben 🔗/✅).
Klick ruft onConvertToSub?.(headingText, content) auf → Preview-Panel
rechts zeigt die Session. Gleicher Ablauf wie bei Textboxen.

**Schritt 2 — Button für Sub-Diskussionen**
Sub-Items in der Diskussionsliste kriegen einen "💬"-Button (neben
🔗 und ✅/⬜). Klick startet eine Session über den gesamten Sub
(README + Inhalt als Kontext).

**Schritt 3 — Typ-spezifische Prompts**
- **Textbox** — Inhalt lesen, mit Max diskutieren
- **Bild-Block** — Bild analysieren, was soll passieren?
- **Offener Punkt** — Punkt verstehen, Plan vorschlagen
- **Sub-Diskussion** — Sub-README + Inhalt als Session-Basis

**Schritt 4 — Hover-Over-Infotexte (Kazzles Wunsch)**
Jeder neue (und bestehende) Button kriegt ein title-Attribut, das
genau erklärt: was passiert, wo die Session landet (rechtes Panel),
was Hermi mit dem Inhalt macht.

**Schritt 5 — Tests**
- Textbox-Button → Prompt enthält Box-Inhalt
- Bild-Button → Prompt enthält Bild-Referenz
- Offener-Punkt-Button → Prompt enthält Punkt-Beschreibung
- Sub-Button → Prompt enthält Sub-Kontext
- Rückkanal: Session-Start liefert 200/204, Webhook erreicht Discord
