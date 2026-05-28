### Technische Spezifikation — DiskHub 2.0 Neubau

*— · 28.05.2026*

**Bezug:** Block #25 — Sub-Notiz als Default + Marker-Architektur
**Status:** Konzeptionell, vor der Detailplanung der ersten Phase

---

## 1. Projekt-Übersicht

| Attribut | Wert |
|----------|------|
| **Name** | `butler-diskhub-v2` |
| **Port** | `8100` (eigenständig, nicht im Dashboard) |
| **Sprache Backend** | Python 3 (Flask/FastAPI) |
| **Sprache Frontend** | offen (React mit Vite, oder SvelteKit) |
| **Datenhaltung** | Ausschließlich Dateisystem (`.md` + `.csv` + Ordner) |
| **Start** | `python3 server.py` (eigener Prozess, kein Dashboard-Loader) |
| **Registry** | Nur Dienst-Registrierung (Port 8100), keine Content-Registry |
| **Repo** | `~/repos/butler-diskhub-v2/` |

---

## 2. Dateisystem-Struktur

```
~/repos/butler-diskhub-v2/
├── server.py                    # Einstiegspunkt (Flask-App starten)
├── requirements.txt
│
├── backend/
│   ├── __init__.py
│   ├── app.py                   # Flask/FastAPI App-Factory
│   ├── parser.py                # Marker-Parser (Kernlogik)
│   ├── watcher.py               # File-Watcher (watchdog)
│   ├── router.py                # API-Routen
│   ├── templates.py             # Ordner-Templates (Tabelle, Galerie, …)
│   └── utils.py                 # Hilfsfunktionen (Slug, Sortierung, …)
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx / main.svelte
│   │   ├── App.jsx / App.svelte
│   │   ├── components/
│   │   │   ├── FileTree.svelte      # Linke Navigation
│   │   │   ├── BlockList.svelte     # Boxen-Liste (Hauptansicht)
│   │   │   ├── BlockView.svelte     # Einzelansicht eines Ordners
│   │   │   ├── QuickAdd.svelte      # Schnelleingabe oben
│   │   │   ├── Breadcrumb.svelte    # Brotkrümel
│   │   │   ├── AnchorCopy.svelte    # 🔗-Button mit Anchor-ID
│   │   │   └── TrashView.svelte     # Papierkorb-Ansicht
│   │   ├── stores/
│   │   │   ├── blocks.js            # Zustand der Block-Liste
│   │   │   ├── tree.js              # Zustand des File-Trees
│   │   │   └── settings.js          # UI-Einstellungen
│   │   └── lib/
│   │       └── api.js               # API-Client
│   └── dist/                        # Build-Output
│
└── diskhub/                         # 🔴 Daten-Ordner (benutzerdefiniert pfadbar)
    ├── .trash/                       # Papierkorb (von UI erzeugt)
    ├── thema-1/
    │   ├── readme.md                 # Zentrale .md-Datei
    │   ├── daten.csv                  # Optional: Tabellen-Daten
    │   └── assets/                   # Optional: Bilder, Anhänge
    ├── thema-2/
    │   └── readme.md
    └── thema-3/
        ├── readme.md
        └── unter-thema/              # Verschachtelung
            └── readme.md
```

**Regeln:**
- Der Daten-Ordner `diskhub/` ist konfigurierbar (Umgebungsvariable `DISKHUB_DATA_DIR`)
- Keine versteckten Metadaten-Dateien außer `.trash/` — alles andere sind echte Inhalte
- Kein `_meta.json`, keine `index.md`, kein `blocks/`-Ordner — die Hierarchie IST die Datenstruktur

---

## 3. Datei-Format (Marker-Syntax)

Jede `.md`-Datei in einem Ordner verwendet einheitliche Marker zur Selbstbeschreibung.

## Definierte Marker

| Marker | Pflicht | Beschreibung | Verwendung im UI |
|--------|---------|-------------|------------------|
| `[[Titel]]` | Ja | Überschrift des Blocks | Titelzeile, File-Tree |
| `[[Tags]]` | Nein | Komma-getrennte Tags | Filter, Batch |
| `[[Status]]` | Nein | `offen` / `erledigt` / `blockiert` | Badge, Filter |
| `[[Zusammenfassung]]` | Nein | Kurztext für Listenansicht | Box-Vorschau |
| `[[Content]]` | Nein | Hauptinhalt (Markdown) | Block-View |
| `[[Fussnote]]` | Nein | Quellenangabe | Fusszeile |

