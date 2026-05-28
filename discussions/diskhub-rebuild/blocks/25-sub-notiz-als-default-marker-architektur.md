### Sub-Notiz als Default + Marker-Architektur

*— · 28.05.2026*

**Problem**
DiskHub hat aktuell zwei konkurrierende Konzepte: "Textbox" (flache Einzeldatei in blocks/) und "Sub-Diskussion" (Ordner). Der Nutzer muss entscheiden, welches Element wann richtig ist. Ausserdem ist das Format des Inhalts nicht standardisiert – KI schreibt in Textboxen was sie will, ohne klare Strukturvorgaben. Externes Pushen von Dateien funktioniert nicht nativ.

**Lösung**
Vereinheitlichung auf ein einziges Konzept: **Jedes UI-Element = Ordner + zentrale .md-Datei**. Die .md-Datei verwendet klar definierte Marker (Signalzeichen), die der Parser erkennt und daraus das UI baut.

---

## Detailliertes Konzept

**1. Alles ist ein Ordner (Sub-Notiz als Default)**
- Jeder Block, jede Box, jede Sub-Diskussion ist ein Ordner
- Jeder Ordner hat eine zentrale `.md`-Datei (z.B. `readme.md`, `index.md` oder `content.md`)
- Der Ordner kann Unter-Ordner haben → werden im UI zu Unterpunkten / Sub-Blöcken
- Der Ordner kann Assets enthalten: `bilder/`, `data.csv`, `skripte/`
- Für den Nutzer sieht es im UI genauso aus wie heute – nur die Architektur dahinter ändert sich

**2. Marker-basierte Struktur (Signalzeichen)**
Statt erzwungener Struktur (Problem/Lösung/Status) definiert die `.md`-Datei selbst über Marker, was sie enthält:

```
§§§Titel§§§
Mein Block-Titel

§§§Tags§§§
#Status_offen, #dringend, #deathline_15.06

§§§Zusammenfassung§§§
Kurzbeschreibung für die Listenansicht.

§§§Content§§§
Hauptinhalt – beliebiges Markdown.
Kann Absätze, Listen, Code-Blöcke enthalten.

§§§Fussnote§§§
Optionale Fussnote oder Quellenangabe.
```
(Syntax-Entscheidung noch offen: `§§§Marker§§§` oder `[[Marker]]` – beides funktioniert, beides kommt im normalen Fließtext nicht vor. Wird in der Detailplanung final festgelegt.)

Der Parser scannt die Datei auf bekannte Marker und baut daraus das UI. Unbekannte Marker werden ignoriert. Fehlende Marker = leerer Bereich, kein UI-Bruch.

**3. Typ-Erkennung aus Dateikombination**
Der Typ eines Elements (Text, Tabelle, Bild) ergibt sich aus dem, was im Ordner liegt:
- Nur `readme.md` → Textbox
- `readme.md` + `daten.csv` → Tabelle (CSV wird gerendert)
- `readme.md` + `bilder/` → Galerie
- `readme.md` + Unter-Ordner → Container mit Sub-Blöcken

Kein API-Call, keine Registration, keine Metadaten-Datei. Der Inhalt definiert den Typ.

**4. Externer Import ohne Registration**
- `cp -r /irgendwo/mein-thema/ discussions/diskhub-rebuild/blocks/`
- DiskHub erkennt den neuen Ordner automatisch (via `os.listdir()` – wie Subs heute)
- Die `.md`-Datei wird per Marker-Parser ausgelesen
- Der Ordner erscheint als Box im UI
- `git push` funktioniert genauso

**5. Verschieben ohne Bruch**
- `mv blocks/14-alter-name blocks/14-neuer-name` → Box erscheint unter neuem Slug
- `mv blocks/14-thema blocks/03-andere-box/` → Box wird zum Sub-Element
- **Wichtig:** Der Ordner-Name ist NUR ein Slug. Der kanonische Titel steht in der `readme.md` unter `§§§Titel§§§`. Der 🔗-Link referenziert den Inhaltstitel, nicht den Ordnernamen. Daher: Umbenennung des Ordners ändert den 🔗 nicht (Titel in der readme bleibt gleich).

**6. UI bleibt gleich (mit optionalem File-Tree)**
- Hauptansicht: Liste von Boxen mit Titel, Zusammenfassung, Status-Badge, 🔗 – wie heute
- Klick auf eine "einfache" Box (nur readme.md) → gleiche Ansicht wie heutige Textbox
- Klick auf Box mit Tabelle/Galerie → spezielle gerenderte Ansicht
- Optionaler File-Tree-Navigator (Toggle ein/aus) zeigt die Ordner-Hierarchie als Baum

