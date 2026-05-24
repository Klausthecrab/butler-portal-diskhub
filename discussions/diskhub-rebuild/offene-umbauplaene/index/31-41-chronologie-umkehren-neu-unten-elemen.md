### #41: Chronologie umkehren — Neu = unten (Elemente + Inhaltsverzeichnis) (✓ erledigt) || reversedBlocks.reverse() entfernt

*— · 23.05.2026*

> **Quelle:** Max (Feedback zu #38 — neue Box erscheint oben, erwartet: unten)
>
> Aktuell sortierte `BlocksSection` die Liste via `useMemo` reversed (`.reverse()`), sodass die neueste Box oben erschien. Das Inhaltsverzeichnis (TOC) hatte das Problem nicht — es iterierte blocks.md in Datei-Reihenfolge.
>
> **Sub-Punkte:**
> - [x] **C.01** — `.reverse()` aus `reversedBlocks`-useMemo entfernt
> - [x] **C.02** — TOC nicht verändert (bereits korrekt: Datei-Reihenfolge = chronologisch)
>
> **Ergebnis:** Neue Elemente erscheinen jetzt unten in der Liste (blocks.md-Datei-Reihenfolge). TOC war bereits korrekt. Keine weiteren Änderungen nötig.
