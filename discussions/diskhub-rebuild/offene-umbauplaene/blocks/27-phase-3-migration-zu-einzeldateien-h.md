### Phase 3 — Migration zu Einzeldateien (#H)
*— · 24.05.2026*

## Entscheidung: Phase 3 + Frontend-C.05 in einem Durchgang

**Datum:** 24.05.2026
**Autor:** Hermi

### Problem
Nach Phase-3-Migration wird blocks.md gelöscht. Das Frontend sendete aber noch `block_index` statt `file_name` (C.05 war ausstehend). Edit/Delete wären für migrierte Diskussionen kaputt.

### Ansatz
Phase 3 (Migration-Script) + C.05 (Frontend sendet file_name) in einem Durchgang implementiert. Dadurch:
- Migration erstellt Einzeldateien aus blocks.md + index.md
- Frontend sendet `file_name` bei Edit/Delete
- Backend-Fallback auf `block_index` bleibt für Diskussionen ohne Migration
- `edit-index-title`-Endpoint auf index/-Ordner umgestellt

### Script: scripts/split-collection-files.py
- Liest ###-Header aus Sammeldateien → Einzeldateien unter blocks/ und index/
- NN = Position in Datei (00, 01, ...), Slug aus Titel
- Kollisionsschutz via -2, -3-Suffix
- Trash statt rm für Sammeldateien
- Eingebaute Verifikation (NN-Format, Datei-Anzahl, exists-Checks)

### Migration ausgeführt
**Ziel:** diskhub-rebuild/offene-umbauplaene + 12 Sub-Diskussionen

| Metrik | Wert |
|--------|------|
| Textbox-Dateien | 27 → blocks/00-* bis 26-* |
| Index-Dateien | 48 → index/00-* bis 47-* |
| Sammeldateien getrasht | 6 (blocks.md + index.md) |
| Sub-Diskussionen migriert | 01-datei-struktur, 02-ui-struktur, 05–07 |
| Subs ohne ###-Header | Übersprungen (08–12 hatten keine Blöcke) |

### Verifikation (7-Punkte-Plan + Erweiterungen)

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
| + | Git-Commit: auto-committed via add-box | ✅ |

### Offen / Nächste Schritte
1. Andere Diskussionen migrieren (Script kann auf jede Diskussion mit blocks.md/index.md losgelassen werden)
2. Phase 5: Sub-Diskussionen Einzeldateien (optional — braucht dein Go)
3. Phase 6: Git-Auto-Commit (aktuell nur add-box committet automatisch)
4. 🔗-Referenzen prüfen (M.08) — alte #box-NR-Referenzen sind historisch
