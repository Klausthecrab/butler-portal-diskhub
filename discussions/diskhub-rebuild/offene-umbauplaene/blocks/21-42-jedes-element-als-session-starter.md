### #42: Jedes Element als Session-Starter (✓ erledigt)

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

**Schritt 5 — Frontend-Anbindung + element_type**
- **5a:** handleConvertToSub() akzeptiert dritten Parameter elementType (default 'box')
- **5b:** index_entry-Button ruft handleConvertToSub(title, content, 'index_entry') auf
- **5c:** sub_discussion-Button ruft handleConvertToSub(title, readme, 'sub_discussion') auf

**Schritt 6 — Tests**
- Textbox-Button → Prompt enthält Box-Inhalt
- Bild-Button → Prompt enthält Bild-Referenz
- Offener-Punkt-Button → Prompt enthält Punkt-Beschreibung
- Sub-Button → Prompt enthält Sub-Kontext
- Rückkanal: Session-Start liefert 200/204, Webhook erreicht Discord

## Fortschritt (26.05.2026):
- [x] **Schritt 1** — 💬-Button in renderBlock() für index.md-Einträge (data-start-index-session) + globaler Click-Handler im SplitViewModal. Liest Heading + Content aus dem DOM, ruft handleConvertToSub() auf.
- [x] **Schritt 2** — 💬-Button in Sub-Diskussionsliste (neben ✅/⬜ + 🔗). Übergibt sub.readme als Content + readmeTitle als Titel.
- [x] **Schritt 3** — Backend start_box_to_sub() um element_type-Parameter erweitert. Vier Typen: box, index_entry, sub_discussion, image — je mit eigenem Prompt (Label + Task-Beschreibung).
- [x] **Schritt 4** — Hover-Over-Infotexte (title-Attribut) in allen neuen Buttons: erklären was passiert, wo die Session landet, was Hermi macht.
- [x] **Schritt 5a** — handleConvertToSub() um elementType-Parameter erweitert, schickt element_type im POST-Body mit
- [x] **Schritt 5b** — data-start-index-session Handler ruft mit 'index_entry', Sub-Button mit 'sub_discussion' auf
- [x] **Schritt 5c** — Frontend-Build (16s), Dashboard+Registry-Neustart ✅. API-Verifikation: health ok, DiskHub-Liste liefert JSON.
- [x] **Schritt 6** — Tests: alle Button-Typen + Rückkanal-Verifikation
  - [x] **6a:** Bild-Block-Erkennung fixen — heading-Präfix `📷` → `element_type: 'image'` (Page.jsx Z. 901+987)
  - [x] **6b:** index_entry-Test: API-Response 200, 3×204 Webhook, Session in state.db ✅
  - [x] **6c:** sub_discussion-Test: API-Response 200, 3×204 Webhook, Session in state.db ✅
  - [x] **6d:** image-Test: API-Response 200, 3×204 Webhook, Session in state.db ✅
  - [x] **6e:** Rückkanal-Verifikation via state.db — alle 3 Sessions angelegt ✅
