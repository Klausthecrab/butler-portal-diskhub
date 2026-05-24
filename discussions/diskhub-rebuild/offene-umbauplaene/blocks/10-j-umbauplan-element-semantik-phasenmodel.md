### #J: Umbauplan — Element-Semantik & Phasenmodell
*— · 24.05.2026*

Synthese aus der Diskussion zu #A (Semantik-Regeln) und #E (Sonderrollen). Definiert die Reihenfolge des Umbaus.

**Phase 0 — Foundation:** Knowledge-Skill `diskhub-element-semantik` erstellen (Element-Typen, Sonderrollen-Katalog, Kriterien). Memory-Verweis setzen. `diskhub-doc`-Skill patchen. → #A

**Phase 1 — Adressierbarkeit:** index.md-Einträge + Sub-Diskussionen bekommen 🔗 + HTML-ID + Auto-Scroll. → #B, #C

**Phase 2 ✅ — Element-Typen trennen:** Einfache index.md-Einträge → Textboxen migrieren (#D). Verbleibende index.md-Einträge auf Sonderrollen limitieren + visuelle Markierung (#E).

**Sonderrollen-Katalog (Phase 0):**
- README/Header — System-Element, Fixposition Top
- Inhaltsverzeichnis (TOC) — System-Element, Fixposition nach Header
- Ist-Zustand/Architektur — index.md-Eintrag, visuell markiert
- Decision Record — index.md-Eintrag, visuell markiert
- Changelog — index.md-Eintrag, visuell markiert, am Ende
- Kalender/Timeline — Future, eigener Renderer

**Phase 0 — Fortschritt (24.05.2026):**
- ✅ Knowledge-Skill `knowledgeskill-diskhub-element-semantik` erstellt (shared-Kategorie)
- ✅ Memory-Verweis gesetzt (alter DiskHub-Eintrag ersetzt)
- ✅ `diskhub-doc`-Skill um Referenz auf neuen Knowledge-Skill ergänzt
- 🔜 Nächster Schritt: Phase 1 (Adressierbarkeit #B, #C) — von Kazzle freigeben lassen

**Phase 1 — Fortschritt (24.05.2026):**
- ✅ `renderBlock()` + `renderIndexMd()`: HTML-ID `punkt-<idx>` + 🔗-Button mit `data-copy-entry` und `data-ref` (Format: `diskussion > entry-<nr> "titel"` — **Phase 4: auf Pfad-Format `diskussion/index/<name>` umgestellt**)
- ✅ Sub-Diskussionen (#C): 🔗-Button kopiert `diskussion/sub-slug` mit `e.stopPropagation()` (öffnet kein Accordion)
- ✅ Auto-Scroll: `#punkt-<idx>` Hash → `scrollIntoView()` via useEffect
- ✅ Globaler Click-Handler: `document.addEventListener` delegiert `[data-copy-entry]` → clipboard write + ✅-Feedback
- ✅ Build OK (16.21s), Dashboard-Neustart, API 200
- 🔜 Nächster Schritt: Phase 2 (Element-Typen trennen #D, #E) — von Kazzle freigeben lassen

**Phase 2 — Fortschritt (24.05.2026):**
- ✅ **#D — Migration:** 15 offene index.md-Einträge (#29–#48 ohne ✓) als Textboxen in blocks.md angelegt (box-12 bis box-26)
- ✅ index.md-Stubs: Jeder migrierte Eintrag durch `→ Textbox #box-NN` ersetzt
- ✅ 33 erledigt-Einträge (#01–#28, #33, #38, #40, #41, #46) als Sonderrollen in index.md belassen
- ✅ Migration-Map dokumentiert: `#punkt-XX` (alt) → `#box-YY` (neu) in Commit-Nachricht
- ✅ **#E — Limitierung:** Kategorien aus Phase 0 angewendet — offene Punkte → Textbox, erledigte → Sonderrolle (Decision Record)
- ✅ Build OK (16.20s, Vite), Dashboard-Restart, API 200 — 27 Blöcke, 48 Index-Einträge, 15 Stubs
- 🔜 Visuelle Markierung für Sonderrollen (CSS data-role) — zurückgestellt, Kazzle will erstmal so lassen
