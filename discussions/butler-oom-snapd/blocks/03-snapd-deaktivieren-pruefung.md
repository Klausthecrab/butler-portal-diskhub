### #3: Kann snapd komplett deaktiviert werden?
*— · 25.05.2026*

**Problem**
Wenn Firefox nicht mehr als Snap laeuft, koennen wir snapd deaktivieren. Aber: Haengen andere Systemkomponenten an snapd?

**Zu pruefen**
- mesa-2404 (Grafiktreiber) — via apt ebenfalls installiert (Version 25.2.8)
- gnome-42-2204 / gnome-46-2404 — nur fuer Snap-Apps, nicht fuer Desktop
- core22 / core24 / bare — Basis-Schicht fuer Snaps, entfaellt wenn keine Snaps mehr da
- gtk-common-themes — ebenfalls nur fuer Snaps

**Fazit (vorlaeufig)**
Nach Firefox-Umzug gibt es NULL Snap-Apps. Alle Kernkomponenten sind via apt verfuegbar. Snapd kann sauber deaktiviert werden.

**Risiken**
- GNOME Software (das Popup) sucht dann keine Updates mehr — ist aber nur das Popup.
- Sollte spaeter mal eine Snap-App gewuenscht sein → snapd einfach wieder aktivieren.

**Status**
🔜 offen