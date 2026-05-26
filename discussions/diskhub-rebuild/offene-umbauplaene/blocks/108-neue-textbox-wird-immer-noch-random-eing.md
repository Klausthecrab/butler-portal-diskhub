### neue Textbox wird immer noch random eingetragen (✓ erledigt)
*— · 26.05.2026*

**Problem**
prüfen: ich habe gerade neue Textbox "UI Umsortierung" angelegt. Sie wird so einsortiert, dass sie "von oben" an Position 3 steht. das entspricht meiner erwartung.

**Eigentliche Fehlerursache (ermittelt 26.05.2026)**
Das "neue Textbox"-Formular funktioniert korrekt — es erzeugt Dateien mit `max_n + 1` (z.B. `108-name.md`). Das Problem sitzt im Backend beim **Auslesen** der Dateien.

In `routes.py` Zeile 560 und 589 steht:
```python
md_files = sorted([f for f in os.listdir(dir) if f.endswith('.md')])
```

`sorted()` sortiert **alphabetisch** (lexikografisch). Sobald 3-stellige Nummern (`100`, `101`, …, `108`) auftauchen, landen sie zwischen `10` und `11` — weil `"100"` < `"11"` im String-Vergleich.

**Konkret:** Box #108 erscheint im UI zwischen #10 und #11 statt am Ende der Liste. Das wirkt wie "random eingeworfen".

**Betroffene Stellen (3× in routes.py):**
| Zeile | Kontext |
|-------|---------|
| 560 | blocks/ Dateien für Haupt-API-Response |
| 589 | index/ Dateien für Haupt-API-Response |
| 1874 | index/ Dateien für edit-index-title-Endpoint |

**Fix-Plan**

1. **Ersetzen:** `sorted([...])` → `sorted([...], key=_file_sort_key)` mit Helferfunktion:
   ```python
   def _file_sort_key(fname):
       """Numerische Sortierung für NN-name.md Dateien.
       Dateien ohne numerisches Präfix fallen auf den String-Namen zurück."""
       m = re.match(r'^(\d+)', fname)
       return (0, int(m.group(1))) if m else (1, fname)
   ```
   - `(0, zahl)` → numerische Dateien werden nach Zahl sortiert
   - `(1, name)` → Dateien ohne Nummer hängen hinten dran

2. **Verifikation** nach dem Fix:
   ```bash
   curl -s 'http://localhost:8090/api/diskhub/diskhub-rebuild?sub_path=offene-umbauplaene' | \
     jq '[.blocks_files[].name]'
   ```
   → `108-neue-textbox-...` muss am Ende der Liste stehen (nach `107-ui-umsortierung`).

**Fortschritt (26.05.2026):**
- [x] `_file_sort_key()` Helferfunktion in `routes.py` eingebaut (Zeile 54)
- [x] 3× `sorted()`-Aufrufe auf `key=_file_sort_key` umgestellt (Z. 571, 600, 1885)
- [x] Debug-print wieder entfernt
- [x] Dashboard frisch gestartet (ohne Debug-Mode)
- [x] **Verifikation:**
  ```bash
  curl -s 'http://localhost:8090/api/diskhub/diskhub-rebuild?sub_path=offene-umbauplaene' | \
    python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d['blocks_files']), 'Blocks'); print('Last:', d['blocks_files'][-1]['name'])"
  ```
  → **47 Blocks, Last: 108-neue-textbox-wird-immer-noch-random-eing** ✅
- [x] Commit `a1532e3` (Helfer + sorted-Umstellung via Hermi)
- [x] Zwischenzeitliche Commits durch autonome Pipeline behalten den Fix

**Hinweis:** Der API-Parameter heißt `sub_path=`, nicht `sub_id=` — bei falschem Parameter wird der Haupt-Ordner gelesen (diskhub-rebuild/blocks/ statt offene-umbauplaene/blocks/). Das war die Ursache der scheinbaren Fehlfunktion während der Verifikation.

**Status**
(✓ erledigt)