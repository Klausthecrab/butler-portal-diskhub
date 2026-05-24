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

### #F: KI-Kommentare in index.md (Konzept diskutieren)
*— · 24.05.2026*

Abgeleitet aus diskhub-rebuild#box-17 (Index.md vs textboxen).

Idee: index.md-Einträge enthalten unsichtbare Kommentare, die nur für die KI lesbar sind.
Beispiel: "hi hermi. hier ist ein Kommentar von vergangener KI zu zukunfts-hermi: diese Parameter beschreiben die technischen Details vom Portal XYZ, Stand dd.mm.yyyy."

Fragen:
- HTML-Kommentare (<!-- ... -->) im gerenderten Markdown? Oder spezielles Syntax?
- Wie wird sichergestellt dass Kommentare gepflegt werden?
- Monitoring-Cron bei Erkennung von Änderungen?
- Nur für index.md oder auch für Textboxen / Sub-Diskussionen?

### #G: Live-Scan statt hartcodierter Beschreibung (niedrige Prio)
*— · 24.05.2026*

Abgeleitet aus diskhub-rebuild#box-17 (Index.md vs textboxen).

Niedrige Priorität.

Idee: Statt hartcodierter Beschreibungen (z.B. "Python 3.12, Flask-Backend") einen Befehl / Mechanismus der selbst prüft was der aktuelle Stand ist und beim Öffnen des Accordions einen "Live-Scan" ausführt.

Ziel: Kein Veralten von Beschreibungen. KI bekommt beim Lesen automatisch den aktuellen Stand.

Offene Fragen:
- Wie technisch umsetzbar (Backend-Endpoint pro Portal / pro Sub-Diskussion)?
- Caching / letzter-Run-Zeitstempel?
- Erst relevant wenn index.md-Sonderrolle geklärt ist.

### #H: Datei-Architektur: Einzeldateien statt Sammeldateien (Konzept)
*— · 24.05.2026*

Abgeleitet aus der Diskussion um index.md vs. Textboxen (Session 24.05.2026).

Aktuell: Alle Umbauplan-Punkte leben in index.md, alle Textboxen in blocks.md — jeweils eine große Datei mit vielen ###-Einträgen. Referenzen sind positionsbasiert (#box-3).

Vision: Jeder Eintrag bekommt eine eigene .md-Datei:
- Umbauplan-Punkte → /index/punkt-xx.md
- Textboxen → /blocks/box-name.md
- Sub-Diskussionen bleiben Ordner (wie gehabt)
- README.md bleibt wie gehabt

Vorteile:
- Stabile Pfad-Referenzen statt fragiler Indizes
- Git-Diff zeigt nur den betroffenen Eintrag
- Promotion zur Sub-Diskussion = Ordner anlegen, Datei verschieben

Nachteile / Fragen:
- Viele kleine Dateien statt einer großen — Overhead?
- Ein API-Request liefert alle Blöcke — bei Einzeldateien mehr Requests?
- Sortierung (chronologisch, alphabetisch via Prefix?)
- UI merkt der Nutzer nichts — reine Backend-Änderung

