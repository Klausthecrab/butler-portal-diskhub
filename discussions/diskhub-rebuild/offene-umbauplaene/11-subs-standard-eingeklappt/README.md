# Standardmäßig eingeklappte Subs fixen

**Erstellt:** 21.05.2026 · **Status:** ● offen

**Problem:** In der Detail-Ansicht einer Diskussion sind alle Sub-Karten standardmäßig aufgeklappt. Das ist falsch — sie sollen standardmäßig eingeklappt sein.

**Lösungsansatz:**
- Der `expandedSubs`-State (eingeführt in Punkt 5) wird aktuell mit `new Set()` initialisiert — das sollte bereits leer sein
- Prüfen ob ein `useEffect` oder ein anderer Mechanismus die Subs nach dem Laden aufklappt
- Wenn der Default `new Set()` korrekt leer ist, muss der Fehler woanders liegen (z.B. im Render-Code der Sub-Karten)

**Offene Fragen:**
- Welche Stelle klappt die Subs aktuell standardmäßig auf?