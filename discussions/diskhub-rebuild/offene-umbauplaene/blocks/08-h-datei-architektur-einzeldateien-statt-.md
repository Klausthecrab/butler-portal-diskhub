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
|- [x] **M.01** — Script schreiben: `scripts/split-collection-files.py`
  - Liest `blocks.md`, findet alle `### `-Headings
  - Pro Block: Dateiname aus Heading-Titel generieren (`NN-slug.md`)
  - Block-Inhalt in Datei schreiben (inkl. `### `-Header)
  - Wenn Datei bereits existiert (Kollision): `NN-slug-2.md`
|- [x] **M.02** — Sortierung via `NN` aus bestehender Reihenfolge in blocks.md
|- [x] **M.03** — Gleiches Script für `index.md`: `/index/punkt-<slug>.md`
  - Erledigt-Einträge und Stubs (#D) landen ebenfalls in Einzeldateien
|- [x] **M.04** — Nur für Haupt-Diskussionen + Sub-Diskussionen, die `blocks.md` oder `index.md` haben
|- [x] **M.05** — Nach erfolgreicher Migration: `blocks.md` und `index.md` löschen (mit `trash`, nicht `rm`)
|- [x] **M.06** — Git-Commit: `disc: #H — migration: blocks.md + index.md in Einzeldateien`
|- [x] **M.07** — Manuelle Verifikation: Diskussion im Dashboard öffnen → gleiche Blöcke + gleiches TOC
|- [x] **M.08** — 🔗-Referenzen in anderen Diskussionen geprüft und bereinigt (Phase 4 F.02 + M.08 Cleanup — Mai 2026)

---

## Phase 4 — Frontend: 🔗-Format umstellen

Ziel: 🔗-Button kopiert stabile Pfad-Referenzen statt `box-<nr>` und `entry-<nr>`.

|- [x] **F.01** — `copyBoxLink()` akzeptiert optional `file_name`: Wenn vorhanden → `diskussion/blocks/<file_name>`, Fallback auf `diskussion > box-<nr>` für Diskussionen ohne blocks/-Ordner (✅ Phase 4)
|- [x] **F.02** — Index.md-Einträge: `diskussion/index/<file_name>` statt `diskussion > entry-<nr>`, Fallback auf altes Format für Diskussionen ohne index/-Ordner (✅ Phase 4)
|- [x] **F.03** — Sub-Diskussionen: `diskussion/sub-slug` (keine Änderung nötig — Pfad-Format war hier schon korrekt)
|- [x] **F.04** — Datei-Kollision: Kollisionsschutz via `-2`, `-3`-Suffix im Migration-Script (`find_nn_slug_path()`) und Backend `add_box()` (Mai 2026) — Backend nachgerüstet
|- [x] **F.05** — Build: `npm run build` → fehlerfrei (Phase 4, 24.05.2026 — Build läuft seitdem)

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
