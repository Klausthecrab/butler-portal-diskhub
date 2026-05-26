### #105: Systemd-Autostart zeigt auf alten Pfad (🔜 offen)
*— · 26.05.2026*

**Problem**
Die systemd-Unit `openclaw-apps.service` startet beim Boot `/home/butleruser/.openclaw/workspace/autostart.sh` — ein Pfad, der seit der Migration ins Repo-Verzeichnis nicht mehr existiert. Der Autostart schlägt seit März 2026 bei jedem Reboot fehl. Registry (8025) und Dashboard (8090) bleiben dann aus, Docker-Container starten trotzdem.

**Lösung**
Die `ExecStart`-Zeile in `/etc/systemd/system/openclaw-apps.service` muss von
  `/home/butleruser/.openclaw/workspace/autostart.sh`
auf
  `/home/butleruser/repos/butler-dashboard-v3/autostart.sh`
aktualisiert werden. Danach `systemctl daemon-reload` und Test-Restart des Services.

**Status**
🔜 offen