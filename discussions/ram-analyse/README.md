# RAM-Analyse — Butler-Freeze nach 2 Monaten Uptime

**Erstellt:** 25.05.2026 · **Zuletzt aktualisiert:** 25.05.2026  
**Status:** 0 erledigt · 3 offen

Butler-System (13th Gen i5-13400F, 31GB RAM, AMD RX 6700 XT) lief 2 Monate stabil und freezete am 25.05.2026 komplett — kein Maus-, Tastatur- oder SSH-Zugriff mehr. Hard-Reset (Power-Button 10s) war nötig.

Kernel-Logs vom vorherigen Boot zeigen einen **Page Fault** (`unable to access opcode bytes`) — der Kernel konnte Code an einer Speicheradresse nicht lesen. Da `kernel.panic=0` eingestellt ist, blieb das System hängen statt zu rebooten.

**Nächste Schritte:**
- Memtest86+ durchführen (RAM auf Defekte prüfen)
- `kernel.panic=10` setzen (Auto-Reboot bei nächstem Kernel-Crash)
- Nach Memtest: Ergebnisse auswerten und entscheiden ob RAM getauscht werden muss
