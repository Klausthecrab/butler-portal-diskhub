### Sub-Diskussion Bilder einfügen (✓ erledigt)
*— · 26.05.2026*

**Problem**
es fehlt der Button für bild einfügen / für das modal. das existiert nur in der Hauptdiskussion.
1) das soll in jeder (sub-)Diskussion sichtbar sein (und funktional). 
2) Bilder sollen, wie textboxen und Sub-Diskussionen , in der selben auflistung als gleichwertiges Element erscheinen. 
3) In der "+ Neue Textbox" Formular unten kann ich ja im Textbereich mit "STRG+V" ein Bild, bspw screenshot, einfügen. Dies mit dem "mustertext", der dort per default steht erkenntlich machen. und verifizieren (funktionalität prüfen).

**Lösung**

**1) Bild-Button/Modal auch in Sub-Diskussionen** ✅
- 🖼️-Button in Sub-View addBoxSection ergänzt (Zeile 2144 Page.jsx)
- ImageUploadModal war bereits Props-seitig für beide Views vorbereitet
- **Verifikation:** Sub-View "Offene Umbauplaene" — addBoxImageBtn vorhanden ✅, Klick öffnet Modal ✅

**2) Bilder als gleichwertiges Element in der Auflistung** ✅
- Backend legt Bilder als `### 📷 ...`-Block in `blocks/` ab
- Block erscheint in `BlocksSection` mit Connector, #box-N, Action-Buttons, data-status
- Bereits durch #37/#40 implementiert
- **Verifikation:** 78 BlockCards im Sub-View, alle mit Connector + Action-Buttons ✅

**3) STRG+V-Hinweis im Mustertext** ✅
- Default-Placeholder "Inhalt (Markdown) — Bilder per STRG+V" in allen Textareas vorhanden
- Funktioniert in Main-View und Sub-View

**Status**
✅ Vollständig umgesetzt und verifiziert
