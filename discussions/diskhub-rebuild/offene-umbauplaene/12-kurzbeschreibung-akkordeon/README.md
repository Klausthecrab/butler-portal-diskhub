# Kurzbeschreibung im aufgeklappten Akkordeon

**Erstellt:** 21.05.2026 · **Status:** ● offen

**Problem:** Wenn eine Sub-Karte aufgeklappt wird, sieht man sofort die volle README. Es fehlt eine prägnante Einzeiler-Zusammenfassung, die auf einen Blick sagt worum es in dieser Sub-Diskussion geht.

**Lösungsansatz:**
- Zwischen dem Titel (`📂 {sub.name}`) und dem README-Text eine kurze Beschreibung einfügen
- Format-Vorschlag: fettgedruckter Kurztext wie `#10 | Header-Box weißer Hintergrund + Trennlinien | Weiße Box um Header/README + Fußzeile + Trennlinien`
- Die Kurzbeschreibung könnte aus dem `||`-Teil des `### Sub:`-Eintrags in der index.md kommen (z.B. `### #10: Header-Box (●) || Weiße Box um Header/README + Fußzeile`)
- Oder als separates Feld im Backend (z.B. `sub.description` aus index.md-Parsing)

**Offene Fragen:**
- Woher kommt der Kurztext? (index.md `||`-Syntax? separates Beschreibungsfeld?)
- Soll die Kurzbeschreibung auch in der Sub-Karte (zugeklappt) sichtbar sein?