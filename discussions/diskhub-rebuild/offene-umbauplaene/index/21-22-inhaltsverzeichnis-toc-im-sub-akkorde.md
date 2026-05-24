### #22: Inhaltsverzeichnis (TOC) im Sub-Akkordeon statt README-Präambel (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** Expanded Body der Sub-Akkordeons (Main-View) zeigt jetzt `generateToc(sub.blocks, sub.index)` statt der README-Präambel. Der TOC zeigt 📝-Einträge aus `blocks.md` und 🗂️-Subs aus `index.md` im ├── Einzeiler-Stil — inkl. Sub-Sub-Diskussionen. Fallback auf README-Präambel/README wenn weder blocks noch index vorhanden. `generateToc()` war bereits vorhanden — musste nur im Akkordeon-Kontext aufgerufen werden. Build OK.
