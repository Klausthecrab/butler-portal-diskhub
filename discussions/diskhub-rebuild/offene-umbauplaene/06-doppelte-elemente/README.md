# Doppelte Elemente entfernen

**Erstellt:** 21.05.2026 · **Status:** ✓ erledigt

**Problem:** Aktuell wird im Split-View-Modal der Titel doppelt angezeigt (einmal im Header des Modals, einmal im gerenderten index.md). Ebenso das Erstell-Datum. Sub-Diskussionen werden unterhalb des "Diskussion fortsetzen"-Buttons nochmal ausgeklappt dargestellt — das soll nicht passieren.

**Lösung:**
- Header zeigt Titel + Metadaten (Single Source)
- README zeigt Zusammenfassung
- Blöcke/Subs nur als Akkordeon + "Öffnen"-Link
- Kein zusätzliches Ausklappen von Sub-Inhalten unterhalb der Haupt-View

**Umsetzung:**
- `renderIndexMd()` hat einen neuen Parameter `mode`
- Im Main-View wird `renderIndexMd(data.index, 'footer-only')` aufgerufen
- Footer-only: extrahiert das letzte Segment nach der letzten `---`-Trennlinie via `md.split('\n---\n').pop()` und rendert nur dieses via `renderMarkdown()`
- Ergebnis: Kein Preamble (Titel + Datum) mehr, keine `### Sub:`-Blöcke mehr — nur der "💬 Sub-Diskussion fortsetzen"-Footer bleibt
- Sub-View (activeSubView) verwendet weiterhin das volle Rendering
- Offene Frage zur H1-Unterdrückung in README nicht umgesetzt — README-eigener Titel und Daten sind Dokumenteninhalt, kein UI-Duplikat