### #1: Symptome & Analyse
*— · 25.05.2026*

**Problem**
Butler froze am 25.05.2026 um ~05:27 vollständig. OOM-Killer hat fast alle Services gekillt (n8n, hermes-gateway, cloudflared, portainer, NetworkManager, systemd-resolve, cups, etc.).

**Befunde**
- System-Boot 00:57:25 → Freeze um 05:27:29 → Neustart 14:46 → **9h 19min tot**
- snapd Watchdog-Timeout um 05:27:29 (`snapd.service: Watchdog timeout (limit 5min!)`)
- 14,4 GB shared memory (shmem) im OOM-Dump — ungewöhnlich viel
- 14 loop-devices aktiv für nur 9 Snaps (alte Versionen nie aufgeräumt)
- n8n hatte nur 126 MB RSS — war Opfer, nicht Täter
- Erster OOM-Aufruf kam von cloudflared, nicht n8n

**Verdacht**
snapd hat sich bei einem Update-Check (GNOME Software Popup) in den I/O verbeult → System blockiert → OOM-Killer räumt auf.

**Status**
🔜 offen