# UI-Struktur

**Erstellt:** 21.05.2026 · **Status:** ✓ erledigt (obsolet)

**Frage:** Wie ist die View einer Diskussion aufgebaut?

**Aktueller Aufbau (von oben nach unten):**
1. **Header** — Titel, Subtitel (Frage), erstellt am, geändert am (aus `data.parsed`)
2. **README** — Zusammenfassung / aktueller Stand (aus `data.readme_body`)
3. **Inhaltsverzeichnis** — Auto-generiert aus `blocks.md` + `index.md`
4. **Blöcke** — Akkordeon (aus `blocks.md`)
5. **Sub-Diskussionen** — Akkordeon (aus `data.subs`, via Punkt 5)
6. **Footer** — "💬 Sub-Diskussion fortsetzen" (aus `index.md`, via Punkt 6)

**Status: ✅ Vollständig durch Punkte 3–6 implementiert**
- Keine aktiven offenen Punkte — alle UI-Fragen wurden in den spezifischen Punkten adressiert