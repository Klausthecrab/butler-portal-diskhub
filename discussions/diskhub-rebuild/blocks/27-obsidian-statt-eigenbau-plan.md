### Obsidian statt Eigenbau — Plan für DiskHub v2 auf Basis von Syncthing + Obsidian

*— · 29.05.2026 · Aktualisiert: 29.05.2026*

**Problem**
DiskHub v2 wurde als Eigenbau konzipiert (Marker-Parser, eigener Port 8100, SvelteKit/React-Frontend). Kazzle stellt die Frage ob es sinnvoller ist, auf etablierte Tools zu setzen: Obsidian (Content-Management) + Syncthing (Sync). Die Spec umfasst ~386 Zeilen und 13 Zielbedingungen — ein Großteil davon wäre durch Obsidian nativ abgedeckt.

**Lösung**
Pivot: Obsidian + Syncthing + Hermi schreibt YAML-Frontmatter. Der Butler hat Syncthing + Hermi. Hermi schreibt `.md`-Dateien mit YAML-Frontmatter direkt auf Disk. Syncthing spiegelt sie in Echtzeit nach Windows. **Kazzle installiert Obsidian NUR auf Windows** — der Butler hat kein Display, braucht aber auch kein Obsidian. Hermi arbeitet direkt auf Datei-Ebene.

**Zielbedingung für Phase 1:** Kazzle sagt "lege mal eine Note in Obsidian an" → Hermi erzeugt `.md` mit YAML-Frontmatter → Syncthing syncpt → Kazzle sieht die Note in Obsidian auf Windows.

---

## Architektur (geklärt)

```
Hermi (Butler) → schreibt .md mit YAML-Frontmatter
      │
      ▼
Butler-Disk: ~/obsidian-vaults/diskhub/
      │
      ▼
Syncthing (Echtzeit, LAN, Port 22000)
      │
      ▼
Windows (Kazzles Arbeitsrechner)
      │
      ▼
Obsidian Desktop (reiner Viewer, keine "Steuerung" von Hermi)
```

**Wichtig:** Obsidian ist ein besserer Viewer für die Struktur, die eh durch das Dateisystem abgebildet wird. Hermi braucht Obsidian nicht — Hermi checkt Hierarchie über Dateipfade (`thema/unterthema/readme.md`) + YAML-Tags (`parent: thema`). Obsidian ist NUR für Kazzle da.

---

## Phase 1 — Drei Schritte bis zur Zielbedingung

### Step 1.1: Windows Installation guiden (Kazzle macht, Hermi erklärt)

