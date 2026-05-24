### Erledigte ausblenden — Globaler Toggle für DiskHub
*— · 24.05.2026*

**Diskussion mit Kazzle:** Ein globaler Kippschalter (oben im Header) der alle als `✓ erledigt` markierten Elemente aus der Ansicht ausblendet. Betrifft Textboxen in blocks.md und index.md-Einträge gleichermaßen.

**Analyse (Hermi):**
- Status ist bereits als `data-status="done"` auf jedem Element vorhanden
- Blocks werden in React-JSX gerendert → sauber via `.filter()` machbar
- Index-Einträge sind HTML-String (`dangerouslySetInnerHTML`) → CSS-Weg einfacher: `.hide-done [data-status="done"] { display: none; }`
- Hybrid-Ansatz empfohlen: React-State + Filter für Blocks, CSS-Klasse für Index-Einträge

**Umsetzung noch nicht gestartet — zur Diskussion freigegeben.**