## Syntax-Varianten (final zu entscheiden)

Die Syntax wird vor Beginn der Implementierung festgelegt. Zwei Kandidaten:

- `[[Titel]]` — kürzer, keine Sonderzeichen auf deutscher Tastatur (`§` via AltGr)
- `§§§Titel§§§` — visuell markanter, schwerer zu tippen

**Entscheidung offen — wird in der Detailplanung von Phase 1 getroffen.**

## Beispiel-Datei

```markdown
[[Titel]]
Mein Block-Titel

[[Tags]]
#Status_offen, #dringend, #deadline_15.06

[[Zusammenfassung]]
Kurzbeschreibung für die Listenansicht.

[[Content]]
Hier steht der vollständige Inhalt.
Er kann **Markdown** nutzen, Listen, Codeblöcke, etc.

- Punkt 1
- Punkt 2

[[Fussnote]]
Quelle: Diskussion vom 28.05.2026
```

## Parser-Verhalten

- Marker werden **exakt** gematcht: `[[Titel]]` (case-sensitive)
- Ein Marker gilt bis zum nächsten Marker oder Dateiende
- Leere Marker (kein Inhalt bis zum nächsten) werden ignoriert
- Reihenfolge der Marker ist egal, aber **empfohlen** wie oben
- `[[Titel]]` MUSS vorhanden sein — ohne Titel ist die Datei ungültig und wird nicht gelistet
- Fehlende optionale Marker erzeugen leere Bereiche im UI (kein Fehler)
- Text zwischen Markern, der keinem Marker zugeordnet ist, wird an `[[Content]]` angehängt (Fallback für importierte Dateien ohne `[[Content]]`)

---

## 4. Parser-Spezifikation

## Modul: `backend/parser.py`

**`parse_markers(content: str) -> dict`**
- Eingabe: Rohtext einer `.md`-Datei
- Ausgabe: Dict mit Markern als Keys, Inhalt als Values
- Gibt immer ein vollständiges Dict zurück — fehlende Marker bekommen `""`
- Enthält Schlüssel: `titel`, `tags`, `status`, `zusammenfassung`, `content`, `fussnote`

**`parse_discussion_folder(folder_path: str) -> dict`**
- Scant `folder_path` rekursiv nach `.md`-Dateien
- Parst jede mit `parse_markers()`
- Erkennt Unterordner → ruft sich rekursiv auf (max_depth: konfigurierbar, Default 5)
- Typ-Erkennung aus Dateikombination im Ordner:
  - Nur `readme.md` + optional `assets/` → `type: "text"`
  - `readme.md` + `*.csv` → `type: "table"`
  - `readme.md` + Unterordner → `type: "container"`
- Gibt einen Baum zurück: `{ name, slug, type, markers, children[], assets[] }`

**`get_marker_ids(markers: dict) -> dict`**
- Generiert zu jedem Marker einen Anchor-ID: `"Titel"` → `"#titel"`
- `"Fussnote"` → `"#fussnote"`
- lowercased, alphanumerisch, Leerzeichen → Bindestrich

## Backward Compatibility (zu Vision #25)

Der Neubau **hat keine Legacy-Unterstützung**. Das alte DiskHub-Format (`### Titel` + `**Problem**/**Lösung**/**Status**`) wird nicht erkannt. Wer alte Inhalte importieren will, muss sie per Script konvertieren. Der Neubau startet sauber.

---

## 5. Backend-Architektur

## Technologie-Stack (Vorschlag)

| Komponente | Wahl | Begründung |
|-----------|------|-----------|
| Framework | **Flask** | Im Butler-Ökosystem etabliert, leichtgewichtig |
| File-Watcher | **watchdog** (Python) | Zuverlässig, Cross-Plattform, Events auf Ordner-Ebene |
| Hintergrund-Tasks | **APScheduler** | File-Watcher-Events, Trash-Cleanup |
| Server | **waitress** oder Flask dev | Production waitress, Dev = Flask built-in |

## Module

**`app.py`** — App-Factory
- Initialisiert Flask-App
- Startet File-Watcher (eigenen Thread)
- Registriert API-Blueprint
- Startet Trash-Cleanup-Scheduler (1×/Tag)

