### #11 — 🧹 Dead CSS-Klassen nach B3 entfernen
*— · 24.05.2026*

▌Problem:
Durch den Umbau der Evaluator-Liste auf BausteinCard sind CSS-Klassen in `Page.module.css` ungenutzt: `evalLatest`, `evalBar`, `evalDetailBtn`, `evalList`, `evalCard`, `evalCardLeft`, `evalDate`, `evalSize`, `evalArrow`.

▌Ziel:
Sauberer Code ohne tote Styles.

▌Aufgaben:
- Ungenutzte CSS-Klassen aus `Page.module.css` entfernen
- Prüfen ob irgendwo anders noch referenziert (`grep -r`)
- `npm run build` zur Bestätigung

▌Aufwand: Gering (~10 Min)

---
