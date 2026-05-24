### #18: Connector-Linie + Punkt + Datum für alle Elemente (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** Connector-Pattern (`blockWrapper > blockConnector > connectorDot + connectorLine + connectorDate`) auf alle Listenelemente ausgeweitet:
> - **BlocksSection** (React, blocks.md): Jeder Block jetzt mit blockWrapper, Datum wird aus Content-Zeile `*— · DD.MM.YYYY*` extrahiert und in den Connector verschoben. CSS auf `.blockCard`/`.blockHeader`/`.blockContent` umgestellt (uniform mit index.md-Blöcken).
> - **Sub-Akkordeons:** Jeder Sub jetzt mit blockWrapper, Datum wird aus README `**Erstellt:** DD.MM.YYYY` geparst.
> - Helfer: `parseBlockDate()` (für blocks.md) und `parseCreatedDate()` (für README).
