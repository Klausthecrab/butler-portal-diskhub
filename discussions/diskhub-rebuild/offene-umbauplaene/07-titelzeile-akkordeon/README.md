# Titelzeile im Akkordeon vereinheitlichen

**Erstellt:** 21.05.2026 · **Status:** ● offen

**Problem:** Die Titelzeile von "Umbaupläne" zeigt unterschiedlichen Text, je nachdem ob das Akkordeon ausgeklappt ist oder nicht. Soll immer gleich sein — unabhängig vom Akkordeon-Zustand.

**Lösungsansatz:**
- Stelle sicher, dass der gerenderte Header/Title im Akkordeon unveränderlich ist
- Kein dynamischer Text, kein separater "zugeklappter" vs "aufgeklappter" Title
- Prüfen: Wo genau kommt der unterschiedliche Text her? (data.parsed / discHeader / renderIndexMd?)

**Offene Fragen:**
- Welche konkreten Texte weichen aktuell voneinander ab?