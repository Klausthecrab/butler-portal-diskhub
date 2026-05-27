### Alternative: Netdata — Monitoring für Faule

*— · 27.05.2026*

**Problem**

Prometheus + Grafana sind mächtig, aber erfordern Setup: Prometheus-Konfiguration (YAML), Node Exporter auf jedem Host, Grafana-Dashboards bauen. Vielleicht wollen wir erstmal was Einfacheres.

**Was ist Netdata?**

Ein All-in-One-Monitoring-Tool: Ein Docker-Container, und es sammelt direkt auf dem Host über 2000 Metriken (RAM, CPU, Disk, Netzwerk, Prozesse, Docker-Container, Temperaturen). Es hat schon eingebaute Dashboards — kein Grafana-Setup nötig. Es kann auch Warnungen schicken (Discord, Telegram, Email).

**Wie hilft das Butler?**

- Ein Befehl (`docker run ...`) und du hast live-Graphen im Browser
- Zeigt sofort: Welcher Prozess wie viel RAM frisst, welche Container Swappen
- Integrierte Alarme: "RAM >90%" → Push-Nachricht
- Kann nachträglich Daten an Prometheus weitergeben, falls wir später upgraden wollen

**Vergleich**

| Kriterium | Prometheus + Grafana | Netdata |
|-----------|---------------------|---------|
| Setup | 2-3 Docker-Container + Konfig | 1 Docker-Container |
| Details | Sehr tief (Custom-Queries) | 2000+ Metriken out-of-the-box |
| Alarme | via Alertmanager | Integriert |
| Historie | Tage-Wochen konfigurierbar | Stunden-Tage (RAM-abhängig) |
| Lernkurve | Mittel | Gering |

**Vorschlag**

Netdata aufsetzen, damit wir überhaupt mal live-Metriken sehen. Prometheus/Grafana später wenn wir Detail-Tiefe brauchen.

**Status**

🔜 offen