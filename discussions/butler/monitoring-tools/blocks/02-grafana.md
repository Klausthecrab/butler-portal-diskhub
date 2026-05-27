### Grafana — Dashboard zum Sehen, was los ist

*— · 27.05.2026*

**Problem**

SAR liefert Zahlen auf der Kommandozeile (`sar -r -s 00:00 -e 02:00`). Das ist okay für die Nachlese, aber nicht zum Überwachen. Ein visuelles Dashboard würde auf einen Blick zeigen: läuft der Butler gerade warm oder kühl?

**Was ist Grafana?**

Ein Dashboard-Tool, das die Daten aus Prometheus (oder anderen Quellen) in Graphen und Kacheln darstellt. Du siehst RAM-Verlauf, Swap-Nutzung und CPU-Last in einem Diagramm über Zeit — wie eine Aktienkurve für deinen Server.

**Wie hilft das Butler?**

- Auf einen Blick sehen: "Swap steigt seit 30 Minuten" — bevor der OOM kommt
- Korrelation: Läuft der RAM-Anstieg parallel zu einem bestimmten Docker-Container?
- Historie: War der RAM letzte Woche auch schon so hoch?
- Nächstliche Muster erkennen: Läuft um 01:00 immer ein Cron-Job der RAM frisst?

Grafana läuft meist als Docker-Container und wird über den Browser aufgerufen — genau wie dein Dashboard.

**Status**

🔜 offen