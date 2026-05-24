# Blöcke — diskhub-rebuild

---

### Test Textbox
*— · 22.05.2026*

einfach  eine Textbox eingefügt umzu testen ob das element klappt und damit in der Diskussion das "Textbox" Element auch vorhanden ist

### Textbox buttons
*— · 22.05.2026*

zu den "zu Sub ändern" / "Als Sub übernehmen" :

was ist der unterschied der 2 Buttons?
Sauber erklären bzw text dazu als Hooverover einblenden oder nur noch einen button behalten: es soll bei druck eine Discordsession gestartet werden (im rechten pre view panel einsehbar), mit dem prompt "lass uns aus dieser Textbox Notiz eine Sub-Diskussion entwickeln. Mache vorschläge für das Anlegen "


### feedback
*— · 22.05.2026*

diese punkte mit mir diskutieren:
- die einträge werden nicht in chronologischer Reihenfolge korrekt dargestellt. (es gibt doch sicherlich "datum und uhrzeit" einträge um das zu spezifizieren, oder?
- möglichkeit Bilder einzufügen, via "modal öffnet sich; ich kann STRG+V machen oder pfad auswählen. Dann wird es "chronologisch in die Diskussin integriert": Eintrag im inhaltsverzeichnis; (icon für bild); es bekommt auch buttons wie die textbox. (die "strg+v oder hochgeladene Datei soll dann als bilddatei in dem entsprechenden Ordner der Diskussion liegen).
- visuell: es ist noch sehr viel platz horizontal. "rechtes Element" (preview) könnte man auf 30-35% breite reduzieren, und das Diskussionselement links entsprechend größer, ohne so großen rand links und rechts. warum: damit u.a. die Datumanzeige etwas größer ist, aber gleichzeitig "vom design" genau zwischen "kugel" und Textboxelement passt.

### feedback zu "+Textbox"
*— · 22.05.2026*

1) der "in Sub entwickeln" button sollte umgebaut werden: 
und zwar so, dass der button nun 2 phasen hat.
erste phase: ich klicke einmal drauf. darauf hinerscheint ein "chat starten" nachfrage. (visuell auf dem button). und ich kann nochmal klicken (2. klick). erst dann wird die Diskussion im Discord chat gestatet - das was aktuell bei 1. klick passiert.
Zusätzlich: nach dem ersten klick, also wenn "chat starten bestätigen" eingeblendet wird, wird mir ein prompt in die zwischenablage kopiert. und zwar nur den "prompt", den diese neue session bekommen würde. warum: damit ich , wenn ich bereits eine session offen habe, diesen prompt trotzdem nutzen kann. nicht hardcoden, sondern diesen "prompt" miteinander verknüpfen bzw eine single source of truth geben. 

2) der "pfad" button ist von mir anders gewünscht: 
und zwar der technisch korrekte begriff um diese Notiz Textbox zu referenzieren. Warum: damit ich in eine bereits bestehende Session mit diesem pfad / den korrekten bezugspunkt / referenz mitteilen kann. 

erkläre mir das in deinen worten


### Feedback unsortiert
*— · 22.05.2026*

