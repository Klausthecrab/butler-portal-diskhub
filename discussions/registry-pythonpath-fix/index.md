# Registry — PYTHONPATH-Fix nach Reboot

**Erstellt:** 24.05.2026 · 0 Sub-Diskussionen · 0 Blöcke

---

## Finding

Die Butler-Registry (Port 8025) läuft mit einem **defekten venv** — Flask fehlt, pip fehlt. Nach einem Reboot/Prozess-Neustart startet sie nicht, weil `python3 server.py` in `ModuleNotFoundError: No module named 'flask'` fliegt.

Workaround: Start mit system Python + explizitem PYTHONPATH:
```bash
cd ~/repos/butler-registry && \
  PYTHONPATH="/home/butleruser/.local/lib/python3.12/site-packages" \
  /usr/bin/python3 server.py
```

Gleiches Muster wie beim Dashboard v3 (Port 8090) — dort wird der gleiche Workaround im `dashboard-restart` Skill dokumentiert.

## Dauerlösung (offen)

Zwei Optionen, noch nicht entschieden:

1. **Venv reparieren** — pip installieren, Dependencies neu installieren, dann `start.sh` funktioniert wieder
2. **PYTHONPATH in `start.sh` verankern** — dann startet auch ein Reboot sauber, solange die user site-packages existieren

*session: 24.05.2026 · Kazzle-Auftrag aus Hermi-Thread*

---

💬 **Hier weiterdiskutieren**