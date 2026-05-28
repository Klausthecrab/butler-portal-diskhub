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
- `mv blocks/14-alter-name blocks/14-neuer-name` → Box erscheint unter neuem Namen
- `mv blocks/14-thema blocks/03-andere-box/` → Box wird zum Sub-Element
- 🔗-Referenzen: Ordner-Umbenennung ändert den 🔗-Pfad. Lösung: Entweder Redirect (alter Pfad → neuer Pfad) oder stabile UUID pro Ordner (unsichtbare `.id`-Datei)

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
- **Leere Ordner:** Anlegen eines leeren Ordners fühlt sich schwerer an als eine Datei
- **Inline-Rendering nötig:** "Einfache" Ordner (nur readme.md) müssen auf der Hauptseite ohne Sub-View-Klick sichtbar sein – sonst Alltagsverschlechterung
- **Migration:** Alle bestehenden blocks/NN-name.md müssen zu blocks/NN-name/readme.md migriert werden
- **🔗-Bruch bei Umbenennung:** Wenn Ordner umbenannt werden, brechen alte Referenzen

---

## Zielbedingungen

**A – Jedes UI-Element ist ein Ordner**
- `add_box()` erzeugt `blocks/NN-name/readme.md` statt `blocks/NN-name.md`
- Backend-Parser erkennt beides: alte flache Dateien UND neue Ordner im gleichen Block-Array
- Einmaliges Batch-Script migriert alle bestehenden Dateien zu Ordnern

**B – Marker-Parser funktioniert**
- `_parse_markers(content)` extrahiert aus jeder `.md` alle bekannten Marker
- Bekannte Marker: `§§§Titel§§§`, `§§§Tags§§§`, `§§§Status§§§`, `§§§Zusammenfassung§§§`, `§§§Content§§§`, `§§§Fussnote§§§`
- Frontend rendert aus Markern: Titel, Status-Badge, Zusammenfassung, Content
- Alte (markerlose) Dateien funktionieren trotzdem → Fallback auf Gesamttext

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

**Status**
🔜 offen