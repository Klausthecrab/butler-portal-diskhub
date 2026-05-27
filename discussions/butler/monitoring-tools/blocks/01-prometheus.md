### Prometheus — Datensammler für System-Metriken

*— · 27.05.2026*

**Problem**

Aktuell haben wir SAR, der alle 10 Minuten einen Snapshot von CPU/RAM/Swap macht. Das reicht um grob zu sehen "um 01:00 war Swap voll", aber nicht um zu verstehen *welcher Prozess* den Swap gefüllt hat oder *wie schnell* der Anstieg war.

**Was ist Prometheus?**

Ein Datensammler, der alle 15-30 Sekunden Metriken von deinem System abholt (CPU, RAM, Swap, Disk I/O, Netzwerk, Prozesse). Die Daten speichert er in einer eigenen Datenbank — du kannst sie tagelang oder wochenlang zurückverfolgen.

**Wie hilft das Butler?**

Beim nächsten Freeze siehst du im Prometheus-Verlauf genau:
- Wann ist der RAM gestiegen? (nicht "um 01:00" sondern "um 00:47:30")
- Welcher Prozess hatte den Sprung? (via Node Exporter + Prozess-Metriken)
- Wiederholt sich das Muster? (jede Nacht um 01:00? nur am Wochenende?)

Man kann auch Warnungen einbauen: "Swap >80% → Benachrichtigung in Discord", bevor der OOM-Killer überhaupt zuschlägt.

**Status**

🔜 offen