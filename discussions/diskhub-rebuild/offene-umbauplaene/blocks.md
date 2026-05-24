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

### #H: Datei-Architektur — Einzeldateien statt Sammeldateien
*— · 24.05.2026*

> **Umsetzungsplan (erstellt 24.05.2026, Hermi + Kazzle)**

## Vision

Jeder Eintrag bekommt eine eigene `.md`-Datei. Keine Sammeldateien mehr (`blocks.md`, `index.md`). Stabile Pfad-Referenzen statt positionsbasierter Nummern.

**Datei-Struktur nach Umbau** (Beispiel: `offene-umbauplaene`):
```
offene-umbauplaene/
├── README.md                              ← bleibt (Diskussionstitel + Metadaten)
├── blocks/                                ← NEU: Ordner für Textboxen
│   ├── 00-neue-punkte-unformatiert.md     ← ### #49
│   ├── 01-semantik-regeln.md              ← ### #A
│   ├── 02-index-adressierbar.md           ← ### #B
│   ├── 03-sub-adressierbar.md             ← ### #C
│   ├── 04-migration-textboxen.md          ← ### #D
│   ├── 05-sonderrolle-index.md            ← ### #E
│   ├── 06-ki-kommentare.md                ← ### #F
│   ├── 07-live-scan.md                    ← ### #G
│   ├── 08-einzeldateien.md                ← ### #H (diese Datei)
│   ├── 09-pfad-button-format.md           ← ### #I
│   └── ...                                ← weitere Textboxen (#29–#50+)
├── index/                                 ← NEU: Ordner für index.md-Einträge
│   ├── 00-datei-struktur.md               ← ### #01 (erledigt)
│   ├── 01-ui-struktur.md                  ← ### #02 (erledigt)
│   └── ...                                ← ### #03–#28 (erledigt, Stubs aus #D)
├── 01-datei-struktur/                     ← Sub-Diskussion (Ordner, bleibt)
│   ├── README.md
│   ├── index.md
│   └── blocks.md
├── 02-ui-struktur/                        ← Sub-Diskussion (Ordner, bleibt)
│   └── ...
└── assets/                                ← Bilder, bleibt
```

