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

### Führte Migration aus auf: offene-umbauplaene (13 Diskussionen)
- 27 Textbox-Dateien + 48 Index-Dateien erstellt
- 6 Sammeldateien getrasht
- Verifiziert via API + File-Checks

### Offen
- Andere Diskussionen migrieren (Phase 3 auf weitere discussions/ ausrollen)
- 🔗-Referenzen prüfen (M.08) — alte #box-NR-Referenzen sind historisch
- Phase 5: Sub-Diskussionen-Einzeldateien (optional)
- Phase 6: Git-Auto-Commit
