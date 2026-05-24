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
| + | Git-Commit: auto-committed via add-box + edit-block | ✅ |

### Offen / Nächste Schritte (in Prioritäts-Reihenfolge)

1. **Phase 4 F.02 — 🔗-Format für index.md-Einträge**
   Der 🔗-Button bei index.md-Einträgen kopiert noch das alte Format `> entry-NR "titel"`. Nach Migration existieren die Einträge als Einzeldateien unter `index/`. Sollte auf Pfad-Format umgestellt werden: `diskussion/index/punkt-slug`. Sub-Diskussionen-🔗 (F.03) sind bereits ✅.

2. **Phase 6 — Git-Push**
   Aktuell committet add-box/edit-block/delete-block automatisch (`git add -A && git commit`), aber push fehlt. Analog zu butler-hermi-config: nach jedem Commit automatisch pushen. Max will das wahrscheinlich.

3. **Weitere Diskussionen migrieren**
   Bisher nur offene-umbauplaene migriert. Andere Diskussionen mit blocks.md/index.md:
   - diskhub-rebuild (Hauptebene)
   - memory-trimmer
   - registry-pythonpath-fix
   - gateway-standardisierung
   Einmal `python3 scripts/split-collection-files.py discussions/<name>` und fertig.

4. **🔗-Referenzen prüfen (M.08)**
   Alte `#box-NR`-Referenzen in anderen Diskussionen. Ein grep nach `> box-\d+` oder `> entry-\d+` in allen discussions/. Niedrige Prio, weil der neue 🔗-Button Pfad-Format kopiert.

5. **Phase 5 — Sub-Diskussionen Einzeldateien (optional)**
   Für Diskussionen mit Sub-Struktur das Script rekursiv laufen lassen. Braucht Max Go.

6. **Andere Diskussionen: Status-Prüfung vor Migration**
   Vor Migration checken: Haben sie bereits blocks/-Ordner? (Dann schon migriert.) Haben sie blocks.md mit ###-Headern? (Dann Migration sinnvoll.)
