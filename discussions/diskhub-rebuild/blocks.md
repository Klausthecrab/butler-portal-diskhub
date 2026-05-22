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

1) Idee / Konzept / Fragestellung
2) Status quo
3) offene Diskussionspunkte
4) weg dahin / entscheidungen / abgearbeitete "offene Punkte" behalten, aber aus dem load rausnehmen, den eine KI Session laden soll. meine these: 1+2+3 muss ausreichen. Sie beschreiben doch hinreichend oder? zugegeben: vielleicht "entscheidungen" oder so als sonderfall aufnehmen. 
5) Erklärung / Anleitung
