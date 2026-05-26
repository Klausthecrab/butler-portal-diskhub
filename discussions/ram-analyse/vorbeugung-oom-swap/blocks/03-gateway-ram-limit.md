### Gateway RAM-Limit setzen — systemd MemoryMax

*— · 27.05.2026*

**Problem**

Der OOM-Killer hat einen Python-Prozess im `hermes-gateway.service` gekillt. Das Service-Cgroup hat kein RAM-Limit — der Prozess kann theoretisch bis zum System-Limit wachsen. Ein RAM-Limit verhindert, dass das Gateway den gesamten Swap frisst.

**Lösung**

Per systemd `MemoryMax=` oder `MemoryHigh=` ein RAM-Limit für den `hermes-gateway.service` setzen. Bei Überschreitung triggert systemd den OOM-Killer nur innerhalb dieser Cgroup — andere Dienste bleiben verschont.

**Umsetzung**

```bash
sudo mkdir -p /etc/systemd/system/hermes-gateway.service.d/
echo '[Service]
MemoryMax=1.5G
MemoryHigh=1.2G' | sudo tee /etc/systemd/system/hermes-gateway.service.d/70-memory-limit.conf
sudo systemctl daemon-reload
sudo systemctl restart hermes-gateway.service
```

**Offene Fragen**

- Wie viel RAM braucht das Gateway normal? Aktuell nicht gemessen.
- 1.5G als erste Schätzung — ggf. anpassen nach Beobachtung.
- `MemoryMax` killt hart, `MemoryHigh` drosselt nur — welches Verhalten ist besser?

**Status**

🔜 offen