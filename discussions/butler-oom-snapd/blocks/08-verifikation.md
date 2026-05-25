### #8: Verifikation
*— · 25.05.2026*

**Problem**
Nach der Umsetzung muss geprueft werden, ob alles sauber laeuft.

**Checkliste**
- Firefox geoeffnet, Lesezeichen-Leiste sichtbar?
- Firefox logged-in (Passwoerter, Sessions)?
- systemctl status snapd → inactive/dead?
- snap list → Fehler oder leer?
- 14 loop-devices verschwunden: losetup -a?
- Butler laeuft stabil, kein Freeze?
- Alle Services erreichbar (Gateway, n8n, changedetection, portainer)?
- GNOME Software-Popup kommt nicht mehr?

**Status**
🔜 offen