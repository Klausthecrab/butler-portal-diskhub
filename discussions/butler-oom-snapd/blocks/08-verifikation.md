### #8: Verifikation
*— · 25.05.2026*

**Problem**
Nach der Umsetzung muss geprueft werden, ob alles sauber laeuft.

**Ergebnisse (25.05.2026)**

| Prüfung | Status | Detail |
|---------|--------|--------|
| Firefox geöffnet | ✅ | Lesezeichen übertragen, von Kazzle bestätigt |
| `which firefox` | ✅ | `/usr/bin/firefox` (apt-Pfad) |
| `firefox --version` | ✅ | Mozilla Firefox 151.0.1 |
|| `snap list` | ✅ | Firefox nicht mehr gelistet, snap CLI tot (snapd gestoppt) |
|| `losetup -a` | ✅ | 0 loop-devices (alle bereinigt) |
|| `systemctl status snapd` | ✅ | inactive (dead), masked |
|| `systemctl status snapd.socket` | ✅ | inactive (dead), masked |
|| Dashboard (8090) | ✅ | 200 OK |
|| n8n (5678) | ✅ | 200 OK |
|| Registry (8025) | ✅ | 200 OK |
|| Shortcut Ubuntu-Leiste | ✅ | `firefox.desktop` in Gnome-Favoriten statt `firefox_firefox.desktop` |
|| Backup | ✅ | Liegt unter ~/ygr0z5yf.default.backup |

**Noch offen (beobachten)**
- GNOME Software-Popup kommt nicht mehr?
- Butler-Stabilität nach Snapd-Deaktivierung

**Status**
✅ erledigt (komplett — Firefox-Umzug + Snapd deaktiviert)