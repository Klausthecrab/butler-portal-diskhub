### Titelzeile wirkt unstimmig
*— · 27.05.2026*

**Problem**
Die Titelzeile/Header des Galerie-Bild-Blocks passt optisch nicht zu den anderen Block-Elementen.

**Details**
- Andere Blöcke haben einen einheitlichen Header mit Title + DisclosureTriangle + Action-Buttons (💬🔗⬜✏️🗑️)
- Bild-Blöcke haben ein abweichendes Layout — kein DisclosureTriangle, anderer Rand/Abstand
- Der visuelle Bruch fällt besonders auf, weil der Block nicht einklappbar ist (siehe #120)
- Sobald die Einklappbarkeit (#120) implementiert ist, sollte sich die Titelzeile automatisch angleichen
- Falls nicht: CSS-Anpassungen nötig (Padding, Margin, Border-Radius, Button-Positionierung)

**Akzeptanzkriterium**
- Bild/Galerie-Block-Header ist optisch nicht von anderen Block-Headern unterscheidbar
- Gleiche Höhe, gleiche Button-Anordnung, gleicher Abstand

**Status**
🔜 offen