- promptvorschläge / templates unten bei der "+ neue textbox" ?
-- dynamisch? (offene punkte erkannt: startprompt für "starte mit nächstem offenen punkte. lies alles dazu und diskutiere mit mir".
- wenn ich runter scrolle ist überdeckt "Diskussion und Technisch" headerleiste nur einen Teil. Darüber kommt "der hintergrund" bzw das Diskussionsfenster / inhalt (terracotta kasten bspw) wieder etwas zum vorschein. da muss das design "bündig" sein oder eben nicht mehr so einen "schlitz" erzeugen.
- archiv konzept: bzw haben wir nicht zentrale Elemente:
-- Titel / Grundsätzliche Fragestellung. 
-- Offene Punkte
---neue: Archiv / entscheidungen
--- Status quo  / Anleitung/Erklärung besser ausbauen: gibt es offene Punkte, dann "aktueller stand" / status quo als erklärung zur grundsätzlichen Fragestellung dazugeben. weil wir "weiter machen". Gibt es keine offenen punkte oder es wird eine zwischenstufe definiert, sodass "Anleitung/Erklärung" aktualisiert werden: erklärung (für maschinen) wie das zu nutzen ist. "was es ist". und Anleitung um Max zu erklären was ist / wie man es benutzt. Dazu: "human readable" kurzfassung für "wenn ich nach 3 Monaten zurückkommen zu dieser Diskussion". 
Haben wir sowas im Kern schon? "Readme"? und ich muss das nur besser nutzen, einbauen und definieren?

welchen workflow will ich erziehlen:

### Ohne Bild
*— · 23.05.2026*

Nur Text

### 📷 Bild-Rendering Fix #38
*— · 23.05.2026*

![Bild-Rendering Fix #38](/api/diskhub/assets/diskhub-rebuild/bild-2305-1.png)

### feedback:
*— · 23.05.2026*

- stimmt jetzt "neu = unten"?
- bild: ich möchte das das bei draufklicken "in einem popup in originalgröße dargestellt wird
- bild bekommt eigenes "box "typ / vorlage. auch einklappbar. Aber optisch abheben von Textbox
- schriftzug " Haupt-Diskussion fortsetzen" entfernen

### Feedback neu
*— · 23.05.2026*

- sub-diskussionen chronologisch einsortieren
- "bearbeiten und speichern" von Textboxen klappt nicht

### farb / statusänderung
*— · 23.05.2026*

von textboxen. wenn ich grau / markiere. dann nimmt ein "aufräumen" cron und packt diese in "archiviert" .
"textblock aufräumer"

generell cron entwickeln, der "status quo" scanned und readme / aktuellen stand updated. das mit mir diskutieren.

### sub diskussionen brauchen pfad button
*— · 24.05.2026*

es muss mir möglich sein "hier weitermachen" bzw "hier ist der Pfad, mach dich damit vertraut und warte auf weitere anweisungen" zu machen.

ich möchte "sub-diskussionen" referenzieren / adressieren können. dafür fehlt mir der "pfad" button

### Feedback zur migration
*— · 24.05.2026*

"memory trimmer" projektordner wurde versucht zu migrieren in "diskhub" system, damit wir die weiterentwicklung hier nachverfolgen und dokumentieren können.

probleme dabei: 
- "box" system wurde nicht verstanden. Thematische Unterteilung der Textelemente wurde nicht gemacht
- "Sub-Diskussion" für "offene punkte" wurde erst auf nachfrage / hinweis gemacht
- "offene punkte" wurden nicht vollständig übernommen. ich musste nachfragen um dies zu erreichen
- readme / aktuellen stand zusammenfassen ist ungenau / zu ausführlich.

wie kann man die migration, aber vor allem: "die nutzung" verbessern. wenn ich hermi bitte "mit diskhub" zu interagieren, dann muss klar sein was meine erwartung ist. 
Sub-Diskussionen, Textblöcke, etc

### Erwartungsbeschreibung — Single Source of Truth für Status
*— · 24.05.2026*

Der Erledigt-Status wird nur an einer Stelle gesetzt: auf der tiefsten Ebene des entsprechenden Elements — also in der Sub-Sub-Diskussion oder in der Textbox, wo die Arbeit tatsächlich dokumentiert ist.

Alle Ebenen darüber (Sub-Diskussion, Haupt-Diskussion) lesen diesen Status automatisch aus — sie repliceren ihn nicht als eigenen Text. Kein (✓ erledigt) in index.md, kein **Status:** ✓ in README. Das Frontend ermittelt den Status dynamisch aus den Daten der untergeordneten Elemente.

Bedeutung: Ich pflege den Status einmal → er erscheint überall dort, wo dieses Element referenziert wird. Konsistent, wartbar, keine Sync-Probleme.

### feedback erneut:
*— · 24.05.2026*

keine ahnung ob ich das feedback schon hatte, aber
- textboxen (erledigt) per default "eingeklappt"
- Textboxen titel soll sich nicht mehr ändern, wenn ich das akkordeon aufklappe. Das soll einheitlich den titel wiedergeben
