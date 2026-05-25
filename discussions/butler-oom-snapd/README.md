# Butler OOM Freeze — snapd als Ursache?

**Status:** 0 erledigt · 5 offen

Am 25.05.2026 um ~05:27 ist der Butler komplett eingefroren. Der OOM-Killer hat nahezu alle Services gekillt. Nach einem critical shutdown um 14:46 neu gebootet.

**Verdacht:** snapd (Watchdog-Timeout um 05:27:29) hat einen I/O-Hang verursacht, der das gesamte System blockiert hat.

**Geplanter Weg:**
1. Symptome analysieren und Ursache verstehen
2. Firefox aus Snap rausziehen (Lesezeichen erhalten)
3. Pruefen ob snapd komplett weg kann
4. Snapd deaktivieren
5. Verifizieren dass alles sauber laeuft