**Dateinamen-Konvention:**
- `NN-slug.md` — zweistellige Nummer (`00`–`99`) für Sortierung + Slug aus Titel (max 40 Zeichen, nur `[a-z0-9-]`)
- Beispiel: `### #A: Semantik-Regeln definieren` → `01-semantik-regeln.md`
- `NN` = fortlaufend, gelöschte Dateien geben ihre Nummer nicht frei (wie #box-Nummern)
- Neue Einträge bekommen nächsthöhere Nummer

**🔗-Referenz-Format (neu):**
- Statt `diskhub-rebuild/offene-umbauplaene > box-8 "..."`  
- Neu: `diskhub-rebuild/offene-umbauplaene/blocks/08-einzeldateien`  
- Pfad = stabil, nie neu vergeben, auch wenn Datei gelöscht wird

**Promotion zur Sub-Diskussion:**
- `mv blocks/08-einzeldateien.md 08-einzeldateien/README.md`  
- Ordner anlegen, Datei als README verschieben → Sub-Diskussion ist geboren

**Was bleibt, was fällt:**
- `blocks.md` und `index.md` als Sammeldateien → **werden gelöscht** nach erfolgreicher Migration
- Keine redundante TOC-Datei — das Frontend generiert das TOC dynamisch
- `README.md` bleibt unverändert
- Sub-Diskussions-Ordner bleiben unverändert (haben bereits Einzeldatei-Charakter)
- `assets/` bleibt unverändert

---

## Phase 0 — Definitionen & Konventionen (✅ Konzept steht)

- [x] **D.01** — Dateinamen-Konvention: `NN-slug.md` mit max 40 Zeichen, `[a-z0-9-]`
- [x] **D.02** — Sortierung: alphabetisch via `NN`-Prefix, neue Einträge bekommen nächsthöhere Zahl
- [x] **D.03** — 🔗-Format: `diskussion/blocks/nn-slug` bzw. `diskussion/index/nn-slug`
- [x] **D.04** — Promotion-Pattern: `mv blocks/file.md ziel/README.md`
- [x] **D.05** — Sammeldateien werden gelöscht, kein redundantes TOC
- [x] **D.06** — API-Response: `blocks` bleibt String (backward compatible), zusätzlich `blocks_files[]` mit `{name, title}`

---

## Phase 1 — Backend: Read umstellen

Ziel: `get_discussion()` in `routes.py` kann Einzeldateien aus `/blocks/` und `/index/` lesen. Fallback auf alte Sammeldatei für Rückwärtskompatibilität.

**Sub-Punkte:**
- [x] **B.01** — `get_discussion()`: Prüfe ob Ordner `blocks/` existiert → wenn ja, lese alle `.md`-Dateien, sortiert, konkateniert zu einem String für `result['blocks']`  
  + sammle `blocks_files[]: [{name, title}]` aus dem Heading der ersten Zeile jeder Datei
- [x] **B.02** — Gleiches Pattern für `index/`-Ordner: `result['index']` + `result['index_files']`
- [x] **B.03** — Fallback: Wenn `blocks/` nicht existiert, lies wie bisher `blocks.md` → backward compatible
- [x] **B.04** — `_parse_index_status()` muss auch den `/index/`-Ordner parsen können (oder bleibt auf dem String) — **keine Änderung nötig**, concatenated String wird gleich geparst
- [x] **B.05** — Test: GET /diskhub/offene-umbauplaene liefert gleichen Response wie vorher (rein String), zusätzlich `blocks_files[]`
- [x] **B.06** — Health-Check: API 200 nach Änderung

---

## Phase 2 — Backend: CRUD auf Einzeldateien

Ziel: `add_box`, `edit_block`, `delete_block` arbeiten auf Einzeldateien statt zeilenbasiert in `blocks.md`.

**Sub-Punkte:**
- [x] **C.01** — `add_box()`: Prüft ob `blocks/` existiert → Einzeldatei (`blocks/<nn>-<slug>.md`), sonst Fallback `blocks.md`
  - `nn` = nächsthöhere Zahl aus bestehenden Dateien in `/blocks/`
  - `slug` = aus Titel generiert (lowercase, `[a-z0-9-]`, max 40 Zeichen)
  - Inhalt: `### <titel>\n*— · <datum>*\n\n<content>\n`
- [x] **C.02** — `add_box()` bei Bild-Upload: Gleiches Pattern mit 📷-Prefix im Titel
- [x] **C.03** — `edit_block()`: `file_name` aus Request → Datei direkt überschreiben (Datumszeile erhalten)
  - Fallback: wenn `file_name` fehlt → alter `block_index`-Pfad für backward compat
- [x] **C.04** — `delete_block()`: `file_name` → Datei löschen (`os.remove`)
  - Fallback: wenn `file_name` fehlt → alter `block_index`-Pfad
- [ ] **C.05** — Frontend: 🔗-Button, Edit-Button, Delete-Button senden `file_name` statt `block_index`
  - `renderBlock()` bekommt `file_name` aus `blocks_files[]` oder direkt aus der Datei
  - `copyBoxLink()` kopiert Pfad-Format: `diskussion/blocks/nn-slug`
- [x] **C.06** — Error-Handling: Datei existiert nicht → 404 mit klarer Meldung
- [x] **C.07** — Test: add/edit/delete auf API 200 + Datei existiert/nicht existiert (Fallback-Pfad ✅, Einzeldatei-Pfad nach Phase 3)
- [x] **C.08** — Health-Check: API 200 nach Änderungen

---

## Fortschritt (Phase 1 + 2 — 24.05.2026)

**Was umgesetzt wurde:**

**Phase 1 — Backend Read umstellen:**
- `get_discussion()` prüft `blocks/` und `index/` Ordner, liest Einzeldateien sortiert, konkateniert zu String
- Fallback auf `blocks.md` / `index.md` wenn Ordner nicht existieren
- Neue API-Felder: `blocks_files[]`, `index_files[]` mit `{name, title}`

**Phase 2 — Backend CRUD auf Einzeldateien:**
- `add_box()`: Prüft ob `blocks/` existiert → schreibt Einzeldatei (`blocks/<NN>-<slug>.md`), sonst Fallback `blocks.md`
- `edit_block()`: Akzeptiert `file_name` → liest/schreibt Datei direkt (Datumszeile erhalten). Fallback `block_index`
- `delete_block()`: Akzeptiert `file_name` → `os.remove()`. Fallback `block_index`
- Alle Endpunkte backward-compatible: Frontend muss nicht geändert werden

**Ausstehend:** C.05 (Frontend 🔗-Button + Edit/Delete senden `file_name`) — kommt in Phase 4

---

## Verifikation nach Phase 3 (Migration)

Nachdem das Migration-Script läuft und `blocks/` existiert:

1. `ls -la discussions/<disc>/blocks/` — alle `.md`-Dateien vorhanden, sortiert nach `NN`
2. `GET /diskhub/<disc>` — `blocks`-String identisch zu vorher, `blocks_files[]` gefüllt mit korrekten `{name, title}`
3. `POST /diskhub/add-box` — neue Datei `blocks/<NN>-<slug>.md` angelegt, `file_name` im Response
4. `POST /diskhub/edit-block` mit `file_name` — Datei-Content aktualisiert, Datumszeile erhalten
5. `POST /diskhub/delete-block` mit `file_name` — Datei gelöscht, `blocks_left` korrekt
6. `GET /diskhub/other-disc` — Diskussion OHNE `blocks/` funktioniert noch (backward compat)
7. `GET /diskhub/health` — 200

Am besten als Python-Script (`scripts/verify-phase-1-2.py`) das automatisch alle 7 Punkte prüft.

---

## Phase 3 — Migration: Sammeldateien aufsplitten

Ziel: Einmaliges Script, das bestehende `blocks.md` und `index.md` in Einzeldateien zerlegt.

**Sub-Punkte:**
- [ ] **M.01** — Script schreiben: `scripts/split-collection-files.py`
  - Liest `blocks.md`, findet alle `### `-Headings
  - Pro Block: Dateiname aus Heading-Titel generieren (`NN-slug.md`)
  - Block-Inhalt in Datei schreiben (inkl. `### `-Header)
  - Wenn Datei bereits existiert (Kollision): `NN-slug-2.md`
- [ ] **M.02** — Sortierung via `NN` aus bestehender Reihenfolge in blocks.md
- [ ] **M.03** — Gleiches Script für `index.md`: `/index/punkt-<slug>.md`
  - Erledigt-Einträge und Stubs (#D) landen ebenfalls in Einzeldateien
- [ ] **M.04** — Nur für Haupt-Diskussionen + Sub-Diskussionen, die `blocks.md` oder `index.md` haben
- [ ] **M.05** — Nach erfolgreicher Migration: `blocks.md` und `index.md` löschen (mit `trash`, nicht `rm`)
- [ ] **M.06** — Git-Commit: `disc: #H — migration: blocks.md + index.md in Einzeldateien`
- [ ] **M.07** — Manuelle Verifikation: Diskussion im Dashboard öffnen → gleiche Blöcke + gleiches TOC
- [ ] **M.08** — 🔗-Referenzen in anderen Diskussionen prüfen: Verweisen sie noch korrekt? (Alte `#box-<nr>`-Anker brechen — müssen zu Pfad-Referenzen migriert werden)

---

## Phase 4 — Frontend: 🔗-Format umstellen

Ziel: 🔗-Button kopiert stabile Pfad-Referenzen statt `box-<nr>` und `entry-<nr>`.

- [ ] **F.01** — `copyBoxLink()` akzeptiert optional `file_name`: Wenn vorhanden → `diskussion/blocks/<file_name>`, sonst wie bisher `diskussion > box-<nr>`
- [ ] **F.02** — Index.md-Einträge: `diskussion/index/<file_name>` statt `diskussion > entry-<nr>`
- [ ] **F.03** — Sub-Diskussionen bleiben: `diskussion/sub-slug` (keine Änderung nötig)
- [ ] **F.04** — Datei-Kollision: Wenn Dateiname aus Slug berechnet wird, muss er unique sein (Prefix + Kurzslug reicht)
- [ ] **F.05** — Build: `npm run build` → fehlerfrei

---

## Phase 5 — Sub-Diskussionen: Sub-eigene blocks.md → Einzeldateien (optional)

Nur wenn Kazzle das auch für Sub-Diskussionen will. Betrifft alle 12 Sub-Ordner in `offene-umbauplaene/`.

- [ ] **S.01** — Prüfung: Haben Sub-Diskussionen bereits Einzeldateien? (Subs haben README + index.md + blocks.md — könnten auf gleiches Pattern umgestellt werden)
- [ ] **S.02** — Umsetzung: selbes Script wie Phase 3, rekursiv für alle Sub-Ordner
- [ ] **S.03** — Nur wenn Kazzle das explizit freigibt — Sub-Subs sind seltener

---

## Phase 6 — Git-Integration: Auto-Commit

Ziel: Nach jeder Einzeldatei-Änderung → sauberer Commit mit Dateinamen.

- [ ] **G.01** — `git add -A` → `git commit -m "disc: <disc>/<sub>: box — <titel>"` für add-box
- [ ] **G.02** — `git add -A` → `git commit -m "disc: <disc>/<sub>: box editiert — <titel>"` für edit
- [ ] **G.03** — `git add -A` → `git commit -m "disc: <disc>/<sub>: box gelöscht — <titel>"` für delete
- [ ] **G.04** — `git push` nach Commit (autonom, wie butler-hermi-config)

---

## Abhängigkeiten

| # | Abhängigkeit | Status | Auswirkung auf #H |
|---|---|---|---|
| #A | Semantik-Regeln (Textbox vs Sub vs index) | ✅ erledigt | Bestätigt Drei-Typen-Trennung: `/blocks/`, `/index/`, Sub-Ordner bleiben eigenständig |
| #B | Adressierbarkeit 🔗 | ✅ erledigt | 🔗-Format muss von `box-<nr>`/`entry-<nr>` auf Pfade umgestellt werden (Phase 4) |
| #E | Sonderrolle index.md | ✅ konzeptuell geklärt | Index.md-Einträge in `/index/punkt-xx.md` — Sammeldatei wird obsolet |

---

## 🔗-Referenz-Auflösung nach Migration

**Alte Referenzen** in Diskussionen und KI-Sessions, die noch `#box-<nr>` oder `#punkt-<nr>` verwenden:

| Altes Format | Neues Format | Beispiel |
|---|---|---|
| `#box-0` | `blocks/00-neue-punkte-unformatiert` | `diskhub-rebuild/offene-umbauplaene/blocks/00-neue-punkte-unformatiert` |
| `#box-8` | `blocks/08-einzeldateien` | → 🔗 kopiert jetzt Pfad |
| `#punkt-31` (alt) | `blocks/...` | nach #D-Migration längst in blocks.md |

Alte `#box-<nr>`-Anker brechen nach Migration — das ist akzeptabel, weil:
- 🔗-Button kopiert ab sofort Pfad-Format
- Alte Referenzen in Session-Logs sind historisch
- Wenn nötig: Migration-Map-Datei für KI-Tools

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
- [x] **Sub-Diskussionen 🔗 (#C):** Bereits implementiert — Button kopiert `diskhub-rebuild/offene-umbauplaene` (Zeile 1960)
- [x] **index.md-Einträge 🔗 (#B):** Bereits implementiert — Button kopiert `diskhub-rebuild > entry-31 "Titel"` via globalem Click-Handler (Zeile 403+2564)
- [ ] Nummern-Stabilität (Platzhalter bei Löschung) noch nicht implementiert

### #J: Umbauplan — Element-Semantik & Phasenmodell
*— · 24.05.2026*

Synthese aus der Diskussion zu #A (Semantik-Regeln) und #E (Sonderrollen). Definiert die Reihenfolge des Umbaus.

**Phase 0 — Foundation:** Knowledge-Skill `diskhub-element-semantik` erstellen (Element-Typen, Sonderrollen-Katalog, Kriterien). Memory-Verweis setzen. `diskhub-doc`-Skill patchen. → #A

**Phase 1 — Adressierbarkeit:** index.md-Einträge + Sub-Diskussionen bekommen 🔗 + HTML-ID + Auto-Scroll. → #B, #C

**Phase 2 ✅ — Element-Typen trennen:** Einfache index.md-Einträge → Textboxen migrieren (#D). Verbleibende index.md-Einträge auf Sonderrollen limitieren + visuelle Markierung (#E).

**Sonderrollen-Katalog (Phase 0):**
- README/Header — System-Element, Fixposition Top
- Inhaltsverzeichnis (TOC) — System-Element, Fixposition nach Header
- Ist-Zustand/Architektur — index.md-Eintrag, visuell markiert
- Decision Record — index.md-Eintrag, visuell markiert
- Changelog — index.md-Eintrag, visuell markiert, am Ende
- Kalender/Timeline — Future, eigener Renderer

**Phase 0 — Fortschritt (24.05.2026):**
- ✅ Knowledge-Skill `knowledgeskill-diskhub-element-semantik` erstellt (shared-Kategorie)
- ✅ Memory-Verweis gesetzt (alter DiskHub-Eintrag ersetzt)
- ✅ `diskhub-doc`-Skill um Referenz auf neuen Knowledge-Skill ergänzt
- 🔜 Nächster Schritt: Phase 1 (Adressierbarkeit #B, #C) — von Kazzle freigeben lassen

**Phase 1 — Fortschritt (24.05.2026):**
- ✅ `renderBlock()` + `renderIndexMd()`: HTML-ID `punkt-<idx>` + 🔗-Button mit `data-copy-entry` und `data-ref` (Format: `diskussion > entry-<nr> "titel"`)
- ✅ Sub-Diskussionen (#C): 🔗-Button kopiert `diskussion/sub-slug` mit `e.stopPropagation()` (öffnet kein Accordion)
- ✅ Auto-Scroll: `#punkt-<idx>` Hash → `scrollIntoView()` via useEffect
- ✅ Globaler Click-Handler: `document.addEventListener` delegiert `[data-copy-entry]` → clipboard write + ✅-Feedback
- ✅ Build OK (16.21s), Dashboard-Neustart, API 200
- 🔜 Nächster Schritt: Phase 2 (Element-Typen trennen #D, #E) — von Kazzle freigeben lassen

**Phase 2 — Fortschritt (24.05.2026):**
- ✅ **#D — Migration:** 15 offene index.md-Einträge (#29–#48 ohne ✓) als Textboxen in blocks.md angelegt (box-12 bis box-26)
- ✅ index.md-Stubs: Jeder migrierte Eintrag durch `→ Textbox #box-NN` ersetzt
- ✅ 33 erledigt-Einträge (#01–#28, #33, #38, #40, #41, #46) als Sonderrollen in index.md belassen
- ✅ Migration-Map dokumentiert: `#punkt-XX` (alt) → `#box-YY` (neu) in Commit-Nachricht
- ✅ **#E — Limitierung:** Kategorien aus Phase 0 angewendet — offene Punkte → Textbox, erledigte → Sonderrolle (Decision Record)
- ✅ Build OK (16.20s, Vite), Dashboard-Restart, API 200 — 27 Blöcke, 48 Index-Einträge, 15 Stubs
- 🔜 Visuelle Markierung für Sonderrollen (CSS data-role) — zurückgestellt, Kazzle will erstmal so lassen

### #K: Konzeptblöcke in blocks.md sollen „erledigt"-Status bekommen
*— · 24.05.2026*

> **Quelle:** Max (Feedback zu #I — Fortschritts-Doku ohne erledigt-Marker)

Aktuell: Nur index.md-Einträge haben `(✓ erledigt)` + `*Erledigt: DD.MM.YYYY*`. Konzeptblöcke in blocks.md haben kein Status-System — sie bleiben ewig "offen" auch wenn alle Teil-Items umgesetzt sind.

**Ziel:** Konzeptblöcke (#A–#K) bekommen ebenfalls einen Status-Mechanismus:
- Nicht alle Blöcke sollen das brauchen (manche bleiben dauerhaft offen)
- Aber wenn ein Block "erledigt" ist, soll das sichtbar sein — z.B. `(✓ erledigt)` im Titel wie bei index.md
- Frontend: 📷-Blöcke haben schon Sonder-Rendering (#40). Könnte man auf erledigt-Blöcke ausweiten (anderes Icon, collapsed by default, dezenterer Stil)
- Backend: Keine Änderung nötig? `*Erledigt: DD.MM.YYYY*` könnte einfach im Content der Textbox stehen

**Offene Fragen:**
- Soll ein erledigter Block automatisch collapsed sein (wie 📷-Blöcke)?
- Soll der `diskhub-doc` Skill (#46) auch blocks.md-Blöcke schließen können?
- Was passiert mit dem 🔗-Button? Zeigt er weiterhin die Referenz, auch wenn erledigt?

**Fortschritt (24.05.2026):**
- [x] `handleToggleDone()` in `Page.jsx`: Liest `(✓ erledigt)` aus dem Heading, toggelt via vorhandener `/edit-block`-API
- [x] `isDone`-Detektion: `headingText.includes('(✓ erledigt')` → `data-status={isDone ? 'done' : 'open'}` (CSS existierte bereits)
- [x] ⬜/✅-Button in der Action-Leiste beider Block-Typen (Bild + Text): zwischen 🔗 und ✏️
- [x] CSS: `.toggleDoneBtn` + `.toggleDoneBtnActive` (hover: grün→erledigen, orange→öffnen)
- [x] Kombinierbar mit manuellem ✏️-Edit — beide schreiben in den selben Title in blocks.md
- [x] Build OK (16.24s), Dashboard-Neustart, API 200
- [x] Compiled JS + CSS verifiziert: `toggleDoneBtn`, `handleToggleDone`, `erledigt` im Bundle vorhanden
- [x] Kazzle fragt: Gleicher Button auch für index.md-Einträge möglich? → Plan in box-11 dokumentiert
- [x] **Umsetzung (24.05.2026):** ⬜/✅-Button für index.md-Einträge implementiert
  - Backend: `POST /api/diskhub/edit-index-title` — toggelt `(✓ erledigt)` auf ###-Entry + git commit
  - Frontend: Button in `renderBlock()`-HTML via `data-toggle-index-done` + globalem Click-Handler (Pattern wie `data-copy-entry`)
  - Entscheidung: Backend A (nur Title) + Frontend A (im bestehenden Handler-Pattern)
  - Build OK, Dashboard-Neustart, API 200 verifiziert

**Plan: ⬜/✅-Button für index.md-Einträge (+ verfeinerter Plan)**

**Warum extra?** Der Button für blocks.md nutzt `/edit-block` — die bestehende API für Textboxen. index.md-Einträge haben keinen eigenen Edit-Endpoint. Der ✏️-Button existiert dort nicht. Also braucht's einen neuen Endpoint.

**Backend — neuer Endpoint:**
- `POST /api/diskhub/edit-index-title`
- Input: `discussion_id`, `entry_index` (0-based, entspricht `#punkt-<nr>`), `new_title`, optional: `sub_id`
- Backend: Lädt index.md, findet die `###`-Zeile per Position (durchgehen bis zum entry_index-ten `###`), ersetzt ihren Title-Teil, schreibt zurück, git commit
- Der Title-Teil ist alles nach `### ` bis zum Zeilenende (oder bis `||` wenn Sub-Referenz) — aber für index.md-Einträge ohne `||` einfach die ganze Zeile
- **Option A: Nur Title ersetzen** — simpel, `git diff` zeigt nur die geänderte Zeile
- **Option B: Automatisch Status-Zähler in README.md aktualisieren** — nützlich aber komplexer (muss zählen wie viele Einträge `(✓ erledigt)` haben vs. nicht)

**Frontend — Button-Logik:**
- Selbes Pattern wie in `BlocksSection`: Jeder index.md-Eintrag kriegt einen ⬜/✅-Button
- Aktuelle Position: index.md-Einträge haben keinen eigenen Button-Bereich — sie werden als Accordion in `renderIndexMd()` gerendert, die Action-Buttons (🔗) hängen über einem globalen Event-Handler dran
- **Ansatz A: Button in den bestehenden 🔗-Handler integrieren** — neben den `entry-<nr>`-🔗 einen zweiten Button setzen
- **Ansatz B: Eigener kleiner Button pro Eintrag** — sauberer, aber mehr DOM-Eingriff
- Erkennung identisch: `(✓ erledigt)` im `###`-Text → grüne Box
- Der Button ruft `POST /api/diskhub/edit-index-title` mit dem toggelten Title auf

**Status-Zähler (optional aber empfohlen):**
- README.md der Diskussion hat oft: `**Status:** X erledigt · Y offen`
- Der Button könnte beim Setzen/Entfernen von `(✓ erledigt)` die Zähler automatisch neu berechnen
- Macht das Feature deutlich wertvoller — kein manuelles Nachpflegen vergessener Zähler mehr
- **Pitfall:** Der Zähler zählt meist index.md-Einträge, nicht blocks.md-Blöcke. Müsste konsistent sein: entweder beide zählen oder klar trennen.

**Workflow für Kazzle:**
1. ✅ Entscheiden: Option A (nur Title) oder B (Title + Zähler) für den Endpoint? → **A (nur Title)**
2. ✅ Entscheiden: Ansatz A oder B für den Frontend-Button? → **A (im bestehenden Handler-Pattern)**
3. ✅ Hermi baut
4. ✅ Build + Dashboard-Restart
5. ✅ Doku im Fortschritt

### #29: UI-Layout: Preview auf 30-35 %

*— · 22.05.2026*

> **Quelle:** "feedback"-Textbox in blocks.md
> Rechte Preview-Spalte auf 30-35 % reduzieren, Diskussionselement links entsprechend vergrößern, Außenrand links/rechts verkleinern. Die Datumanzeige im Connector soll optisch besser zwischen Punkt und Textbox-Element passen.

### #30: Zwei-Phasen-Button "In Sub entwickeln"

*— · 22.05.2026*

> **Quelle:** "feedback zu '+Textbox'" in blocks.md
> Erster Klick auf "💬 In Sub entwickeln": Button wechselt auf "Chat starten?" (Bestätigungsanzeige) und kopiert den Session-Prompt automatisch in die Zwischenablage. Zweiter Klick startet die Discord-Session. Der Prompt selbst als Single Source of Truth definieren (nicht hartcodiert im Frontend).

### #31: Technisch korrekte Referenz im Pfad-Button

*— · 22.05.2026*

> **Quelle:** "feedback zu '+Textbox'" in blocks.md
> Der 🔗-Pfad-Button (#26) soll nicht nur `#box-<idx>` kopieren, sondern den technisch korrekten Referenzbegriff — z. B. den vollständigen Diskussionspfad inkl. Sub-ID. Ziel: in einer laufenden KI-Session den genauen Bezugspunkt einer Box referenzieren können.

### #32: Prompt-Vorlagen bei "+ Neue Textbox"

*— · 22.05.2026*

> **Quelle:** "Feedback unsortiert"-Textbox in blocks.md
> Vorschläge/Templates unterhalb der "+ Neue Textbox"-Eingabefelder. Dynamisch basierend auf erkannten offenen Punkten in der Diskussion? Startprompt-Idee: "Starte mit dem nächsten offenen Punkt — lies alles dazu und diskutiere mit mir."

### #34: Diskussions-Struktur-Konzept / Archiv

*— · 22.05.2026*

> **Quelle:** "Feedback unsortiert"-Textbox in blocks.md
> Vollständiges Konzept für Diskussions-Struktur:
> 1. Titel / Grundsätzliche Fragestellung
> 2. Status quo (aktueller Stand)
> 3. Offene Punkte
> 4. Entscheidungen / Archiv (ausgelagert für schlanke KI-Sessions)
> 5. Erklärung / Anleitung (Human- + Machine-Readable)
>
> Prüfen ob README diesen Kern bereits abdeckt und wie die Struktur für KI-Sessions optimiert werden kann (nur 1+2+3 laden, Archiv auslagern).

### #35: Lightbox für Bilder

*— · 22.05.2026*

> **Quelle:** Max (Diskussion #28 Bild-Upload)
> Bilder werden aktuell als rohes `<img>` ohne Größenbeschränkung gerendert — große Bilder zerreißen das Layout.
>
> Gewünscht:
> - Bilder im Content automatisch skalieren (z.B. `max-width: 100%`, `max-height: 400px`, `object-fit: contain`, `cursor: zoom-in`)
> - Klick auf skaliertes Bild öffnet Lightbox-Modal: Bild in Originalgröße, dunkler Hintergrund, zentriert, Close per X oder Klick außerhalb
> - Nur Frontend (kein Backend) — ändert `renderMarkdown()` + neue `.imageLightbox`-Komponente + CSS
>
> **Sub-Punkte:**
> - [ ] **L.01** — CSS für `.docBody img` / `.markdownContent img`: max-height + zoom-in-Cursor
> - [ ] **L.02** — Lightbox-Komponente: onClick → Overlay mit Bild in Originalgröße
> - [ ] **L.03** — Beispielbild in Diskussion eintragen (z.B. Screenshot) um die Lightbox zu demonstrieren

### #36: STRG+V aus Zwischenablage (Screenshots) in Diskussionen

*— · 22.05.2026*

> **Quelle:** Max (Diskussion #28 Bild-Upload)
> Möglichkeit per STRG+V ein Bild aus der Zwischenablage (z.B. Screenshot) in eine Diskussion einzufügen.
>
> ⚠️ **Bereits in #28 F.02 implementiert** — `onPaste`-Handler auf der Textarea in `addBoxSection` erkennt Clipboard-Bilder und speichert sie als `pendingImage`. Das Bild wird beim nächsten "Box hinzufügen" mit hochgeladen.
>
> **Offen:** Soll STRG+V auch außerhalb der `addBoxSection` funktionieren? Z.B. direkt in eine Sub-Diskussion oder als eigenständigen Bild-Block ohne Textbox? Oder ist der aktuelle Flow (Textbox mit Bild) ausreichend?

### #37: Bild-Modal — Eigenständiger STRG+V/Upload-Dialog für Screenshots (geplant)

*— · 23.05.2026*

> **Quelle:** Max (Diskussion #36 STRG+V aus Zwischenablage — Analyse + Plan vom 23.05.2026)
>
> Eigenständiges Modal für Bild-Upload per STRG+V oder Dateiauswahl, **losgelöst von der addBoxSection**. Bild wird als Block in blocks.md gespeichert, Datei im `assets/`-Ordner der Diskussion. **Kein neuer Block-Typ** — blocks.md bleibt Single Source of Truth (normaler `###`-Block mit `📷`-Prefix + `![alt](assets/…)`-Content). Bestehender `add-box` Endpoint wird genutzt; minimale Backend-Änderung (Default-Titel bei fehlendem Title).
>
> **Konzept:**
> - Neues ImageUploadModal als eigenständige Komponente (Overlay)
> - Globaler onPaste-Listener im Modal (nicht an Textarea gebunden) erkennt Clipboard-Bilder
> - Alternativ: versteckter Datei-Upload-Button
> - Titel optional — Default: `Screenshot DD.MM.YYYY`
> - Submit an bestehenden `/api/diskhub/add-box` (Multipart/FormData)
> - Bestehender 📷-Block-Mechanismus: Backend setzt `📷 <titel>` + `![alt](assets/datei.png)` im Content
> - 📷-Button in der UI (neben "➕ Neue Textbox") öffnet das Modal
> - Bild erscheint als Block in BlocksSection + TOC mit 📷-Icon (keine Änderung nötig)
>
> **Frontend:**
> - [x] **F.01** — ImageUploadModal-Komponente erstellen: Overlay mit zentraler Dropzone, Vorschaubereich, Titel-Eingabefeld, Bestätigen-Button, ❌-Close (Escape + X)
> - [x] **F.02** — onPaste-Listener auf Modal-Container (nicht auf Input-Element): `e.clipboardData.items` → `item.type.startsWith('image/')` → `setPendingImage(file)` + `e.preventDefault()`
> - [x] **F.03** — Versteckter `<input type="file" accept="image/*">` mit onChange-Handler (bestehendes Pattern aus addBoxSection übernehmen)
> - [x] **F.04** — Bild-Vorschau via `URL.createObjectURL(pendingImage)` mit Thumbnail + Dateiname + ❌-Entfernen-Button
> - [x] **F.05** — Titel-Eingabefeld mit Default-Vorbelegung: `Screenshot DD.MM.YYYY` (User kann überschreiben oder leer lassen → Default-Wert wird aus Frontend mitgesendet)
> - [x] **F.06** — `handleImageSubmit()`: FormData an `/api/diskhub/add-box` (discussion_id + title + image + is_sub/sub_id falls in Sub-Ansicht) → bei Erfolg Modal schließen + `fetchDiscussionData()` + Titel zurücksetzen
> - [x] **F.07** — 📷-Button ("Bild einfügen") oberhalb/neben "➕ Neue Textbox" in Main-View + Sub-View → öffnet Modal via `setShowImageModal(true)`
> - [x] **F.08** — CSS für Modal (.imageModalOverlay, .imageModalContent), Dropzone (.imageDropzone mit gestricheltem Border), Vorschau (.imagePreview), Buttons in dezenter Optik
>
> **Backend:**
> - [x] **B.01** — `add-box` Endpoint: Wenn `image_file` vorhanden und `title` leer, Default-Titel generieren: `datetime.now(timezone.utc).strftime('Screenshot %d.%m.%Y')`
>
> **Tests:**
> - [ ] **T.01** — Frontend: Modal öffnet sich bei Klick auf 📷-Button (Main + Sub-View)
> - [ ] **T.02** — Frontend: STRG+V im Modal → Bild-Vorschau erscheint (Clipboard-Erkennung ohne fokussierte Textarea)
> - [ ] **T.03** — Frontend: Dateiauswahl (Upload) → Vorschau erscheint
> - [ ] **T.04** — Frontend: ❌-Button entfernt Vorschau → Zustand zurück auf leere Dropzone
> - [ ] **T.05** — Frontend: Submit mit leerem Titel → Block `📷 Screenshot 23.05.2026` + Bild in assets/
> - [ ] **T.06** — Frontend: Submit mit User-Titel → Block `📷 <User-Titel>` + Bild
> - [x] **T.07** — Backend: Multipart-add-box mit image + leerem title → 200 + Default-Titel in blocks.md
> - [x] **T.08** — Backend: Multipart-add-box mit image + title → 200 + 📷-Präfix + Bild-Referenz
> - [x] **T.09** — Backend: Multipart-add-box ohne image (alter JSON-Fall) → kein 📷-Präfix, kein assets/-Zugriff
> - [x] **T.10** — Backend: 5MB-Limit wird respektiert — größere Datei → 413
> - [ ] **T.11** — Integration: Bild-Block erscheint in BlocksSection + TOC mit 📷-Icon und Action-Buttons (#25 Edit/Delete funktionieren)
> - [ ] **T.12** — Integration: Bild-Block in Sub-Diskussion (sub_id-korrekt in assets/-Pfad + blocks.md)
> - [x] **T.13** — Build + Restart + Health-Check: API 200

### #39: Dead Code Cleanup — Alten 📷-Button + pendingImage-Logik aus addBoxSection entfernen

*— · 23.05.2026*

> **Quelle:** Max (Feedback zu #37 — alter Bild-Einfügen-Button in addBoxSection ist obsolet)
>
> Mit dem neuen ImageUploadModal (#37) gibt es zwei Wege Bilder einzufügen:
> - **Neu:** 🖼️-Button → Modal → STRG+V/Upload → Bestätigen (bevorzugt)
> - **Alt:** 📷-Button in addBoxSection → Textarea-Paste → pendingImage → Submit (obsolet)
>
> Der alte Weg kann entfernt werden, um die addBoxSection zu verschlanken:
> - `addBoxImageBtn` (📷-Button in addBoxActions, beide Views)
> - `boxImageInputRef` (versteckter `<input type="file">`)
> - `pendingImage`-State + Vorschau-Logik in der Textbox
> - `onPaste`-Handler auf der Textarea (Clipboard-Bild-Erkennung)
>
> **Betroffene Stellen (Page.jsx) — alle im SplitViewModal:**
> - State-Deklaration `pendingImage` + `boxImageInputRef` (Zeilen ~910-919)
> - Vorschau-Block `{pendingImage && (...)}` in Sub-View + Main-View
> - Versteckter File-Input `boxImageInputRef` in Sub-View + Main-View
> - `addBoxImageBtn` (📷) in addBoxActions beider Views
> - `onPaste`-Handler auf Textarea (beide Views)
> - Branch in `handleAddBox`: `if (pendingImage) { multipart } else { json }` → vereinfachen zu reinem JSON
> - Bild-Vorschau-CSS-Klassen: `.pendingImagePreview`, `.pendingImageThumb`, `.pendingImageName`, `.pendingImageRemove`
>
> **Sub-Punkte:**
> - [ ] **C.01** — `pendingImage`-State + `boxImageInputRef` aus SplitViewModal entfernen
> - [ ] **C.02** — `onPaste`-Handler auf beiden Textareas entfernen
> - [ ] **C.03** — Vorschau-Block (`{pendingImage && ...}`) aus Sub-View + Main-View entfernen
> - [ ] **C.04** — Versteckten `<input type="file">` aus Sub-View + Main-View entfernen
> - [ ] **C.05** — `addBoxImageBtn` (📷) aus addBoxActions beider Views entfernen
> - [ ] **C.06** — `handleAddBox` vereinfachen: `if (pendingImage)`-Branch entfernen, nur JSON-Request behalten
> - [ ] **C.07** — CSS-Klassen `.pendingImagePreview`, `.pendingImageThumb`, `.pendingImageName`, `.pendingImageRemove` + `.addBoxImageBtn` aus Page.module.css entfernen
> - [ ] **C.08** — Build + Rest + Health-Check nach Cleanup
>
> **Tests:**
> - [ ] **T.01** — 🖼️-Button öffnet weiterhin ImageUploadModal (kein Regression)
> - [ ] **T.02** — Textbox ohne Bild funktioniert (JSON-Submit)
> - [ ] **T.03** — Build fehlerfrei

### #42: Jedes Element als Session-Starter

*— · 24.05.2026*

> **Quelle:** Vision-Workshop Max + Hermi (24.05.2026)
>
> Aktuell haben nur Boxen den "In Sub entwickeln"-Button. Jedes Diskussionselement soll zum Session-Starter werden können: Textboxen, Bild-Blöcke, offene Punkte in index.md. Der Prompt muss je Element-Typ unterschiedlich sein:
> - **Textbox:** Inhalt lesen → mit Max diskutieren
> - **Bild-Block:** Bild analysieren → was soll damit passieren?
> - **Offener Punkt (index.md):** Punkt verstehen → Plan vorschlagen
>
> **Sub-Punkte:**
> - [ ] **E.01** — Button-Integration für alle Element-Typen in BlocksSection (Textbox, Bild, Sub-Akkordeon)
> - [ ] **E.02** — Button für offene Punkte in renderIndexMd() / renderBlock()
> - [ ] **E.03** — Unterschiedliche Prompts je Element-Typ im Webhook-Handler
> - [ ] **E.04** — Hover-Over-Infotext für alle neuen Buttons (erklärt Ziel und Flow des Session-Starts)
> - [ ] **E.05** — Tests: Jeder Button-Typ → korrekter Prompt → Session gestartet (Rückkanal-Check)
>
> **Tests:**
> - [ ] **T.01** — Textbox-Button → Prompt enthält Box-Inhalt + "erkläre was du vor hast"
> - [ ] **T.02** — Bild-Button → Prompt enthält Bild-Referenz + Aufforderung zur Analyse
> - [ ] **T.03** — Offener-Punkt-Button → Prompt enthält Punkt-Beschreibung + Status-Kontext
> - [ ] **T.04** — Rückkanal: Session-Start liefert 204/200, Webhook erreicht Discord

### #43: Plan-Phase vor Umsetzung

*— · 24.05.2026*

> **Quelle:** Vision-Workshop Max + Hermi (24.05.2026)
>
> Jeder Session-Start soll standardmäßig **nicht** direkt umsetzen, sondern erst erklären was Hermi vorhat. Max gibt dann Go oder widerspricht. Der Plan ist Session-intern (kein DiskHub-Eintrag) — nur das Ergebnis wird dokumentiert.
>
> **Sub-Punkte:**
> - [ ] **P.01** — Webhook-Prompt um "erklären, nicht umsetzen"-Instruktion erweitern (Default-Verhalten)
> - [ ] **P.02** — Klare Erwartung an Hermi: Startprompt referenzieren + konkreten Vorschlag liefern
> - [ ] **P.03** — User gibt Go → Umsetzung startet. User widerspricht → Korrektur/Neurichtung
> - [ ] **P.04** — Tests: Rückkanal nach Plan-Phase funktioniert (Session läuft nicht ins Leere)
>
> **Tests:**
> - [ ] **T.01** — Session startet → Hermi erklärt Plan → wartet auf Go
> - [ ] **T.02** — Bei "Go" → Umsetzung läuft. Bei "Stop" → Session bricht ab
> - [ ] **T.03** — Rückkanal: Go/Stop erreicht Hermi korrekt

### #44: Prompt-Baukasten im Webhook

*— · 24.05.2026*

> **Quelle:** Vision-Workshop Max + Hermi (24.05.2026)
>
> Aktuell schiebt der Webhook die komplette README in den Prompt. Stattdessen: dynamisch aus den API-Daten bauen:
> `📋 Grundfrage + 📌 Stand + 🔜 [genau das eine Element]`
> Fallback auf volle README bei fehlender Struktur.
>
> **Hintergrund (aus Diskussion 24.05.2026):**
> - Kein separates Archiv nötig — der Prompt-Baukasten filtert erledigte Punkte raus, statt sie umzuziehen
> - `(✓ erledigt)` ist aktuell ein Hardcoded-String ohne Timestamp — keine Information "seit wann"
> - Lösung: Der Eintrag bekommt `*Erledigt: DD.MM.YYYY*` vom Skill gesetzt (nicht hardcoded, nicht geraten)
> - Der Prompt-Baukasten prüft dieses Datum: "erledigt < 3 Tage → optional erwähnen", "erledigt > 3 Tage → nur als 📚-Zahl"
> - Fallback bei fehlendem `*Erledigt:*`: Volle README laden (backward compatible)
>
> **Sub-Punkte:**
> - [ ] **B.01** — Prompt-Baukasten-Funktion in routes.py: Grundfrage (H1 + Frage), Stand (Zusammenfassung), Element-Kontext
> - [ ] **B.02** — Element-Typ-Detektion: Box vs. Bild vs. offener Punkt → unterschiedlicher Prompt-Aufbau
> - [ ] **B.03** — Fallback auf volle README wenn kein spezifisches Element referenziert wird
> - [ ] **B.04** — Statusbewusster Prompt: Erledigt-Punkte mit Datum prüfen (`*Erledigt: DD.MM.YYYY*`), nur als 📚-Zahl in den Prompt übernehmen
> - [ ] **B.05** — Alte Einträge ohne `*Erledigt:*` → Fallback auf volle README oder komplette Erwähnung
> - [ ] **B.06** — Tests: Rückkanal prüft ob Prompt-Inhalt korrekt gebaut wurde
>
> **Tests:**
> - [ ] **T.01** — Box-Referenz → Prompt enthält Box-Content + Kontext
> - [ ] **T.02** — Keine Referenz → volle README als Fallback
> - [ ] **T.03** — Rückkanal: Webhook liefert Prompt-Inhalt zur Verifikation

### #45: Auto-Rückkanal

*— · 24.05.2026*

> **Quelle:** Vision-Workshop Max + Hermi (24.05.2026)
>
> Nach erfolgreicher Umsetzung + Verifikation schreibt Hermi das Ergebnis automatisch als neuen Block an das Ende von blocks.md. Format: `### 🤖 <Kurztitel>` + Content (Zusammenfassung, Findings, Commit-Ref). Git-Commit + Push. Der Auto-Rückkanal ersetzt das manuelle Eintragen.
>
> **Sub-Punkte:**
> - [ ] **R.01** — CLI-basierte Doku: Ergebnis ans Ende von blocks.md schreiben (read_file + patch)
> - [ ] **R.02** — Format-Konvention: Prefix `🤖`, Datum im Content, Commit-Hash im Content
> - [ ] **R.03** — Git-Commit + Push nach jedem Schreibvorgang
> - [ ] **R.04** — Fehlerbehandlung: Bei Schreibfehler → Max benachrichtigen, nichts halb in blocks.md hinterlassen
> - [ ] **R.05** — Tests: Rückkanal funktioniert korrekt — Block erscheint in blocks.md, Commit auf remote
>
> **Tests:**
> - [ ] **T.01** — Nach Session: `🤖`-Block am Ende von blocks.md
> - [ ] **T.02** — Content enthält Zusammenfassung + Commit-Hash
> - [ ] **T.03** — Git-Commit + Push auf remote sichtbar
> - [ ] **T.04** — Rückkanal: Diskussion-UI zeigt neuen Block nach Reload

### #47: Session-interne Verifikation

*— · 24.05.2026*

> **Quelle:** Vision-Workshop Max + Hermi (24.05.2026)
>
> Bevor Hermi das Ergebnis dokumentiert, prüft er ob die Zielbedingung erfüllt ist:
> - **Code:** Tests, Build, Health-Check
> - **Konzept:** Rückfragen bei Unklarheiten
> - **Allgemein:** "Ziel war X → wurde X erreicht?"
> Verifikation läuft in derselben Session (kein externer Check nötig). Schützt gegen Context Rot und stellt sicher dass nur saubere Ergebnisse in DiskHub landen.
>
> **Hintergrund (aus Diskussion 24.05.2026):**
> - Verifikation und Status-Setzen gehören zusammen, sind aber zwei getrennte Schritte
> - Verifikation prüft "wurde das Ziel erreicht?" — das ist die **Entscheidung**
> - Status+Datum setzen ist die **Dokumentation** dieser Entscheidung — das macht der Skill (#46)
> - Fehlgeschlagene Verifikation → kein Status-Setzen, nur Benachrichtigung an Max
> - Erledigte Verifikation + dein "dokumentiere das" → Skill laden → Status+Datum → 🤖-Block → Commit
>
> **Sub-Punkte:**
> - [ ] **V.01** — Verifikations-Schritt als separater Schritt vor "dokumentieren" (Teil des Session-Ablaufs)
> - [ ] **V.02** — Code-Verifikation: Tests laufen lassen, Build prüfen, Health-Check aufrufen
> - [ ] **V.03** — Konzept-Verifikation: Zielbedingung aus Prompt extrahieren + mit Ergebnis abgleichen
> - [ ] **V.04** — Verifikation bestanden → Skill #46 laden → Status+Datum setzen → 🤖-Block → Commit
> - [ ] **V.05** — Verifikation fehlgeschlagen → nichts setzen, Max benachrichtigen mit Grund
> - [ ] **V.06** — Fehlerfall: Verifikation unklar (kein klares Ja/Nein) → Rückfrage an Max vor Entscheidung
> - [ ] **V.07** — Tests: Rückkanal nach Verifikation funktioniert (OK/NOK erreicht Max)

> **Tests:**
> - [ ] **T.01** — Code-Punkt: Tests grün + Build OK → Verifikation bestanden
> - [ ] **T.02** — Code-Punkt: Tests rot → Verifikation fehlgeschlagen, Max wird informiert
> - [ ] **T.03** — Konzept-Punkt: Zielbedingung erfüllt → OK
> - [ ] **T.04** — Konzept-Punkt: Unklarheit → Rückfrage an Max
> - [ ] **T.05** — Verifikation bestanden + Skill #46 geladen → Status+Datum in index.md + 🤖-Block in blocks.md
> - [ ] **T.06** — Verifikation fehlgeschlagen → kein Commit, keine Änderung an index.md/blocks.md
> - [ ] **T.07** — Rückkanal: Verifikations-Ergebnis erreicht Max korrekt

### #48: Status Single Source of Truth — Manuelle Status-Zeilen aus READMEs entfernen
*— · 24.05.2026*

> **Quelle:** Max (Diskussion #46 — Erwartungsbeschreibung Single Source of Truth für Status, 24.05.2026)
>
> Der `diskhub-doc` Skill setzt `(✓ erledigt)` korrekt auf Ebene 3 (Textbox in Sub-Diskussion). Aber die README.md-Dateien auf Ebene 2 (Sub-Diskussion) und Ebene 1 (Hauptdiskussion) enthalten noch manuelle Status-Zeilen (`**Status:** X erledigt · Y offen`). Diese sind redundant, weil `_parse_index_status()` den Status bereits automatisch aus den Textboxen zählt.
>
> **Ziel:** Status wird nur auf der tiefsten Ebene gesetzt (Ebene 3). Alle Eltern-Ebenen leiten den Status dynamisch ab — kein manuelles `**Status:**` mehr in READMEs.
>
> **Sub-Punkte:**
> - [ ] **S.01** — `_parse_index_status()` prüfen: Zählt es korrekt alle Ebenen inkl. Sub-Sub-Diskussionen?
> - [ ] **S.02** — Frontend prüfen: Wird der aggregierte Status aus `_parse_index_status()` auf Ebene 1+2 korrekt angezeigt?
> - [ ] **S.03** — Manuelle `**Status:**`-Zeilen aus README.md von Ebene 2 (offene-umbauplaene/) entfernen
> - [ ] **S.04** — Manuelle `**Status:**`-Zeilen aus README.md von Ebene 1 (diskhub-rebuild/) entfernen
> - [ ] **S.05** — Verifikation: Status-Zähler im UI stimmt nach Entfernung noch (vorher/nachher-Vergleich)
> - [ ] **S.06** — Diskussion #46-Eintrag aktualisieren: `(✓ erledigt)` im Titel bleibt, aber erklären dass auf tieferer Ebene gesetzt wird
>
> **Tests:**
> - [ ] **T.01** — Nach Entfernung: UI zeigt gleichen Status wie vorher
> - [ ] **T.02** — Neuen Punkt erledigen → Status auf Ebene 1+2 aktualisiert sich automatisch
> - [ ] **T.03** — Rückkanal: Status-Werte via API-Endpunkt sind korrekt

---

💬 **Sub-Diskussion fortsetzen**

