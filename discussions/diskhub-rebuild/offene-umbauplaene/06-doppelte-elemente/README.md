# Doppelte Elemente entfernen

**Erstellt:** 21.05.2026 · **Status:** ● offen

**Problem:** Aktuell wird im Split-View-Modal der Titel doppelt angezeigt (einmal im Header des Modals, einmal im gerenderten index.md). Ebenso das Erstell-Datum. Sub-Diskussionen werden unterhalb des "Diskussion fortsetzen"-Buttons nochmal ausgeklappt dargestellt — das soll nicht passieren.

**Lösung:**
- Header zeigt Titel + Metadaten (Single Source)
- README zeigt Zusammenfassung
- Blöcke/Subs nur als Akkordeon + "Öffnen"-Link
- Kein zusätzliches Ausklappen von Sub-Inhalten unterhalb der Haupt-View

**Offene Fragen:**
- Muss der Renderer die erste H1 in index.md/README.md unterdrücken wenn der Header sie schon zeigt?