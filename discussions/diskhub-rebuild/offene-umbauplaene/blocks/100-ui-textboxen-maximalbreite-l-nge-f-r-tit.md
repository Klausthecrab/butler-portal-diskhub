### UI: Textboxen maximalbreite / länge für titel (✓ erledigt)
*— · 25.05.2026*

**Problem**
damit kein 2 Zeiler entsteht

**Lösung**
1. CSS zwingt den Titel in eine Zeile — zu lange Titel werden mit "…" abgeschnitten
2. Beim Hovern zeigt ein Tooltip den vollen Titel an
3. (optional) Beim Erstellen/Bearbeiten von Boxen die Titel-Länge begrenzen

**Status**
✅ erledigt

**Fortschritt (26.05.2026):**
- [x] CSS: `.blockHeader` auf Flexbox umgestellt, `.blockHeader h3` mit `text-overflow: ellipsis; white-space: nowrap; overflow: hidden; flex: 1; min-width: 0;`
- [x] BlockHeader-Elemente (`.boxAnchorLabel`, `::after`) von `float: right` auf `flex-shrink: 0` + `margin-left: auto` umgestellt
- [x] `title`-Attribut auf `<h3>` in `renderBlock()` (index.md) und BlocksSection (blocks.md/React) — voller Titel beim Hovern sichtbar
- [x] Build erfolgreich (15.95s) + Dashboard neugestartet
- [x] Verifikation: 19 Block-h3 + 1 📷-Bild-h3 = alle 20 haben `title`-Attribut, CSS `nowrap+ellipsis` aktiv, Flexbox-Layout intakt
- [ ] (optional) Backend-Titel-Längen-Limit in `/edit-block` + `/add-box`