---

## Vorteile gegenüber heute
- **Einheitliches Modell:** kein Entscheidungsdruck "Block oder Sub-Diskussion?"
- **Typen nativ:** Tabelle, Galerie, Text ergeben sich aus Dateien im Ordner
- **Externer Import:** Dateien von aussen reinwerfen funktioniert ohne Registration
- **Verschieben:** `mv` auf Ordner-Ebene, kein manuelles Umhängen von Referenzen
- **KI-resistenter:** Die Marker geben feste Felder vor (Titel, Tags, Status), die KI nicht haluzinieren kann – anders als bei freiem Markdown wo sie eigene Abschnittsnamen erfindet
- **Flexibel:** Neue Marker können definiert werden ohne API/Backend-Änderung

---

## Nachteile / Risiken
- **Mehr Dateisystem-Einträge:** Statt 20 Dateien → 20 Ordner + 20 readme.md = 40 Einträge
- **Leere Ordner:** Anlegen eines leeren Ordners fühlt sich schwerer an als eine Datei → Quick-Add abstrahiert das
- **Inline-Rendering nötig:** "Einfache" Ordner (nur readme.md) müssen auf der Hauptseite ohne Sub-View-Klick sichtbar sein – sonst Alltagsverschlechterung
- **Performance:** Viele Read-Operationen bei vielen Ordnern – wird bei Bedarf gelöst (Caching, mtime-Index), kein Showstopper
- **Neubau statt Umbau:** Alte Daten bleiben im alten DiskHub, keine automatische Migration. Koexistenz bis Archivierung

---

## Entscheidung: Neubau statt Umbau

Das alte DiskHub (eingebettet als Blueprint im Dashboard, Port 8090) wird nicht weiter umgebaut. Stattdessen entsteht ein **eigenständiger Dienst auf eigenem Port (8100)** mit eigenem Backend + Frontend.

**Gründe für den Neubau:**
- **Split-View** (File-Tree links + Content rechts) – im Dashboard müsste man das gesamte Layout umbauen
- **Drag & Drop** im Tree – kein Dashboard-Element unterstützt das nativ
- **Anchor-IDs** für Marker-Abschnitte – jeder `§§§Abschnitt§§§` bekommt eine `#12-einleitung`, 🔗 kopiert `diskhub/thema/block#12-einleitung`
- **Live-Vorschau** beim Editieren – WebSocket statt Submit-API
- **Template-Engine** für neue Ordner – `"Neu: Tabelle"` erzeugt `readme.md + daten.csv + schema.yaml`
- **Flat + Deep gleichzeitig** – Inline-Ansicht für einfache Ordner, Vollbild-View für komplexe
- **Keine 2200-Zeilen-routes.py** – modular: Parser, Watcher, Template-Engine, API sind getrennt
- **Echter Router** (React Router / SvelteKit) statt `window.location.hash`
- **File-Watcher** (watchdog) statt API-Polling – Änderungen am Dateisystem tauchen sofort im UI auf

Der Neubau läuft parallel zum alten DiskHub. Beide koexistieren, bis der alte Dienst nicht mehr genutzt wird und archiviert werden kann.

---

**Aus der Diskussion der "blinden Flecken" geklärt:**
- **Anchor-IDs** sind kein optionales Feature, sondern zentrales Konzept – Abschnitt-genaues Referenzieren ist das Kern-Value-Proposition
- **Marker-Syntax** (`§§§…§§§` oder `[[…]]`) wird final in der Detailplanung festgelegt – beides funktioniert
- **Ordner-Name = Slug**, kanonischer Titel aus `readme.md` – löst 🔗-Bruch bei Umbenennung
- **Performance** wird bei Bedarf gelöst (Caching, mtime), kein Showstopper
- **Keine parallelen Content-Modelle** – der Neubau steht für sich, kein Legacy-Parser nötig
- **SSOT = Dateisystem** – Registry ist nur Dienst-Index, keine Content-Speicherung
- **Schnelle Gedanken** werden extern gelöst (spätere Integration via Import)

---

## Zielbedingungen

**A – Jedes UI-Element ist ein Ordner**
- `add_box()` erzeugt `blocks/NN-name/readme.md` statt `blocks/NN-name.md`
- Backend-Parser erkennt beides: alte flache Dateien UND neue Ordner im gleichen Block-Array
- Einmaliges Batch-Script migriert alle bestehenden Dateien zu Ordnern

