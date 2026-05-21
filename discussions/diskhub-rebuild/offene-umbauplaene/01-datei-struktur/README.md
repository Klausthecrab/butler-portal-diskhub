# Datei-Struktur

**Erstellt:** 21.05.2026 · **Status:** 3 erledigt · 0 offen

**Frage:** Wie soll die Ordner- und Datei-Struktur einer Diskussion aussehen?

**Aktuell:** README.md (Summary) + index.md (### Sub:-Einträge) + blocks.md (### Blöcke) + Sub-Ordner.
Die Trennung zwischen Blöcken (flach in blocks.md) und Sub-Diskussionen (eigener Ordner mit index.md) ist implementiert.

**Status: ✅ blocks.md eingeführt**
- Backend liest und liefert blocks.md als `blocks`-Feld
- Frontend rendert Blocks als separate Akkordeon-Sektion
- "In Dokument übernehmen" schreibt in blocks.md
- Session-Kontext hat Fallback index.md → blocks.md

**Noch offen:**
- meta.json für Metadaten (oder reichen README-Header?)
- Migration bestehender Diskussionen (aktuell leer bei gateway-standardisierung)