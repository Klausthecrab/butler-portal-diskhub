# UI-Struktur

**Erstellt:** 21.05.2026 · **Status:** 3 erledigt · 0 offen

**Frage:** Wie ist die View einer Diskussion aufgebaut?

**Aktueller Aufbau (von oben nach unten):**
1. **Header** — Titel, Subtitel (Frage), erstellt am, geändert am (aus `data.parsed`)
2. **README** — Zusammenfassung / aktueller Stand (aus `data.readme_body`)
3. **Inhaltsverzeichnis** — Auto-generiert aus `blocks.md` + `index.md` (NEU)
4. **Blöcke** — Akkordeon, zugeklappt = Heading, aufgeklappt = Inhalt (aus `blocks.md`)
5. **Sub-Diskussionen** — Akkordeon + "Öffnen"-Link (aus `index.md` als `### Sub:`)
6. **Sub-Karten** — Vereinfacht: Name + README-Auszug + "▶ Öffnen"-Button

**Status: ✅ TOC eingebaut**
- Neue `generateToc()`-Funktion parst `###` aus blocks.md + `### Sub:` aus index.md
- Wird zwischen README und Blocks-Sektion gerendert
- Kein Doppel-TOC mehr (war vorher in `renderIndexMd()`)

**Status: ✅ Sub-Karten vereinfacht**
- Zeigen nur noch Namen + ersten 200 Zeichen README + "▶ Öffnen"-Button
- Kein vollständiges Ausklappen von README/index/blocks mehr
- Klick → zoomt in die Sub-Diskussion (activeSubView)

**Status: ✅ TOC aus renderIndexMd entfernt**
- `renderIndexMd()` rendert nur noch die Sub:-Einträge als Akkordeon (ohne TOC)
- TOC ist jetzt eine separate, kombinierte Funktion