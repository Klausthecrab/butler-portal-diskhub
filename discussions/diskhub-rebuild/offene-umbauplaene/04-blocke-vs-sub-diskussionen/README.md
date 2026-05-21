# Blöcke vs. Sub-Diskussionen

**Erstellt:** 21.05.2026 · **Status:** ✓ erledigt

**Frage:** Was ist der Unterschied und wie wird er abgebildet?

| | Blöcke | Sub-Diskussionen |
|---|---|---|
| Dateiebene | Flach in blocks.md | Eigener Ordner |
| Kinder | ✗ Keine | ✓ Eigene Blöcke + Sub-Diskussionen |
| Detail-Ansicht | ✗ Nur Akkordeon | ✓ "Öffnen"-Link |
| Zweck | Gedankenfetzen, Ideen | Ausdiskutierte Themen |

**Entscheidungen:**
1. **Promotion Block → Sub** — Button im Block-Akkordeon (⬆️ Als Sub übernehmen). Backend erstellt Sub-Ordner, kopiert Inhalt, entfernt Block aus blocks.md, fügt ### Sub:-Eintrag in index.md, Git-Commit.
2. **Block-Status** — Blöcke bleiben bewusst statuslos (Gedankenfetzen = flüchtig).
3. **Visuelle Unterscheidung** — Block-Karten (index.md) erhalten leicht graueren Hintergrund (`#1a2433` statt `#1e293b`). Sub-Karten bleiben warm (`#1c1917`). Promote-Button in blasser Farbe, hover hellt auf.

**Umsetzung (21.05.2026):**

### Backend: POST /api/diskhub/promote-block
- Nimmt `discussion_id`, `block_title`, `block_content`, optionale `is_sub`/`sub_id`
- Normalisiert Titel zu Sub-Ordner-ID (lowercase, hyphens)
- Schreibt README.md, index.md, blocks.md in den neuen Ordner
- Entfernt den promoted Block aus blocks.md der Eltern-Diskussion
- Fügt ### Sub:-Eintrag + Fusszeile an index.md der Eltern-Diskussion an
- Git commit mit Nachricht "disc: ...: promoted block -> sub_id"

### Frontend: BlocksSection-Komponente
- Neue React-Komponente ersetzt `dangerouslySetInnerHTML` für blocks.md
- Parst `###`-Blöcke mit `parseBlocksMd()` und rendert als React-Elemente
- Jeder Block hat Promote-Button (`styles.promoteBtn`) am unteren Rand
- `handlePromoteBlock` ruft API auf, zeigt Status-Banner, refreshed Daten
- Förderung funktioniert auch in Sub-Diskussionen (is_sub/sub_id Parameter)

### CSS: Promote-Button + Block-Farbe
- `.promoteBtn`: 100% Breite, transparent, border-top, hover → sichtbar
- `.blockCard` bg: `#1a2433` (leicht grauer, subtil)
- `.blockCardSub` bleibt: `#1c1917` (warm)