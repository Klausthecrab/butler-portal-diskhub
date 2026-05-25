### #4: Snapd deaktivieren
*— · 25.05.2026*

**Problem**
Snapd deaktivieren, damit es keine I/O-Hangs mehr verursachen kann.

**Schritte**
1. Firefox-Umzug abschliessen (siehe #2)
2. Alle Snaps entfernen: sudo snap remove firefox
3. Snapd stoppen: sudo systemctl stop snapd
4. Snapd deaktivieren: sudo systemctl disable snapd
5. Snapd maskieren (gegen Reaktivierung): sudo systemctl mask snapd
6. Loop-Devices aufraeumen
7. Pruefen: systemctl status snapd → inactive/dead

**Risiken**
- Einmal deaktiviert, braucht man sudo systemctl unmask snapd zur Reaktivierung
- Firefox muss vorher komplett migriert sein

**Status**
🔜 offen