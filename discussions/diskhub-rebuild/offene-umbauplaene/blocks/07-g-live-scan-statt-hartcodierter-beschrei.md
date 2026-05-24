### #G: Live-Scan statt hartcodierter Beschreibung (niedrige Prio)
*— · 24.05.2026*

Abgeleitet aus diskhub-rebuild#box-17 (Index.md vs textboxen).

Niedrige Priorität.

Idee: Statt hartcodierter Beschreibungen (z.B. "Python 3.12, Flask-Backend") einen Befehl / Mechanismus der selbst prüft was der aktuelle Stand ist und beim Öffnen des Accordions einen "Live-Scan" ausführt.

Ziel: Kein Veralten von Beschreibungen. KI bekommt beim Lesen automatisch den aktuellen Stand.

Offene Fragen:
- Wie technisch umsetzbar (Backend-Endpoint pro Portal / pro Sub-Diskussion)?
- Caching / letzter-Run-Zeitstempel?
- Erst relevant wenn index.md-Sonderrolle geklärt ist.
