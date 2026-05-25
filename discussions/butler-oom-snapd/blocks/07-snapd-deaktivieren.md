### #7: Snapd deaktivieren
*— · 25.05.2026*

**Problem**
Snapd deaktivieren, damit es keine I/O-Hangs mehr verursachen kann.

**Schritte**
1. Firefox-Umzug abschliessen (siehe #5 Snap-Firefox entfernen)
2. Alle Snaps entfernen: sudo snap remove firefox
3. Snapd stoppen: sudo systemctl stop snapd
4. Snapd deaktivieren: sudo systemctl disable snapd
5. Snapd maskieren (gegen Reaktivierung): sudo systemctl mask snapd
6. Loop-Devices aufraeumen
7. Pruefen: systemctl status snapd → inactive/dead

**Durchgeführt (25.05.2026)**
- ✅ Firefox-Umzug abgeschlossen (siehe #1-#5)
- ✅ Anwendungs-Snaps entfernt: gnome-42-2204, gnome-46-2404, gtk-common-themes, mesa-2404
- ✅ Basis-Snaps entfernt: core22, core24, bare
- ✅ snapd.service gestoppt, deaktiviert, maskiert (`/dev/null`-Symlink)
- ✅ snapd.socket gestoppt, deaktiviert, maskiert
- ✅ snapd.snap-repair.timer/service gestoppt, maskiert
- ✅ Loop-Devices bereinigt (12 Stück → 0)
- ✅ Verifikation: systemctl → inactive/dead, kein Snap mehr

**Ergebnis**
- `systemctl status snapd` → ○ inactive (dead), masked
- `systemctl status snapd.socket` → ○ inactive (dead), masked
- `losetup -a` → keine Loop-Devices mehr
- Dashboard (8090) → 200 OK
- n8n (5678) → 200 OK
- Registry (8025) → 200 OK
- `snap list` → CLI nicht mehr erreichbar (Timeout = snapd tot)

**Risiken**
- Einmal deaktiviert, braucht man sudo systemctl unmask snapd zur Reaktivierung
- Firefox muss vorher komplett migriert sein

**Status**
✅ erledigt