### Sub-Diskussion Bilder einfügen
*— · 26.05.2026*

**Problem**
es fehlt der Button für bild einfügen / für das modal. das existiert nur in der Hauptdiskussion.
1) das soll in jeder (sub-)Diskussion sichtbar sein (und funktional). 
2) Bilder sollen, wie textboxen und Sub-Diskussionen , in der selben auflistung als gleichwertiges Element erscheinen. 
3) In der "+ Neue Textbox" Formular unten kann ich ja im Textbereich mit "STRG+V" ein Bild, bspw screenshot, einfügen. Dies mit dem "mustertext", der dort per default steht erkenntlich machen. und verifizieren (funktionalität prüfen).

**Lösung**

**1) Bild-Button/Modal auch in Sub-Diskussionen** ✅
- 🖼️-Button in der Sub-View addBoxSection ergänzt (Zeile 2144 Page.jsx)
- ImageUploadModal war bereits Props-seitig für beide Views vorbereitet (`activeSubView`, `subId`)
- Build erfolgreich, Dashboard neu geladen

**2) Bilder als gleichwertiges Element in der Auflistung** ✅
- Backend legt Bilder als separaten `### 📷 ...`-Block in `blocks/` ab
- Block erscheint in der `BlocksSection` mit Connector, #box-N, 📷-Titel
- Gleiches Layout wie Textboxen (blockCard, Action-Buttons, data-status)
- Keine Code-Änderung nötig — bereits durch #37/#40 implementiert

**3) STRG+V im Textbereich (bereits in Bearbeitung)** 🔜
- Default-Mustertext um Hinweis ergänzen
- Funktionalität verifizieren

**Status**
✅ Punkt 1 und 2 erledigt, Punkt 3 offen
