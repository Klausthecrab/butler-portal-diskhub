# Detail-Ansicht für Sub-Diskussionen

**Erstellt:** 21.05.2026 · **Status:** ✓ erledigt

**Frage:** Wie zoome ich in eine Sub-Diskussion?

**Idee:** Sub-Diskussionen haben nicht nur ein Akkordeon, sondern einen "Öffnen"-Link. Dieser zeigt die Sub-Diskussion in voller Ansicht — mit eigenem Header, README, Blöcken und eigenen Sub-Diskussionen. Identisch zur Hauptansicht.

**Entscheidungen:**
1. **Modal statt Route** — Sub-View bleibt innerhalb des Split-Modals. Kein Route-Wechsel nötig. Teilbarkeit wäre Overkill für diesen Use-Case.
2. **Browser-History-API** — `window.history.pushState` + `popstate`-Listener: Browser-Back-Button schließt Sub-View. Manuelle Navigation via Header-Button (← Zurück) + Breadcrumb-Link räumen den History-Eintrag mit `replaceState` auf.
3. **TOC auch in Sub-View** — `generateToc()` wird jetzt auch im Sub-View gerendert, identisch zur Hauptansicht.
4. **Technisch-Tab respektiert Sub-View** — Git-Log-API-Call übergibt `sub_id`-Param, zeigt commits der Sub-Diskussion.

**Umsetzung (21.05.2026):**
### Änderungen in Page.jsx
- Neuer `useEffect` für `popstate`-Event: Schließt Sub-View wenn Browser-Back gedrückt wird, räumt History auf
- Sub-Karten-`onClick` und `onKeyDown`: Nutzen `pushState({subViewMode: true})` statt null+setTimeout-Workaround
- Back-Button (← Zurück): Ruft `replaceState(null, '')` + `setActiveSubView(null)` auf
- Breadcrumb-Link: Gleiches Pattern
- TOC zwischen Blöcke und Index im Sub-View eingebaut
- Git-Log: `activeSubView` in Dependencies + URL-Bau mit `sub_id`-Query-Param

### Offene Punkte
- Keine — Punkt abgeschlossen