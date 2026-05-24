### #27: Chronologische Sortierung per Datei-Position || Einträge in korrekter Reihenfolge (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** Kein Timestamp-Tracking nötig. Neue Boxen werden via `add-box` immer ans Ende von `blocks.md` angehängt — Datei-Position = Erstellungs-Reihenfolge. `BlocksSection` reversed die Liste per `useMemo` (`reversedBlocks` mit `originalIdx`-Mapping), sodass die neueste Box oben, die älteste unten erscheint. Foolproof: egal ob via Textfeld, Prompt oder API angelegt — `add-box` hängt immer unten an. Bearbeiten ändert die Position nicht (korrekt: chronologisch ≠ letzte Aktivität). Backend-Operationen (edit/delete/copy) nutzen `originalIdx` für korrekte Datei-Indizes. Build OK, Health-Check bestanden.
