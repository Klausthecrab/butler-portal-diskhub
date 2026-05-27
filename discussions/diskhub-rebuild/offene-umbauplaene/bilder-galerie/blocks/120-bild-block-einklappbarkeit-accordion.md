### Bild-Block fehlt Einklappbarkeit (Accordion)
*— · 27.05.2026*

**Problem**
Der Bild-Block (`📷 Galerie Test 3 Bilder`) hat kein Accordion-Verhalten — er lässt sich nicht zu- und aufklappen wie normale Textboxen.

**Details**
- Normale Textboxen haben ein `<DisclosureTriangle>` für Auf-/Zuklappen
- Bild-Blöcke (📷) werden ohne DisclosureTriangle gerendert — immer aufgeklappt
- Gewünscht: Bild/Galerie-Blöcke sollten per Default aufgeklappt sein, aber trotzdem einklappbar
- Ohne Einklappbarkeit wirkt der Block "aufgebläht" und passt nicht zum visuellen Muster der anderen Elemente

**Lösungsvorschlag**
- BlocksSection: Auch Bild-Blöcke bekommen ein DisclosureTriangle
- `defaultExpanded: true` für Bild-Blöcke (im Gegensatz zu Textboxen, die standardmäßig zugeklappt sind)
- Beim Zuklappen: nur Header (Titel + Status) sichtbar, kein Strip, kein Zähler

**Status**
🔜 offen