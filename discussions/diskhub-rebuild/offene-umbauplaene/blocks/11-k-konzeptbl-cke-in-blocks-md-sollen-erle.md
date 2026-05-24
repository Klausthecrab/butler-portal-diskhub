### #K: Konzeptblöcke in blocks.md sollen „erledigt"-Status bekommen
*— · 24.05.2026*

> **Quelle:** Max (Feedback zu #I — Fortschritts-Doku ohne erledigt-Marker)

Aktuell: Nur index.md-Einträge haben `(✓ erledigt)` + `*Erledigt: DD.MM.YYYY*`. Konzeptblöcke in blocks.md haben kein Status-System — sie bleiben ewig "offen" auch wenn alle Teil-Items umgesetzt sind.

**Ziel:** Konzeptblöcke (#A–#K) bekommen ebenfalls einen Status-Mechanismus:
- Nicht alle Blöcke sollen das brauchen (manche bleiben dauerhaft offen)
- Aber wenn ein Block "erledigt" ist, soll das sichtbar sein — z.B. `(✓ erledigt)` im Titel wie bei index.md
- Frontend: 📷-Blöcke haben schon Sonder-Rendering (#40). Könnte man auf erledigt-Blöcke ausweiten (anderes Icon, collapsed by default, dezenterer Stil)
- Backend: Keine Änderung nötig? `*Erledigt: DD.MM.YYYY*` könnte einfach im Content der Textbox stehen

**Offene Fragen:**
- Soll ein erledigter Block automatisch collapsed sein (wie 📷-Blöcke)?
- Soll der `diskhub-doc` Skill (#46) auch blocks.md-Blöcke schließen können?
- Was passiert mit dem 🔗-Button? Zeigt er weiterhin die Referenz, auch wenn erledigt?

**Fortschritt (24.05.2026):**
- [x] `handleToggleDone()` in `Page.jsx`: Liest `(✓ erledigt)` aus dem Heading, toggelt via vorhandener `/edit-block`-API
- [x] `isDone`-Detektion: `headingText.includes('(✓ erledigt')` → `data-status={isDone ? 'done' : 'open'}` (CSS existierte bereits)
- [x] ⬜/✅-Button in der Action-Leiste beider Block-Typen (Bild + Text): zwischen 🔗 und ✏️
- [x] CSS: `.toggleDoneBtn` + `.toggleDoneBtnActive` (hover: grün→erledigen, orange→öffnen)
- [x] Kombinierbar mit manuellem ✏️-Edit — beide schreiben in den selben Title in blocks.md
- [x] Build OK (16.24s), Dashboard-Neustart, API 200
- [x] Compiled JS + CSS verifiziert: `toggleDoneBtn`, `handleToggleDone`, `erledigt` im Bundle vorhanden
- [x] Kazzle fragt: Gleicher Button auch für index.md-Einträge möglich? → Plan in box-11 dokumentiert
- [x] **Umsetzung (24.05.2026):** ⬜/✅-Button für index.md-Einträge implementiert
  - Backend: `POST /api/diskhub/edit-index-title` — toggelt `(✓ erledigt)` auf ###-Entry + git commit
  - Frontend: Button in `renderBlock()`-HTML via `data-toggle-index-done` + globalem Click-Handler (Pattern wie `data-copy-entry`)
  - Entscheidung: Backend A (nur Title) + Frontend A (im bestehenden Handler-Pattern)
  - Build OK, Dashboard-Neustart, API 200 verifiziert

**Plan: ⬜/✅-Button für index.md-Einträge (+ verfeinerter Plan)**

**Warum extra?** Der Button für blocks.md nutzt `/edit-block` — die bestehende API für Textboxen. index.md-Einträge haben keinen eigenen Edit-Endpoint. Der ✏️-Button existiert dort nicht. Also braucht's einen neuen Endpoint.

**Backend — neuer Endpoint:**
- `POST /api/diskhub/edit-index-title`
- Input: `discussion_id`, `entry_index` (0-based, entspricht `#punkt-<nr>`), `new_title`, optional: `sub_id`
- Backend: Lädt index.md, findet die `###`-Zeile per Position (durchgehen bis zum entry_index-ten `###`), ersetzt ihren Title-Teil, schreibt zurück, git commit
- Der Title-Teil ist alles nach `### ` bis zum Zeilenende (oder bis `||` wenn Sub-Referenz) — aber für index.md-Einträge ohne `||` einfach die ganze Zeile
- **Option A: Nur Title ersetzen** — simpel, `git diff` zeigt nur die geänderte Zeile
- **Option B: Automatisch Status-Zähler in README.md aktualisieren** — nützlich aber komplexer (muss zählen wie viele Einträge `(✓ erledigt)` haben vs. nicht)

**Frontend — Button-Logik:**
- Selbes Pattern wie in `BlocksSection`: Jeder index.md-Eintrag kriegt einen ⬜/✅-Button
- Aktuelle Position: index.md-Einträge haben keinen eigenen Button-Bereich — sie werden als Accordion in `renderIndexMd()` gerendert, die Action-Buttons (🔗) hängen über einem globalen Event-Handler dran
- **Ansatz A: Button in den bestehenden 🔗-Handler integrieren** — neben den `entry-<nr>`-🔗 einen zweiten Button setzen
- **Ansatz B: Eigener kleiner Button pro Eintrag** — sauberer, aber mehr DOM-Eingriff
- Erkennung identisch: `(✓ erledigt)` im `###`-Text → grüne Box
- Der Button ruft `POST /api/diskhub/edit-index-title` mit dem toggelten Title auf

**Status-Zähler (optional aber empfohlen):**
- README.md der Diskussion hat oft: `**Status:** X erledigt · Y offen`
- Der Button könnte beim Setzen/Entfernen von `(✓ erledigt)` die Zähler automatisch neu berechnen
- Macht das Feature deutlich wertvoller — kein manuelles Nachpflegen vergessener Zähler mehr
- **Pitfall:** Der Zähler zählt meist index.md-Einträge, nicht blocks.md-Blöcke. Müsste konsistent sein: entweder beide zählen oder klar trennen.

**Workflow für Kazzle:**
1. ✅ Entscheiden: Option A (nur Title) oder B (Title + Zähler) für den Endpoint? → **A (nur Title)**
2. ✅ Entscheiden: Ansatz A oder B für den Frontend-Button? → **A (im bestehenden Handler-Pattern)**
3. ✅ Hermi baut
4. ✅ Build + Dashboard-Restart
5. ✅ Doku im Fortschritt
