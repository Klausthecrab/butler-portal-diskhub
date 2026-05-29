### Obsidian statt Eigenbau — Plan für DiskHub v2 auf Basis von Syncthing + Obsidian

*— · 29.05.2026*

**Problem**
DiskHub v2 wurde als Eigenbau konzipiert (Marker-Parser, eigener Port 8100, SvelteKit/React-Frontend). Kazzle stellt die Frage ob es sinnvoller ist, auf etablierte Tools zu setzen: Obsidian (Content-Management) + Syncthing (Sync) + minimalem Web-Renderer (optional). Die ursprüngliche Spec umfasst ~386 Zeilen und 13 Zielbedingungen — ein Großteil davon wäre durch Obsidian nativ abgedeckt.

**Lösung**
Pivot von "alles Eigenbau" zu "Obsidian + Syncthing + Hermi schreibt YAML-Frontmatter". Der Butler bekommt Syncthing, Hermi schreibt `.md`-Dateien mit YAML-Frontmatter direkt auf Disk, Syncthing spiegelt sie in Echtzeit auf Kazzles Windows-Rechner, wo Obsidian nativ läuft. Schrittweise: erst Basis (Sync + Obsidian), dann Verfeinerung (Plugins, Web-UI, Prompt-Buttons).

---

## Wichtige Erkenntnis — Butler ist headless

Der Butler hat keine Desktop-Umgebung (`$DISPLAY` leer). **Obsidian (Electron) kann dort nicht laufen.** Das ist kein Problem — es ändert nur die Architektur:

```
Hermi schreibt .md mit YAML-Frontmatter
        │
        ▼
Butler-Disk (~/obsidian-vaults/diskhub/)
        │
        ▼
Syncthing (Echtzeit-Sync, LAN)
        │
        ▼
Windows-Rechner (Kazzle)
        │
        ▼
Obsidian Desktop (volle UI)
```

Obsidian wird **nicht** auf dem Butler installiert sondern NUR auf Windows. Der Butler hat Syncthing + Hermi. Windows hat Syncthing + Obsidian.

---

## Schritt 1: Syncthing aufsetzen + Vault-Struktur

### Auf Butler (Linux):
```bash
sudo apt install syncthing
systemctl --user enable syncthing
systemctl --user start syncthing
```
→ Syncthing läuft als Service, Web-UI auf `http://192.168.178.62:8384`
→ Vault-Verzeichnis: `~/obsidian-vaults/diskhub/` (wird von Hermi automatisch angelegt)

### Auf Windows:
- Installer von syncthing.net → next-next-finish
- Web-UI öffnet sich → Device-ID kopieren
- Auf Butler im Web-UI "Remote Device hinzufügen" → Windows-ID eintragen
- Auf Windows "Remote Device hinzufügen" → Butler-ID eintragen
- Ordner freigeben: Windows zeigt auf `C:\Users\...\Obsidian Vaults\diskhub\`

**Hürden:**
- Port 22000 muss im LAN erlaubt sein (Windows-Firewall fragt einmal)
- Vault muss auf beiden Seiten LEER sein beim ersten Verbinden (sonst Conflict)
- **Wichtig:** `.stignore` für Syncthing anlegen — Systemdateien ausklammern (siehe unten)

### Vault-Struktur (Vorschlag):

```
~/obsidian-vaults/diskhub/          ← Wurzel des Vaults
├── .obsidian/                      ← Obsidian-Konfiguration (automatisch)
├── .stignore                       ← Syncthing ignore rules
├── thema-1/
│   ├── readme.md                   ← Jeder Ordner = Thema, readme.md = Inhalt
│   └── assets/
├── thema-2/
│   ├── readme.md
│   ├── daten.csv                   ← YAML sagt `type: table`, UI rendert Tabelle
│   └── assets/
├── aktuelle-notiz.md               ← Flache Notizen möglich (Obsidian-Stil)
└── .trash/                         ← Papierkorb
```

**Regel:** Hermi erzeugt Ordner + `readme.md` (wie DiskHub v2 Konzept). Kazzle kann flache Notizen dazwischen mischen — Obsidian versteht beides.

---

## Schritt 2: YAML-Frontmatter Konvention (für Hermi & Kazzle)

Das ist die Antwort auf Kazzles Block 22 ("Ki-robuste Rahmen"):

```markdown
---
title: Thema-Titel
status: offen
tags: [diskhub-v2, dringend]
type: text
created: 2026-05-29
updated: 2026-05-29
---

## Content

Hier steht der Hauptinhalt in Markdown.

### Unterabschnitt

Mehr Inhalt. `##`-Headings für interne Gliederung.
```

**Felder:**

| Feld | Pflicht | Werte | UI in Obsidian |
|------|---------|-------|---------------|
| `title` | Ja | Freitext | Dateititel in der List |
| `status` | Ja | `offen` / `erledigt` / `blockiert` | Badge, Dataview-Filter |
| `tags` | Nein | Array von Strings | Tag-Pane, Graph |
| `type` | Nein | `text` / `table` / `gallery` | Für späteren Web-UI-Renderer |
| `created` | Ja | `YYYY-MM-DD` | Sortierung, Timeline |
| `updated` | Ja | `YYYY-MM-DD` | Änderungsnachverfolgung |

**Vorteil gegenüber DiskHub-Markern (`§§§Titel§§§`):**
- YAML ist ein Standard — kein Eigenbau-Parser nötig
- Obsidian Properties Panel zeigt Felder als UI-Formular (Dropdown für Status!)
- Dataview Plugin kann SQL-ähnliche Queries auf YAML-Felder
- Kein Halluzinieren: `status: verifiziert` wird von YAML als einfacher String gelesen, vom Parser aber nicht als gültiger Wert erkannt → Kazzle sieht sofort dass was falsch ist

---

## Schritt 3: Plugins auf Windows (optional, aber empfohlen)

| Plugin | Zweck | Wann |
|--------|-------|------|
| **Dataview** | Queries über YAML-Felder ("zeig mir alle offenen Notizen") | Sofort |
| **Templater** | Vorlagen für neue Notizen (automatisch YAML-Frontmatter) | Schritt 2 |
| **QuickAdd** | Capture-Buttons für Hermi-Prompt + Pfad | Schritt 3 |
| **Advanced URI** | `obsidian://advanced-uri?...` für Deep-Links | Schritt 3 |
| **Local REST API** | HTTP-API für Hermi (Alternative zu direktem Disk-Schreiben) | Schritt 4 |

