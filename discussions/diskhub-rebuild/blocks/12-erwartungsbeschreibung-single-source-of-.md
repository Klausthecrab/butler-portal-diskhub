### Erwartungsbeschreibung — Single Source of Truth für Status (✓ erledigt)
*— · 24.05.2026*

Der Erledigt-Status wird nur an einer Stelle gesetzt: auf der tiefsten Ebene des entsprechenden Elements — also in der Sub-Sub-Diskussion oder in der Textbox, wo die Arbeit tatsächlich dokumentiert ist.

Alle Ebenen darüber (Sub-Diskussion, Haupt-Diskussion) lesen diesen Status automatisch aus — sie repliceren ihn nicht als eigenen Text. Kein (✓ erledigt) in index.md, kein **Status:** ✓ in README. Das Frontend ermittelt den Status dynamisch aus den Daten der untergeordneten Elemente.

Bedeutung: Ich pflege den Status einmal → er erscheint überall dort, wo dieses Element referenziert wird. Konsistent, wartbar, keine Sync-Probleme.

**Fortschritt (26.05.2026):**
Umsetzung in `offene-umbauplaene/blocks/26-48-status-single-source-of-truth-manuell.md`:
- `_parse_index_status()` → `_parse_status()`: zählt jetzt alle `### `-Headings (index + blocks)
- `_compute_status(folder)`: aggregiert index + blocks eines Ordners
- Level-1-Aggregation: Hauptebene summiert Sub-Status
- Manuelle `**Status:**`-Zeilen aus READMEs entfernt
- API-Verifikation: 55 ✓ · 19 ● (offene-umbauplaene), 63 ✓ · 39 ● (Hauptebene)
