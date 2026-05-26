### #105: Systemd-Autostart zeigt auf alten Pfad (✓ erledigt)
*— · 26.05.2026*

**Problem**
Die systemd-Unit `openclaw-apps.service` startet beim Boot `/home/butleruser/.openclaw/workspace/autostart.sh` — ein Pfad, der seit der Migration ins Repo-Verzeichnis nicht mehr existiert. Der Autostart schlägt seit März 2026 bei jedem Reboot fehl. Registry (8025) und Dashboard (8090) bleiben dann aus, Docker-Container starten trotzdem.

**Lösung**
`ExecStart` und `WorkingDirectory` in `/etc/systemd/system/openclaw-apps.service` von
  `/home/butleruser/.openclaw/workspace`
auf
  `/home/butleruser/repos/butler-dashboard-v3`
aktualisiert. Danach `systemctl daemon-reload` und Neustart des Services.

**Durchgeführt (26.05.2026):**
- [x] Pfad in systemd-Unit korrigiert (ExecStart + WorkingDirectory)
- [x] `systemctl daemon-reload`
- [x] `systemctl start openclaw-apps.service` — aktiv, Exit-Code 0
- [x] Autostart-Log: alle Dienste gestartet (Registry ✅, Dashboard ✅, Schlüsselmeister ✅, MCP Hub, Whisper, Claude Bridge)
- [x] Dashboard antwortet HTTP 200 auf Port 8090
- [x] Registry antwortet HTTP 200 auf Port 8025

**Status**
✅ erledigt