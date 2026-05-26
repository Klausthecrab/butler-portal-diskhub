### Sub-Diskussion Bilder einfügen
*— · 26.05.2026*

**Problem**
es fehlt der Button für bild einfügen / für das modal. das existiert nur in der Hauptdiskussion.
1) das soll in jeder (sub-)Diskussion sichtbar sein (und funktional). 
2) Bilder sollen, wie textboxen und Sub-Diskussionen , in der selben auflistung als gleichwertiges Element erscheinen. 
3) In der "+ Neue Textbox" Formular unten kann ich ja im Textbereich mit "STRG+V" ein Bild, bspw screenshot, einfügen. Dies mit dem "mustertext", der dort per default steht erkenntlich machen. und verifizieren (funktionalität prüfen).

**Lösung**

**1) Bild-Button/Modal auch in Sub-Diskussionen**
- ImageUploadModal-Komponente prüfen: wird sie aktuell nur in der Hauptdiskussion geladen?
- Sub-Diskussions-View (Komponente `BoxView` o.ä.) um den Button ergänzen
- Modal-Trigger über den selben Mechanismus wie in der Hauptdiskussion anbinden
- Prüfen ob bestehende `pickImage`/`uploadImage`-Funktionen aus der Hauptdiskussion wiederverwendet werden können

**2) Bilder als gleichwertiges Element in der Auflistung**
- Aktuell werden Sub-Diskussionen und Textboxen in der selben Liste angezeigt, Bilder fehlen dort
- Bilder sollen nach dem Upload als eigenständiger Eintrag in der Block-Liste auftauchen (analog zu Textboxen)
- Anzeige: Thumbnail + Dateiname, klickbar für Vollansicht
- Abhängigkeit: der Upload-Mechanismus muss einen Block-Eintrag (mit Box-ID) erzeugen, nicht nur den Image-String in den Content schreiben

**3) STRG+V im Textbereich (bereits in Bearbeitung)**
- Default-Mustertext um Hinweis ergänzen
- Funktionalität verifizieren

**Status**
🔜 in Arbeit (Punkt 3 aktiv, 1+2 geplant)
