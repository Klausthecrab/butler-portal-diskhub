### #50: Sub-Diskussion-Verschachtelung — UI zeigt keine Sub-Subs an

*— · 25.05.2026*

**Problem**
Sub-Diskussionen, die innerhalb einer anderen Sub-Diskussion liegen (Sub-Subs), werden vom Frontend nicht im UI angezeigt. Der Ordner `low-prio-zurueckgestellt/` wurde in `offene-umbauplaene/` angelegt und existiert auf dem Filesystem, aber das UI rendert keine Akkordeons für Sub-Subs.

**Lösung**
Das Backend (routes.py Zeile 600–621) scannt beim Laden einer Sub-Diskussion (per `?sub_id=`) ebenfalls deren Unterordner und liefert sie als `subs`-Array mit. Das Frontend (Page.jsx) rendert `data.subs` aber nur in der Haupt-Ansicht (Zeile 2056) als Sub-Akkordeon — der Sub-View (Zeile 1824–1899) hat keine solche Render-Schleife.

Mögliche Fixes:
1. **Frontend-Patch:** Sub-View bekommt eine Sub-Akkordeon-Render-Schleife (analog Haupt-Ansicht)
2. **Alternativ:** Sub-Subs per index-Eintrag in der Eltern-Diskussion referenzieren (nur Link, kein Akkordeon)
3. **Workaround:** Alle Sub-Diskussionen auf einer Ebene halten — keine Verschachtelung

**Status**
🔜 offen