### #21: Statusfelder optisch vom README-Text trennen (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** `discStats` aus `discHeader` in beiden Views (Main + Sub) herausgezogen — eigenständiger Block zwischen Header und README-Content. `discStats` bekam Dark-Theme-Stil (`color: #94a3b8`, `border-bottom: 1px solid #2d3a4e`, `margin: 0 0 20px 0`) als klare Trennlinie zum Markdown-Content. Sub-View hatte vorher gar keine `discStats` — jetzt identisch zur Main-View. `discHeader` verlor `border-bottom`/`margin-bottom` (unnötig bei getrennten Blöcken). `.statsSep`-Farbe auf `#475569` (Dark-Theme) umgestellt. Build OK.