**`watcher.py`** — File-Watcher
- Überwacht `diskhub/` auf Änderungen (create, delete, modify, move)
- Events werden in eine interne Queue geschrieben
- Frontend pollt `/api/changes` oder nutzt SSE/WebSocket für Live-Updates
- Debounce: 500ms Puffer bei aufeinanderfolgenden Events

**`router.py`** — API-Routen

| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/api/block` | Liste aller Blöcke (Baum aus `diskhub/`) |
| GET | `/api/block/<path:slug>` | Ein Block mit vollständigem Inhalt |
| GET | `/api/block/<path:slug>#<anchor>` | Ein Marker-Abschnitt eines Blocks |
| POST | `/api/block` | Neuen Block anlegen (Ordner + readme.md via Template) |
| PUT | `/api/block/<path:slug>` | Block-Inhalt updaten (readme.md überschreiben) |
| DELETE | `/api/block/<path:slug>` | Block löschen (→ `.trash/`) |
| POST | `/api/block/<path:slug>/move` | Block verschieben (neuer Pfad im Body) |
| POST | `/api/batch` | Batch-Operation (mehrere Blöcke) |
| GET | `/api/changes` | Änderungs-Queue seit letztem Poll (Long-Polling) |
| GET | `/api/trash` | Liste der gelöschten Elemente |
| POST | `/api/trash/<id>/restore` | Aus Papierkorb wiederherstellen |
| DELETE | `/api/trash/<id>` | Endgültig löschen |

## API-Details

**GET `/api/block?type=text|table|container`** — optionaler Filter
**GET `/api/block?status=offen|erledigt|blockiert`** — optionaler Status-Filter
**GET `/api/block?tag=dringend`** — Tag-Filter (erfordert Parser-Index)

**POST `/api/block`** — Body:
```json
{
  "title": "Mein neues Thema",
  "type": "text",
  "parent": null,
  "content": "Optionaler Inhalt..."
}
```
Erzeugt: `diskhub/mein-neues-thema/readme.md` mit `[[Titel]]`, `[[Content]]`, und Default-Tags.

**POST `/api/batch`** — Body:
```json
{
  "paths": ["thema-1", "thema-2/unter-thema"],
  "action": "delete" | "tag" | "status",
  "value": "erledigt"
}
```

---

## 6. Frontend-Architektur

## Routing

Eigener Router (nicht Dashboard-abhängig):

| Route | Komponente | Beschreibung |
|-------|-----------|-------------|
| `/` | `BlockList` | Hauptansicht: alle Blöcke als Liste + File-Tree links |
| `/block/<slug>` | `BlockView` | Einzelansicht (Inline für einfache, Vollbild für komplexe) |
| `/block/<slug>#<anchor>` | `BlockView` (scroll) | Gezielter Anchor |
| `/trash` | `TrashView` | Papierkorb |

## Komponenten (grob)

**`App.svelte`** — Root
- Layout: Split-Ansicht (Tree | Content)
- Toggle für Tree-Sichtbarkeit
- Router

**`FileTree.svelte`** — Linke Spalte
- Rekursiver aufklappbarer Baum
- Drag & Drop (native HTML5 Drag API)
- Kontextmenü: Neu, Löschen, Umbenennen
- Marker: Status-Badge, Typ-Icon
- Anchor-Level: Abschnitte als Tree-Leaves (─ Toc ─ Zusammenfassung ─ Content)

**`BlockList.svelte`** — Hauptinhalt (Root-Ansicht)
- Liste aller Top-Level-Ordner
- Jeder Eintrag: Titel, Zusammenfassung, Status-Badge, Tags, 🔗, ⬜/✅-Toggle
- Klick auf Titel → navigiert zu `/block/<slug>`
- Checkboxen für Batch-Aktionen
- Quick-Add-Input oben

**`BlockView.svelte`** — Einzelansicht
- Breadcrumb (`DiskHub › thema › unter-thema`)
- Bei `type: "text"`: gerenderter `[[Content]]`
- Bei `type: "table"`: gerenderte CSV-Tabelle
- Bei `type: "container"`: Unter-Blöcke als Liste
- Jeder Marker-Abschnitt hat einen Anchor-Link (🔗)
- Edit-Button macht `[[Content]]` editierbar (Textarea)
- Live-Vorschau nebendran

