# Single Source of Truth

**Erstellt:** 21.05.2026 · **Status:** ✓ erledigt

**Frage:** Wie vermeiden wir doppelte Texte?

**Problem:** Wenn eine Sub-Diskussion im Akkordeon der Eltern-Diskussion eine Kurzfassung zeigt, in der Detail-Ansicht aber einen anderen (vollständigen) Text — dann entstehen Inkonsistenzen.

**Lösung:** Der Akkordeon-Text einer Sub-Diskussion IST der README-Text derselben Sub-Diskussion. Gleiche Datei, gleicher Renderer. Kein separater Kurztext.

**Umsetzung:**
- `.subDocBlock` wurde von einer Navigations-Karte zu einem Akkordeon umgebaut
- Header zeigt nur den Sub-Namen + Pfeil (▸/▾) — kein Vorschau-Text mehr
- Aufgeklappter Body rendert `sub.readme` mit `renderMarkdown()` — identisch zur Detail-Ansicht
- "→ Vollständige Ansicht"-Link darunter navigiert zur Sub-Detail-Ansicht (mit Index/Blocks)
- Lokaler `expandedSubs` State (Set) pro Sub-Diskussion
- Alte Styles `.subCardSummary`, `.subCardReadme`, `.subCardOpen` entfernt

**Entscheidung:** Ganzer Text, kein Kürzen. Bei sehr langen READMEs scrollt der User im Akkordeon-Body.