1. **Obsidian auf Windows installieren**
   - [obsidian.md](https://obsidian.md) → Download → Installer ausführen
   - Beim ersten Start: "Vault öffnen" → Lokaler Ordner → `C:\Users\...\Obsidian Vaults\diskhub\`
   - Ordner anlegen (muss leer sein für den ersten Sync)

2. **Syncthing auf Windows installieren**
   - [syncthing.net](https://syncthing.net) → Windows Download → Installer
   - Nach Installation: Web-UI öffnet sich im Browser (localhost:8384)
   - **Wichtig:** Windows-Firewall erlauben (Port 22000)

3. **Butler-Seite (Hermi macht das)**
   - `sudo apt install syncthing` + Service aktivieren
   - Syncthing läuft, Web-UI auf `http://192.168.178.62:8384`
   - Vault-Verzeichnis: `~/obsidian-vaults/diskhub/` (wird automatisch angelegt)

4. **Verbindung herstellen**
   - Windows: Web-UI → Device-ID kopieren
   - Butler: Web-UI (von Windows-Browser aufrufen) → "Remote Device" → Windows-ID eintragen
   - Windows: "Remote Device" → Butler-ID eintragen
   - Beide Seiten bestätigen die Verbindung

**Hürden:**
- Windows-Firewall fragt einmal → "Erlauben" klicken
- Vault-Ordner muss auf BEIDEN Seiten leer sein vor erstem Verbinden (sonst Konflikte)
- Falls Butler hinter FritzBox: UPnP ist standardmäßig an, reicht für LAN. Kein Port-Forwarding nötig

---

### Step 1.2: Sync herstellen (gemeinsam)

1. Butler und Windows haben sich im Syncthing-Web-UI "gesehen" → Status zeigt "Connected"
2. Ordner freigeben: Butler zeigt auf `~/obsidian-vaults/diskhub/` → Windows zeigt auf `C:\Users\...\Obsidian Vaults\diskhub\`
3. Ordner-Typ: "Send & Receive" (bidirektional)
4. **`.stignore` auf dem Butler anlegen** — Syncthing ignoriert Systemdateien:

```gitignore
# .stignore — für ~/obsidian-vaults/diskhub/
.obsidian/
*.tmp
.DS_Store
Thumbs.db
```

5. Erster Sync: Keine Dateien da beidseitig leer → Verbindung steht, Status "Up to Date"

✅ **Erfolgskriterium:** Beide Geräte zeigen im Web-UI "Syncthing is running", Ordner-Status "Up to Date", letzter Verbindungserfolg < 1 Minute.

---

### Step 1.3: Hermi-Skill entwickeln + Test (Hermi macht)

1. **Hermi erzeugt Test-Note** (`~/obsidian-vaults/diskhub/test-sync/readme.md`):

```markdown
---
title: Test-Sync
status: offen
tags: [test, sync]
created: 2026-05-29
updated: 2026-05-29
---

## Content

Hey Kazzle — wenn du das hier in Obsidian siehst, funktioniert der Sync.
```

2. **Syncthing syncpt** → Datei erscheint in `C:\Users\...\Obsidian Vaults\diskhub\test-sync\readme.md`

3. **Kazzle öffnet Obsidian** → Vault "diskhub" → siehst "test-sync" im Explorer → klickst rein → Content sichtbar

4. **Kazzle sagt Bescheid** (Discord/Telegram)

5. **Hermi schreibt Hermi-Skill** (`obsidian-vault-workflow`) — definiert:
   - YAML-Frontmatter-Struktur (Pflichtfelder, erlaubte Werte)
   - Ordner-Konvention: `thema/readme.md` oder `thema/unterthema/readme.md`
   - Tags für hierarchische Adressierung: `tags: [project/..., parent/...]`
   - Pfad zu `~/obsidian-vaults/diskhub/` als Vault-Wurzel

6. **Zweiter Test:** Kazzle sagt "lege eine echte Note an" → Hermi nutzt das neue Skill → Note kommt in Obsidian an

✅ **Zielbedingung erreicht:** Hermi legt auf Kommando eine Obsidian-Note an. Kazzle sieht sie in Obsidian auf Windows. System steht.

---

## Phase 2 — Produktivität (nach 1-2 Tagen, wenn Kazzle bereit)

1. **Obsidian Plugins auf Windows installieren:**
   - Dataview (Queries über Status/Tags)
   - Templater (Vorlagen für neue Notizen)
   - QuickAdd (Prompt-Buttons)

2. **Templater-Template:** Neue Notiz → automatisch YAML-Frontmatter mit `title`, `created`, `status: offen`

3. **Prompt-Button (QuickAdd Capture):**
   - Ein Button in Obsidian
   - Kopiert: `[[Pfad zur Note]]` + "Hermi, checke diese Notiz"
   - Kazzle wechselt zu Discord, fügt ein, schickts an Hermi

4. **Hermi-Skill verfeinern:** Batch-Operationen, Tag-Vorschläge, automatische `parent:`-Erkennung

---

## Phase 3 — Erweitern (optional, nach Bedarf)

1. **Minimales Web-UI** (~200 Zeilen Flask): Liest Vault-Ordner, parst YAML, rendert als HTML
2. **Local REST API Plugin** testen: Hermi schreibt via HTTP statt direkt auf Disk
3. **Alte DiskHub-Inhalte migrieren:** Batch-Script wandelt `### Titel` + `**Problem**/**Lösung**` → YAML-Frontmatter um

---

## YAML-Frontmatter Konvention (Referenz)

```markdown
---
title: Thema-Titel
status: offen           # offen | erledigt | blockiert
tags: [project/diskhub-vault, parent/thema-uebergeordnet]
type: text              # text | table | gallery
created: 2026-05-29     # YYYY-MM-DD
updated: 2026-05-29     # YYYY-MM-DD
---

## Content

Hier steht der Hauptinhalt.
```

| Feld | Pflicht | Werte |
|------|---------|-------|
| `title` | Ja | Freitext |
| `status` | Ja | `offen` / `erledigt` / `blockiert` |
| `tags` | Nein | Array, Konvention: `project/...`, `parent/...` |
| `type` | Nein | `text` / `table` / `gallery` |
| `created` | Ja | `YYYY-MM-DD` |
| `updated` | Ja | `YYYY-MM-DD` |

---

## Hürden-Check (Stand 29.05.2026)

| Hürde | Schwere | Status |
|-------|---------|--------|
| Butler hat kein Display → kein Obsidian | ❌ Kein Problem | Syncthing + Windows-only löst es. Hermi braucht kein Obsidian |
| Hermi muss YAML statt `**Problem**/**Lösung**` schreiben | 🟡 Gering | Skill `obsidian-vault-workflow` wird in Step 1.3 gebaut |
| Windows-Firewall blockt Syncthing-Port 22000 | 🟡 Einmalig | Ein Klick "Erlauben" beim ersten Start |
| Sync-Konflikte bei parallelen Edits | 🟡 Selten | Syncthing behält beide Versionen als `.sync-conflict-*.md` |
| YAML erlaubt jeden String → kein "echter" Enum-Zwang | 🟡 Mittel | Lösung: Template + ab Phase 2 ggf. Obsidian Properties-Type-Constraint |
| Alte 🔗-Referenzen aus DiskHub v1 brechen | 🟡 Migration | War im Neubau-Konzept eh so geplant. Alter DiskHub bleibt auf 8090 |
| Syncthing muss Butler-Neustart überleben | ✅ Gelöst | `systemctl --user enable syncthing` |

---

## Verhältnis zur alten DiskHub v2 Spec (13 Zielbedingungen)

| Ziel | Obsidian + Syncthing | Status |
|------|---------------------|--------|
| A — Ordner als Einheit | ✅ Ordner = Thema, `readme.md` = Inhalt | nativ |
| B — Strukturierte Felder | ✅ YAML Frontmatter | besser als Eigenbau |
| C — Externer Import | ✅ `cp -r` → Syncthing → Obsidian | nativ |
| D — UI-Verhalten | ✅ Obsidian Desktop | besser als Web-UI |
| E — Verschieben ohne Bruch | 🟡 `[[Wikilinks]]` stabil, `obsidian://`-URIs nicht | Plugin später |
| F — Migration | ✅ Neuanfang | kein Konflikt |
| G — Templates | ✅ Templater Plugin | besser als Eigenbau |
| H — Drag & Drop | ✅ Nativ im Explorer | nativ |
| I — Breadcrumb | ✅ Explorer + Backlinks | nativ |
| J — Batch | ✅ Dataview + QuickAdd | anders, aber da |
| K — Split-View | ✅ Explorer links, Editor rechts | nativ |
| L — Papierkorb | ✅ `.trash/` Ordner | nativ |
| M — Anchor-IDs | ✅ `# Überschrift` | nativ |

**Status**
🔜 offen — Phase 1 steht, wartet auf Kazzles "go" für Step 1.1