---

## 7. Datenfluss

```
Dateisystem-Änderung (cp, mv, rm, git push)
        │
        ▼
  watchdog (watcher.py)
        │ Event: created / deleted / modified / moved
        ▼
  Event Queue (in-memory, debounced 500ms)
        │
        ├──→ SSE / WebSocket → Frontend (sofortige UI-Aktualisierung)
        │
        └──→ API: GET /api/block → liest aktuellen Dateibaum
                 │ marker parser (parser.py)
                 ▼
              JSON-Baum (slug, type, markers, children)
                 │
                 ▼
              Frontend rendert (File-Tree + Block-List / Block-View)
```

**Schreib-Pfad:**
```
Frontend: POST /api/block (edit / create / move)
        │
        ▼
  Backend: Schreibt .md-Datei auf Disk
        │
        ▼
  watchdog-Event → Queue → SSE an ALLE offenen Frontend-Clients
```

---

## 8. Registry-Integration

Neu in der Butler-Registry (8025):
```json
{
  "name": "diskhub-v2",
  "port": 8100,
  "type": "service",
  "status": "active",
  "route": "/",
  "has_backend": false,
  "description": "DiskHub 2.0 — Ordner-basiertes Content-Management",
  "tags": ["diskhub", "content", "notizen"]
}
```

Das Dashboard (8090) bekommt einen Link: "DiskHub 2.0 → http://192.168.178.62:8100"
(Öffnet in neuem Tab, kein iframe — eigener Port, eigene Seite.)

---

## 9. Abgleich mit Vision #25

## Zielbedingungen A–M — wie die Spec sie abdeckt

| Ziel | Abgedeckt in Spec |
|------|-------------------|
| **A** Ordner als Einheit | Abschnitt 2: Dateisystem-Struktur |
| **B** Marker-Parser | Abschnitt 3 + 4: Marker-Syntax + Parser |
| **C** Externer Import | Abschnitt 4: `parse_discussion_folder()` erkennt neue Ordner automatisch |
| **D** UI-Verhalten | Abschnitt 6: Inline-Ansicht für einfache Ordner, Vollbild für komplexe |
| **E** Verschieben ohne Bruch | Abschnitt 7: POST /api/block/.../move + Slug-Konvention |
| **F** Migration | Abschnitt 4: Kein Legacy-Support, Neubau steht für sich |
| **G** Templates | Abschnitt 5: `POST /api/block` mit `type`-Feld |
| **H** Drag & Drop | Abschnitt 6: FileTree.svelte mit HTML5 Drag API |
| **I** Breadcrumb | Abschnitt 6: BlockView.svelte |
| **J** Batch | Abschnitt 5: `POST /api/batch` |
| **K** Split-View | Abschnitt 6: App.svelte Layout |
| **L** Trash | Abschnitt 5: `.trash/` + API-Endpunkte |
| **M** Anchor-IDs | Abschnitt 4 + 5: `get_marker_ids()`, `#<anchor>` in API + Frontend-Routing |

---

## 10. Offene Entscheidungen (vor Phase 1 zu klären)

1. **Marker-Syntax:** `[[Marker]]` vs `§§§Marker§§§`
2. **Frontend-Framework:** React + Vite (Dashboard-kompatibel) vs SvelteKit (leichter, weniger Code)
3. **Live-Update-Mechanismus:** SSE (einfach) vs WebSocket (bidirektional)
4. **Port final:** 8100 bestätigen (kein Kollisionsrisiko)
5. **Daten-Ordner-Pfad:** Relativ zu `~/repos/butler-diskhub-v2/diskhub/` oder konfigurierbar (`~/data/diskhub-v2/`)?

---

## 11. Nächste Schritte (Phase 1 — MVP)

1. Marker-Syntax final entscheiden
2. Repo erstellen + Grundstruktur
3. `parser.py` schreiben + Tests
4. `router.py` schreiben (GET /api/block, POST /api/block)
5. Minimal-Frontend (Blockliste + Einzelansicht)
6. File-Watcher als Background-Thread
7. Verifikation: 3 Ordner manuell anlegen → UI zeigt sie korrekt an
8. Registry-Eintrag + Dashboard-Link

**Status**
🔜 offen