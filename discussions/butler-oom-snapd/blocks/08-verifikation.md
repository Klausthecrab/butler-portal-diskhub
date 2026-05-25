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
| `snap list` | ✅ | Firefox nicht mehr gelistet (nur Basis-Snaps) |
| `losetup -a` | ⚠️ | 12 loop-devices (Basis-Snaps, kein Firefox mehr) |
| Shortcut Ubuntu-Leiste | ✅ | `firefox.desktop` in Gnome-Favoriten statt `firefox_firefox.desktop` |
| Backup | ✅ | Liegt unter ~/ygr0z5yf.default.backup |

**Noch offen (nächste Session)**
- Snapd deaktivieren (#7) — erfordert separaten Durchgang
- GNOME Software-Popup beobachten
- Butler-Stabilität nach vollständiger Snapd-Deaktivierung

**Status**
✅ erledigt (Firefox-Umzug abgeschlossen)