---

## Schritt 4: Direkte Prompt-Buttons (Makros)

Wenn Kazzle erste Erfahrungen mit Obsidian hat, bauen wir Makro-Buttons die:

1. Den Pfad der aktuellen Note kopieren (QuickAdd Capture)
2. Einen Standard-Prompt anhängen: "Hermi, checke diese Notiz und antworte in Discord"
3. Fertigen Text in Zwischenablage

**Technisch:** QuickAdd Plugin → Capture Template → `[{{title}}](obsidian://advanced-uri?vault=diskhub&filepath={{filepath}})` + Prompt-Text.

---

## Schritt 5: Optionales Web-UI (später)

Falls Kazzle doch einen Browser-Zugriff will:
- Minimaler Flask-Server (~200 Zeilen)
- Liest `diskhub/`-Ordner, parst YAML-Frontmatter, rendert als HTML
- Kein Parser-Bau, kein Frontend-Framework nötig
- Ist ein "Nice to have", nicht der Kern

---

## Hürden-Check

| Hürde | Schwere | Lösung |
|-------|---------|--------|
| Butler hat kein Display | ❌ Keine | Obsidian läuft nicht auf Butler — nur auf Windows. Syncthing überbrückt |
| Hermi muss YAML lernen | 🟡 Gering | Neues Skill `obsidian-vault-workflow` schreiben |
| Konflikt bei gleichzeitigem Edit | 🟡 Gering | Syncthing behält beide Versionen als `.sync-conflict-*.md` |
| Obsidian kennt keine festen Status-Werte | 🟡 Mittel | YAML sagt `status: offen`, aber Obsidian erlaubt jeden String. Lösung: Dataview + Template + ggf. Obsidian "Properties" Plugin-Type-Constraint |
| Verlust der 🔗-Referenzen aus altem DiskHub | 🟡 Migration | Alte DiskHub-Inhalte bleiben im Dashboard (8090). Neuer Vault startet frisch — wie in der Spec geplant |
| Syncthing muss auch bei Butler-Neustart laufen | ✅ Gelöst | `systemctl --user enable syncthing` |

---

## Empfohlene Reihenfolge

**Phase 1 — Basis (heute):**
1. Syncthing auf Butler installieren + starten
2. Max auf Windows guiden: Obsidian installieren + Syncthing installieren + Vault verbinden
3. Erste `.md`-Datei von Hermi schreiben → testen ob sie auf Windows ankommt
4. Kazzle macht sich mit Obsidian vertraut (kein Druck)

**Phase 2 — Produktivität (nach 1-2 Tagen):**
1. Dataview + Templater + QuickAdd Plugins installieren
2. Template für neue Notizen (YAML-Frontmatter vorausgefüllt)
3. Prompt-Button bauen (QuickAdd Capture)
4. Hermi-Skill schreiben: `obsidian-vault-workflow` (YAML-Konvention, Pfade, API)

**Phase 3 — Erweitern (nach Bedarf):**
1. Web-UI bauen (minimal, nur lesend)
2. Local REST API Plugin testen (Hermi schreibt via HTTP statt direkt)
3. Alte DiskHub-Inhalte migrieren (Batch-Script .md → YAML-Frontmatter)

---

## Verhältnis zur alten DiskHub v2 Spec

| Zielbedingung | Obsidian + Syncthing | Status |
|---------------|---------------------|--------|
| A — Ordner als Einheit | ✅ Ordner = Thema, readme.md = Inhalt | nativ |
| B — Strukturierte Felder | ✅ YAML Frontmatter statt Marker | besser als Eigenbau |
| C — Externer Import | ✅ `cp -r` → Syncthing → Obsidian | nativ |
| D — UI-Verhalten | ✅ Obsidian Desktop | besser als Web-UI |
| E — Verschieben ohne Bruch | 🟡 `[[Wikilinks]]` passen sich an, `obsidian://`-URIs nicht | Plugin benötigt |
| F — Migration | ✅ Neuanfang, wie geplant | kein Konflikt |
| G — Templates | ✅ Templater Plugin | besser als Eigenbau |
| H — Drag & Drop | ✅ Nativ im Explorer | nativ |
| I — Breadcrumb | ✅ Explorer + Backlinks | nativ |
| J — Batch | ✅ Dataview + QuickAdd | anders, aber da |
| K — Split-View | ✅ Explorer-Panel (links) + Editor (rechts) | nativ |
| L — Papierkorb | ✅ `.trash/` Ordner | nativ |
| M — Anchor-IDs | ✅ `# Überschrift` | nativ |

**Einziger Verlust gegenüber Spec:** Kein Web-UI (optional nachrüstbar) und keine LIVE-API für Agents (Hermi schreibt direkt auf Disk, das reicht für den Use-Case).

---

**Ausstehend für Phase 1 Start:** 
- Max installiert Obsidian auf Windows
- Max installiert Syncthing auf Windows
- Ich installiere Syncthing auf Butler
- Gemeinsamer erster Sync-Test

**Status**
🔜 offen