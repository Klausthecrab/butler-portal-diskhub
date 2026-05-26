### inhaltsverzeichnis verbessern
*— · 25.05.2026*

**Problem**
inhaltsverzeichnis (in "diskussionen" , egal welche tiefe): ansicht switch, dass 
A) erledigte (sortiert nach datum). Ausblendbar
B) Rest (sortiert nach datum).

2) anklickbar, wie "hoch oder runter" zu dem element springt (von view).

**Lösung**
— Umsetzung in 4 Schritten (jeder Schritt ist für sich testbar) —

**Schritt 1: TOC-Einträge werden zu klickbaren Sprung-Links** ✅ (26.05.2026)
Jeder Eintrag im Inhaltsverzeichnis bekommt einen Link:
- Textboxen → springen zur Box-Karte (id="box-N")
- Sub-Diskussionen → springen zum Sub-Accordion-Kopf (NEU: id="sub-{id}")
- index-Einträge → springen zum Punkt (id="punkt-N")

Prüfbar: Klick auf TOC-Eintrag → Seite scrollt zum passenden Element.

**Schritt 2: TOC erkennt, ob ein Element erledigt ist oder nicht** ✅ (26.05.2026)
generateToc() prüft beim Parsen:
- Bei Textboxen: steht "(✓ erledigt)" im Titel? → erledigt
- Bei index-Einträgen: steht "(✓ erledigt)" im Titel? → erledigt
- Bei Sub-Diskussionen: siehe Schritt 3

Prüfbar: TOC zeigt ✅ oder 🔜 neben jedem Eintrag.

**Schritt 3: Sub-Diskussionen bekommen einen "erledigt"-Status** ✅ (26.05.2026)
Eine Sub-Diskussion bekommt einen Status. Das passiert auf zwei Arten:

**Automatisch (Standard):** Wenn ALLE Blöcke + index-Einträge in der Sub-Diskussion erledigt sind (done_count > 0 und open_count === 0), gilt die Sub-Diskussion selbst als erledigt. Die Daten dafür sind bereits in sub.parsed vorhanden.

**Manueller Override:** Zusätzlich gibt es einen ⬜/✅-Schalter direkt am Sub-Accordion-Kopf (neben dem 📂-Titel). Damit kann man den Status von Hand setzen — z.B. eine Sub-Diskussion als erledigt markieren, obwohl noch einzelne Punkte offen sind, oder als offen markieren, obwohl alle Punkte durch sind. Der manuelle Schalter hat Vorrang vor der automatischen Erkennung.

Diese Info wird dann an mehreren Stellen genutzt:

- Im TOC: Sub-Eintrag bekommt ✅-Symbol (erledigt) oder 🗂️ (offen)
- Im Sub-Accordion-Kopf (die 📂-Zeile): bekommt ein data-status="done" oder "open" Attribut
- Der bestehende hideDone-Toggle (#30) blendet Sub-Diskussionen dann auch aus

**Technisch:** Der Override wird als Attribut im Sub-Accordion gespeichert (z.B. eine CSS-Klasse oder ein State im Frontend). Es wird NICHTS in den Dateien auf der Festplatte gespeichert — ein Neuladen der Seite setzt zurück auf automatische Erkennung.

Prüfbar: Eine Sub-Diskussion mit erledigten Unterpunkten zeigt sich automatisch als ✅. Man kann das manuell überschreiben (z.B. auf offen setzen). Bei aktiviertem hideDone-Toggle verschwinden erledigte Sub-Diskussionen von der Seite.

**Schritt 4: TOC kriegt einen Zwei-Ansichten-Switch** ✅ (26.05.2026)
Oberhalb des Inhaltsverzeichnisses erscheinen 3 Knöpfe:
[Alle] [Nur Offene] [Nur Erledigte]

- "Alle" (Standard, wie heute): zeigt alle TOC-Einträge
- "Nur Offene": zeigt nur Elemente ohne ✅
- "Nur Erledigte": zeigt nur Elemente mit ✅

Die Sortierung erfolgt nach Datum (wie in der Problembeschreibung). generateToc() muss dafür das Datum aus den Blöcken auslesen können (die Zeile "*— · DD.MM.YYYY*").

Prüfbar: Switch auf "Nur Offene" → TOC zeigt weniger Einträge. Switch auf "Nur Erledigte" → TOC zeigt nur ✅-Einträge. Reihenfolge ist nach Datum sortiert.

**Status**
✅ erledigt (26.05.2026 — alle 4 Schritte implementiert)