# Blöcke — diskhub-rebuild/offene-umbauplaene

---


### #49 neue "offene Punkte" werden unformatiert angelegt
*— · 24.05.2026*

von hermi angelegte Punkte sind extrem "wall of text". Formatierung um leserlichkeit zu verbessern wäre gut

### #A: Semantik-Regeln für Textbox vs. Sub-Diskussion definieren
*— · 24.05.2026*

Wo halten wir die Entscheidungen fest? Ziel: Klare Definition, die sowohl für Menschen als auch für AI lesbar ist.

Fragen:
- Wo lebt diese Definition? (Neue Diskussion / Punkt in diskhub-rebuild / eigene Datei?)
- Was sind die genauen Kriterien für Textbox vs. Sub-Diskussion?
- Wie wird Adressierbarkeit für index.md-Einträge hergestellt?

Zusätzlich: Die Definition muss so festgehalten werden, dass a) ich (Max) sehe welche spezifischen Regeln wir haben und b) die KI weiß dass es diese gibt. Optimal wäre ein allgemeiner Mechanismus den die KI immer kennt — wegen Context-Window-Grenzen reicht das aber nicht. Daher muss die Definition bspw. beim Verifizieren (nach Änderungen) automatisch auffallen und referenziert werden. Alternativ: Skill oder Memory-Baustein, der bei relevanten Tasks geladen wird.

### #B: Index.md-Einträge adressierbar machen (🔗-Button)
*— · 24.05.2026*

Alle ###-Einträge in index.md (ohne Sub-Diskussion) bekommen einen 🔗-Button. Kopiert: diskhub-rebuild/offene-umbauplaene#punkt-31. HTML-ID punkt-XX auf dem <h3>-Element, Auto-Scroll wie bei #box-Ankern.

Betrifft: #13, #29-#50+ (alle index.md-Einträge ohne eigenen Sub-Diskussions-Ordner)

### #C: Sub-Diskussionen adressierbar machen (🔗-Button)
*— · 24.05.2026*

Die 📂-Accordion-Elemente von Sub-Diskussionen (#01-#12) bekommen einen 🔗-Button. Kopiert beim Klick: diskhub-rebuild/offene-umbauplaene/01-datei-struktur. Ziel: per Link direkt eine bestimmte Sub-Diskussion öffnen.

### #D: Einfache index.md-Einträge zu Textboxen migrieren
*— · 24.05.2026*

Punkte OHNE Sub-Diskussion (#13, #29-#50+) werden aus index.md entfernt und als echte Textboxen in blocks.md angelegt. Die index.md-Zeile wird zum Stub mit Referenz auf die Textbox. Setzt #B (Adressierbarkeit) voraus als Basis.

### #E: Index.md-Einträge auf Sonderrolle limitieren (mit mir diskutieren)
*— · 24.05.2026*

Abgeleitet aus diskhub-rebuild#box-17 (Index.md vs textboxen).

Max' Gedanken:
- Textboxen sollen das vorherrschende Element werden, für alles was noch keine Sub-Diskussion ist
- Sub-Diskussionen = Ordner (enthalten Elemente)
- Textboxen = Einzelelemente (nur Text)
- index.md-Einträge nur noch für Dinge die sich bewusst NICHT weiterentwickeln sollen
- Diese Sonderrolle soll farblich anders sein als Textboxen
- Beispiele: README, Architektur-Beschreibungen, verifizierte Ist-Zustände

Fragen für die Diskussion:
- Sollen index.md-Einträge komplett durch Textboxen ersetzt werden?
- Wenn Sonderrolle: welche Kriterien gelten für index.md vs. Textbox?
- Wie visuell trennen (Farbe / Icon / Position)?
- Was passiert mit bestehenden index.md-Einträgen?
