### #5: Snap-Firefox entfernen
*— · 25.05.2026*

**Problem**
Nach der apt-Installation läuft die alte Snap-Version noch parallel. Snapd kann erst deaktiviert werden, wenn keine Snap-Apps mehr existieren.

**Schritte**
1. Firefox apt-Version testen und sicherstellen dass sie läuft
2. `sudo snap remove firefox`
3. Verifikation: `snap list` → firefox nicht mehr gelistet

**Risiken**
- Snap-Profil bleibt unter ~/snap/firefox/common/.mozilla/ erhalten — kann bei Bedarf wiederhergestellt werden
- Backup liegt unter ~/ygr0z5yf.default.backup

**Status**
🔜 offen