Offene Details:
- 🔗-Referenzen: Kopiert nach Umbau `diskhub-rebuild/index/01-datei-struktur.md` für Umbauplan-Punkte und `diskhub-rebuild/blocks/box-name.md` für Textboxen? (Abhängig von #B)
- Migrationspfad: Was passiert mit bestehenden index.md / blocks.md? Werden sie automatisch per Script gesplittet (1 ###-Eintrag → 1 Datei)? Manuelle Migration? Mix?
- Promotion: "Datei verschieben" = `mv blocks/feedback.md feedback/README.md`? Oder Ordner anlegen + Datei behalten als `feedback/blocks/box.md`?
- API-Konsequenz: Aktuell returns GET /diskhub/xyz die kompletten Dateien als String. Nach Umbau: Liste von Dateien aus /index/ + /blocks/ zurückgeben? Neuer Endpoint nötig?
- Verhalten nach Migration: Existieren index.md und blocks.md noch (als dünnes Inhaltsverzeichnis / TOC) oder verschwinden sie komplett?

Setzt #E (Sonderrolle index.md) und #A (Semantik-Regeln) voraus.

### #I: Pfad-Button-Format — Selbst-erklärende Referenz für KI-Sessions
*— · 24.05.2026*

> **Quelle:** diskhub-rebuild#box-18 (pfad button in diskhub)

**Ziel:**
Der 🔗-Button in Textboxen, Bild-Blöcken, Sub-Diskussionen und index.md-Einträgen kopiert einen String in die Zwischenablage, der einer frischen KI-Instanz auf Anhieb sagt:
1. Um welche Diskussion geht es?
2. Welche Hierarchie-Ebene / welcher Element-Typ (Textbox, Sub-Diskussion, index-Eintrag, Bild)?
3. Welche Position innerhalb der Diskussion?
4. Worum geht es inhaltlich?
→ Ohne dass die KI raten, suchen oder zusätzlichen Kontext brauchen muss.

**Max' Vision (aus der Diskussion):**
- Eine kompakte, einheitliche Notation, die sowohl Menschen als auch KI verstehen
- Der kopierte String ist KEIN Prompt und KEINE Anweisung — nur eine präzise Referenz
- Die Notation kodiert die Hierarchie: Ist das Element eine Textbox (flach), eine Sub-Diskussion (Ordner) oder ein index.md-Eintrag (Sonderrolle)?
- Die Nummer/ID ist stabil: Einmal vergeben, nie wieder verwendet — auch wenn das Element später gelöscht wird
- Keine mehrzeiligen Strings — einzeilig, kompakt, sofort erfassbar
- Der gleiche Mechanismus funktioniert für alle Element-Typen (Textbox, Bild, Sub, index-Eintrag)

**Vorschlag (zu diskutieren):**

| Element-Typ | Format | Beispiel |
|---|---|---|
| Textbox | `<diskussion> > box-<nr> "<titel>"` | `diskhub-rebuild > box-18 "pfad button in diskhub"` |
| Bild | `<diskussion> > img-<nr> "<titel>"` | `diskhub-rebuild > img-1 "Bild-Rendering Fix #38"` |
| Sub-Diskussion | `<diskussion>/<sub-slug>` | `diskhub-rebuild/offene-umbauplaene` |
| index.md-Eintrag | `<diskussion> > entry-<nr> "<titel>"` | `diskhub-rebuild > entry-31 "Pfad-Button für index.md"` |

Warum dieses Format:
- `>` trennt Hierarchie-Ebenen — sofort lesbar als "A > B"
- `box-`, `img-`, `entry-`, Sub-als-Pfad kodieren den Element-Typ
- Der Titel in Anführungszeichen ist ein Kurz-Kontext — kein Ratespiel mehr
- Kompakt: einzeilig, meist unter 100 Zeichen

**Nummern-Stabilität (wichtig!):**
Wenn eine Textbox gelöscht wird, bleibt ihre Nummer "gestorben" — keine neue Box bekommt `box-18`. Sonst verweisen alte Referenzen plötzlich auf einen anderen Inhalt.
- Technisch: blocks.md bekommt Platzhalter oder die Nummer wird nie neu vergeben
- Alternativ: UUIDs statt Index? (aber weniger lesbar)
- Fragen an Max: Reicht "nie neu vergeben" oder brauchen wir einen sichtbaren Platzhalter in blocks.md?

**Offene Fragen:**
- Soll das Format auch von Hermi-Kommandos geparst werden können (z.B. `/lies diskhub-rebuild > box-18`)?
- Brauchen index.md-Einträge das gleiche `entry-`-Format oder reicht der bestehende `#punkt-<nr>`-Anchor?
- Soll das Format später durch ein strukturierteres Schema ersetzt werden (z.B. `diskhub://`-URI)?

**Fortschritt (24.05.2026):**
- [x] `copyBoxLink()` in `Page.jsx` umgestellt: akzeptiert `headingText`, erzeugt `diskussion > box-<nr> "titel"` (bzw. `img-<nr>` für 📷-Blöcke)
- [x] Beide 🔗-Buttons (Textboxen + Bild-Blöcke) aktualisiert — rufen `copyBoxLink(idx, headingText)` auf
- [x] Title-Attribut zeigt Vorschau des kopierten Strings
- [x] Build OK (16.39s), Dashboard-Neustart, API 200
- [ ] Sub-Diskussionen 🔗 (#C) noch nicht umgestellt (eigenes Format `diskussion/sub-slug`)
- [ ] index.md-Einträge 🔗 (#B) noch nicht umgestellt
- [ ] Nummern-Stabilität (Platzhalter bei Löschung) noch nicht implementiert

### #J: Umbauplan — Element-Semantik & Phasenmodell
*— · 24.05.2026*

Synthese aus der Diskussion zu #A (Semantik-Regeln) und #E (Sonderrollen). Definiert die Reihenfolge des Umbaus.

**Phase 0 — Foundation:** Knowledge-Skill `diskhub-element-semantik` erstellen (Element-Typen, Sonderrollen-Katalog, Kriterien). Memory-Verweis setzen. `diskhub-doc`-Skill patchen. → #A

**Phase 1 — Adressierbarkeit:** index.md-Einträge + Sub-Diskussionen bekommen 🔗 + HTML-ID + Auto-Scroll. → #B, #C

**Phase 2 — Element-Typen trennen:** Einfache index.md-Einträge → Textboxen migrieren (#D). Verbleibende index.md-Einträge auf Sonderrollen limitieren + visuelle Markierung (#E).

**Phase 3 — Integration:** Session-Starter für alle Element-Typen (#42), Prompt-Baukasten (#44), Auto-Rückkanal (#45), Verifikation (#47), Status-SSoT (#48).

**Phase 4 — Zukunft:** KI-Kommentare (#F), Live-Scan (#G), Einzeldateien (#H), Dead-Code-Cleanup (#39).

**Sonderrollen-Katalog (Phase 0):**
- README/Header — System-Element, Fixposition Top
- Inhaltsverzeichnis (TOC) — System-Element, Fixposition nach Header
- Ist-Zustand/Architektur — index.md-Eintrag, visuell markiert
- Decision Record — index.md-Eintrag, visuell markiert
- Changelog — index.md-Eintrag, visuell markiert, am Ende
- Kalender/Timeline — Future, eigener Renderer