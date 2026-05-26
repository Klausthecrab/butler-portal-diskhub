### #29: UI-Layout: Preview auf 30-35 %

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
