### Phase 3 — Migration zu Einzeldateien (#H) (✓ erledigt)
*— · 24.05.2026*

## Entscheidung: Phase 3 + Frontend-C.05 in einem Durchgang

**Datum:** 24.05.2026
**Autor:** Hermi

## Problem
Nach Phase-3-Migration wird blocks.md gelöscht. Das Frontend sendete aber noch `block_index` statt `file_name` (C.05 war ausstehend). Edit/Delete wären für migrierte Diskussionen kaputt.

## Ansatz
Phase 3 (Migration-Script) + C.05 (Frontend sendet file_name) in einem Durchgang implementiert. Dadurch:
- Migration erstellt Einzeldateien aus blocks.md + index.md
- Frontend sendet `file_name` bei Edit/Delete
- Backend-Fallback auf `block_index` bleibt für Diskussionen ohne Migration
- `edit-index-title`-Endpoint auf index/-Ordner umgestellt

## Script: scripts/split-collection-files.py
- Liest ###-Header aus Sammeldateien → Einzeldateien unter blocks/ und index/
- NN = Position in Datei (00, 01, ...), Slug aus Titel
- Kollisionsschutz via -2, -3-Suffix
- Trash statt rm für Sammeldateien
- Eingebaute Verifikation (NN-Format, Datei-Anzahl, exists-Checks)

## Migration ausgeführt
**Ziel:** diskhub-rebuild/offene-umbauplaene + 12 Sub-Diskussionen

| Metrik | Wert |
|--------|------|
| Textbox-Dateien | 27 → blocks/00-* bis 26-* |
| Index-Dateien | 48 → index/00-* bis 47-* |
| Sammeldateien getrasht | 6 (blocks.md + index.md) |
| Sub-Diskussionen migriert | 01-datei-struktur, 02-ui-struktur, 05–07 |
| Subs ohne ###-Header | Übersprungen (08–12 hatten keine Blöcke) |

## Verifikation (7-Punkte-Plan + Erweiterungen)

| # | Check | Status |
|---|-------|--------|
| 1 | `blocks/` existiert mit 27 .md-Dateien, sortiert nach NN | ✅ |
| 2 | `GET /diskhub/diskhub-rebuild?sub_id=offene-umbauplaene` → blocks_files[27], index_files[48], blocks-String 46.656 Bytes | ✅ |
| 3 | `add-box` → neue Datei in blocks/ mit file_name im Response | ✅ |
| 4 | `edit-block` mit file_name → Datei-Content aktualisiert | ✅ |
| 5 | `delete-block` mit file_name → Datei gelöscht | ✅ |
| 6 | Andere Diskussion (diskhub-rebuild ohne blocks/) → backward compat | ✅ |
| 7 | Health-Check 200 | ✅ |
| + | index/-Ordner Verifikation: 48 Dateien, NN-Format | ✅ |
| + | blocks.md + index.md sowohl für Haupt- als auch Subs getrasht | ✅ |
| + | Sub-Diskussionen ohne ###-Header (03, 04, 08–12): unberührt | ✅ |
| + | Dashboard-Restart + Build: fehlerfrei | ✅ |
| + | Git-Commit: auto-committed via add-box + edit-block | ✅ |
| + | **Phase 5 — Sub-Einzeldateien: Script rekursiv (4 Disk, 14 Ebenen) — 17 index.md ohne ### → 0 Änderungen** | ✅ |
| + | **Phase 6 — Git-Push: GitHub Repo erstellt, Remote gesetzt, routes.py mit _git_push() in 6 Endpunkten, Push getestet (0444b7c)** | ✅ |

## Fortschritt (24.05.2026)

**Phase 4 F.02 — 🔗-Format für index.md-Einträge** ✅
- [x] `renderBlock()`: 5. Parameter `indexFiles` + Pfad-Format `diskussion/index/slug`
- [x] `renderIndexMd()`: 4. Parameter `indexFiles`, durchgereicht an `renderBlock()`
- [x] Call-Sites (Sub-View + Main-View): `data.index_files || []` übergeben
- [x] Fallback auf `> entry-NR "titel"` für Diskussionen ohne index/-Ordner
- [x] Build (16s) + Dashboard-Restart + API-Verifikation (48 index_files ✅)
- Der 🔗-Button kopiert jetzt `diskhub-rebuild/index/00-01-datei-struktur-erledigt-neue-ordner-s` statt `> entry-1 "Datei-Struktur"`.

**Punkt 5 — Status-Prüfung vor Migration** ✅
- [x] 4 Diskussionen gescannt (diskhub-rebuild, gateway-standardisierung, memory-trimmer, registry-pythonpath-fix)
- [x] 3 mit Migrationsbedarf identifiziert (siehe Offene Punkte)
- registry-pythonpath-fix hat 0 ###-Header → kein Bedarf

**diskhub-rebuild Hauptebene migriert** ✅
- [x] blocks.md → `blocks/` (18 Dateien, `00-49-*` bis `17-index-md-*`)
- [x] index.md → `index/` (1 Datei, Sub:-Verweis)
- [x] Sammeldateien getrasht (blocks.md + index.md)
- [x] Script-Verifikation: alle Checks ✅
- [x] API-Verifikation: `GET /api/diskhub/diskhub-rebuild` → `blocks_files[18]`, `index_files[1]` ✅
- [x] Dashboard läuft + API 200 ✅

**gateway-standardisierung migriert** ✅
- [x] Hauptebene: index.md → `index/` (6 Dateien, Sub:-Verweise)
- [x] 5 Subs: api-key-handling, docker-label-kompatibilitaet, einheitlicher-reverse-proxy, traefik-entscheidung, valider-test-eintrag (6 Dateien)
- [x] 12 index.md-Einträge total, 0 blocks.md (keine vorhanden)
- [x] Script-Verifikation: index/-Migration ✅
- [x] API-Verifikation: `index_files[6]` via Haupt-Diskussion ✅
- [x] 6 Sammeldateien getrasht

**memory-trimmer migriert** ✅
- [x] Hauptebene: index.md → `index/` (7 Dateien, Sub:-Verweise)
- [x] Sub `offene-punkte`: blocks.md → `blocks/` (7 Dateien, #4 bis #13)
- [x] Script-Verifikation: Hauptebene ✅, offene-punkte blocks/ ✅
- [x] API-Verifikation: Hauptebene `index_files[7]`, Sub `blocks_files[7]` ✅

## Offene Punkte (priorisiert: 2 → 4 → 3 → 1)

**1. Weitere Diskussionen migrieren** ✅
Alle 3 Diskussionen migriert — siehe Fortschritt oben.

**2. 🔗-Referenzen prüfen (M.08)** ✅
Alte `> box-\d+` oder `> entry-\d+`-Referenzen in allen discussions/ aufgeräumt (24.05.2026): 4 Textboxen in offene-umbauplaene gepatcht (08-h, 09-i, 10-j, 27), keine Altreferenzen in anderen Diskussionen.

**3. Phase 5 — Sub-Diskussionen Einzeldateien** ✅
Für alle 4 Diskussionen rekursiv gelaufen (Script, 14 Ebenen). 17 index.md-Dateien ohne ###-Header übersprungen — keine Migration nötig.

**4. Phase 6 — Git-Push** ✅
Auto-Push nach jedem Commit (analog butler-hermi-config). GitHub Repo `Klausthecrab/butler-portal-diskhub` erstellt. `_git_push()`-Helper in 6 Endpunkten (add/edit/delete/update-readme/promote/toggle-title).