### #29: UI-Layout: Preview auf 30-35 % (✓ erledigt)

*— · 22.05.2026*

> **Quelle:** "feedback"-Textbox in blocks.md
> Rechte Preview-Spalte auf 30-35 % reduzieren, Diskussionselement links entsprechend vergrößern, Außenrand links/rechts verkleinern. Die Datumanzeige im Connector soll optisch besser zwischen Punkt und Textbox-Element passen.

**Verständnis (26.05.2026 nach Klärung mit Kazzle):**

Das Ziel ist nicht nur die Panel-Aufteilung (65/35), sondern dass die **Inhalte im linken Panel die vollen 65 % auch nutzen**. Aktuell sind Textbox-Karten und Connector schmaler als der Panel — es bleibt rechts davon dunkelblauer Leerraum. Die Elemente sollen sich bis zum rechten Rand des Panels strecken.

Drei Änderungen nötig:

**1. Default auf 65/35**
- `splitRatio` in Page.jsx von 55 auf 65 ändern (Default für linkes Panel)
- Rechts dann automatisch 35 %

**2. Linkes Panel-Inhalt verbreitern**
- Die Textbox-Karten und der Connector (Punkt → Linie → Datum) sollen die gesamte linke Panel-Breite von ganz links bis ganz rechts ausfüllen
- Kein ungenutzter blauer Rand rechts neben den Textboxen

**3. Datum im Connector**
- Bleibt unter der waagerechten Linie (wie aktuell), nur optisch besser integrieren

**Umsetzung (26.05.2026):**

**1. splitRatio 55 → 65**
- `Page.jsx` Zeile 1111: Default `'55'` → `'65'`
- Nach Build + Restart aktiv. Persistiert per localStorage, benutzerdefinierte Werte bleiben erhalten.

**2. docInner max-width entfernt**
- `Page.module.css`: `.docInner { max-width: 720px; margin: 8px auto 0; }` → `margin: 8px 0 0;`
- Zuvor war der Inhalt auf 720px gedeckelt und zentriert — jetzt füllt er die volle Panel-Breite.
- Zusätzlich: `.blockWrapper` bekam `margin-right: -24px` (zusätzlich zum bestehenden `margin-left: -24px`) — Blocks erstrecken sich über die Padding-Grenzen hinaus.

**3. Connector-Datum optimiert**
- `Page.module.css`: `.connectorDate`:
  - `font-size: 0.55rem → 0.6rem` (etwas größer)
  - `color: #f1f5f9 → #94a3b8` (dezenter, weniger grell)
  - `margin-top: 2px → 4px` (mehr Abstand zur Linie)
  - `text-align: center` hinzugefügt

**Verifikation (Browser-Console, 26.05.2026 21:02):**
```
docPanel: 65% | splitDivider: 6px | previewPanel: 35%
→ Layout-Aufteilung bestätigt: 65/35
```
- Block-Cards messen ~733px Breite (vorher ~696px durch 720px-Cap)
- Connector-Datum zeigt `9.6px` / `#94a3b8` / `margin-top: 4px` an
- Build: 16s ✅ | Dashboard-Restart: ✅ | UI-Anzeige: ✅
