### #9: Stabilitäts-Beobachtung → siehe #8 Verifikation
*— · 25.05.2026*

**Problem**
Snapd wurde deaktiviert und maskiert (siehe #7). Jetzt muss beobachtet werden, ob der Butler stabil läuft — keine Freezes, keine OOM-Situationen mehr.

**Beobachtungspunkte (nächste Session prüfen)**
- GNOME Software-Popup: Kommt das Popup "Neue Software verfügbar" noch?
- Butler-Freezes: Gab es in den letzten Tagen/Tagen seit Snapd-Deaktivierung einen Freeze?
- RAM-Nutzung: Ist der RAM-Verbrauch spürbar niedriger ohne Snapd/Loop-Devices?
- Services: Alle erreichbar (Dashboard, n8n, Registry, Gateway, changedetection, portainer)?
- Firefox: Startet und läuft stabil (apt-Version)?
- `systemctl status snapd`: Immer noch inactive (dead) + masked?
- `losetup -a`: Immer noch 0 loop-devices?

**Risiken**
- Sollte snapd doch wieder gebraucht werden: `sudo systemctl unmask snapd && sudo systemctl enable snapd && sudo systemctl start snapd`

**Status**
🔜 offen