**B – Marker-Parser funktioniert**
- `_parse_markers(content)` extrahiert aus jeder `.md` alle bekannten Marker
- Bekannte Marker: `Titel`, `Tags`, `Status`, `Zusammenfassung`, `Content`, `Fussnote` (in den Syntaxen `§§§Marker§§§` oder `[[Marker]]` – wird final festgelegt)
- Frontend rendert aus Markern: Titel, Status-Badge, Zusammenfassung, Content
- Marker-lose Dateien werden als reiner Markdown-Text gerendert (Fallback, z.B. für extern importierte Dateien ohne Marker)

**C – Externer Import ohne Registration**
- Jeder Unterordner in `blocks/` mit `.md`-Datei erscheint automatisch als Box
- Kein API-Call, kein Cron-Job nötig
- Typ-Erkennung aus Dateikombination (csv → Tabelle, bilder/ → Galerie)

**D – UI-Verhalten**
- Haupt-Listenansicht zeigt Boxen, Subs, Status, 🔗 – wie heute
- "Einfache" Ordner (nur readme.md) werden ohne Sub-View-Klick auf der Hauptseite gerendert
- Ordner mit Tabelle/Galerie öffnen spezielle gerenderte Ansicht
- Optionaler File-Tree-Navigator (Toggle)

**E – Verschieben ohne Bruch**
- `mv` auf Ordner-Ebene → UI aktualisiert sich
- Stabile Referenzierung (UUID oder Redirect) für 🔗-Links

**F – Migration bestehender Daten**
- Script: `blocks/NN-name.md` → `blocks/NN-name/readme.md`
- Bestehende Subs (bereits Ordner) bleiben unverändert
- Alte 🔗-Referenzen funktionieren weiter (Fallback im Parser)
- Kein Datenverlust, kein manuelles Nacharbeiten

**G – Template-System für Ordnerstrukturen**
- `"Neu: Tabelle"` erzeugt `ordner/readme.md + ordner/daten.csv`
- `"Neu: Galerie"` erzeugt `ordner/readme.md + ordner/bilder/`
- `"Neu: Link-Liste"` erzeugt `ordner/readme.md + ordner/links.csv`
- Marker-Parser unterstützt Template-Variablen (`{{datum}}`, `{{titel}}`)
- Ein "Quick-Add"-Input oben auf der Seite abstrahiert die Ordner-Erzeugung komplett – der User merkt nie, dass er einen Ordner anlegt

**H – Drag & Drop im File-Tree**
- Per D&D werden Ordner im Tree umsortiert: Verschieben, Eltern/Kind-Beziehung ändern
- D&D löst `mv` auf dem Dateisystem aus – der File-Watcher aktualisiert das UI sofort
- Abbruch / Undo bei fehlgeschlagenem `mv`

**I – Breadcrumb-Navigation im Sub-View**
- Jede Sub-View zeigt: `DiskHub › Thema › Block › Abschnitt`
- Jeder Breadcrumb-Teil ist klickbar (springt zurück)
- Breadcrumb wird aus der Ordner-Hierarchie abgeleitet – kein manueller Eintrag

**J – Batch-Operationen**
- Mehrere Boxen auswählen (Checkboxen in der Listenansicht)
- Batch: alle als erledigt markieren, taggen (`#dringend`), verschieben, löschen
- Batch: alle ausgewählten kopieren / exportieren

**K – Split-Ansicht (File-Tree + Content)**
- Linke Spalte: aufklappbarer File-Tree aller Ordner
- Rechte Spalte: Inhalt des ausgewählten Ordners
- Toggle zum Ein-/Ausklappen der linken Spalte (wie VS Code Explorer)
- Der Tree ist persistent – wechselt nicht beim Klick auf einen anderen Ordner

**L – Undo / Papierkorb**
- Gelöschte Ordner landen in `diskhub/.trash/` (versteckt im Root)
- 7-Tage-Verfallszeit – danach automatisch `git rm + commit`
- UI: "Gelöschte Elemente" im Tree ganz unten (ausgegraut), mit "Wiederherstellen"-Button
- Wiederherstellen = `mv .trash/ordner/ ordner/` – inklusive aller Kinder

**M – Anchor-IDs für seiteninterne Referenzierung**
- Jeder Marker-Abschnitt in der `readme.md` bekommt eine automatisch generierte ID (aus dem Marker-Namen: `§§§Fazit§§§` → `#fazit`, `[[Zusammenfassung]]` → `#zusammenfassung`)
- Der 🔗-Button kopiert bei Fokus auf einen Abschnitt: `diskhub/thema/block#fazit`
- Anchor-IDs sind von Anfang an im Parser integriert – kein nachträgliches Einbauen
- Das Frontend scrollt beim Laden der URL mit `#anchor` direkt zur entsprechenden Sektion
- Fallback bei fehlendem Anchor: gesamter Block wird geladen (wie heute)

**Status**
🔜 offen