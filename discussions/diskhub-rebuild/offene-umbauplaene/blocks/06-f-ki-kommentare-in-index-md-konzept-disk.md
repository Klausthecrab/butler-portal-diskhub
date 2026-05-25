### #F: KI-Kommentare in index.md (Konzept diskutieren) (✓ erledigt)
*— · 24.05.2026*

Abgeleitet aus diskhub-rebuild#box-17 (Index.md vs textboxen).

Idee: index.md-Einträge enthalten unsichtbare Kommentare, die nur für die KI lesbar sind.
Beispiel: "hi hermi. hier ist ein Kommentar von vergangener KI zu zukunfts-hermi: diese Parameter beschreiben die technischen Details vom Portal XYZ, Stand dd.mm.yyyy."

Fragen:
- HTML-Kommentare (<!-- ... -->) im gerenderten Markdown? Oder spezielles Syntax?
- Wie wird sichergestellt dass Kommentare gepflegt werden?
- Monitoring-Cron bei Erkennung von Änderungen?
- Nur für index.md oder auch für Textboxen / Sub-Diskussionen?
