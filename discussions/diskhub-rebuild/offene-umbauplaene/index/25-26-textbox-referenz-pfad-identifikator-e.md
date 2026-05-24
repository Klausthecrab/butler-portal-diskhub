### #26: Textbox-Referenz (Pfad/Identifikator) (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** Jede Textbox bekommt eine sichtbare ID `#box-<index>` im Header (rechtsbündig, monospace, dezent). Ein 🔗-Button in der Action-Bar kopiert `#box-<idx>` in die Zwischenablage (wechselt auf ✅ Kopiert für 2s). Die `<details>`-Box hat die HTML-ID `box-<idx>`, sodass `#box-3` in der URL direkt zur Box scrollt (Auto-Scroll via `useEffect` + `scrollIntoView` beim Laden). Nutzung: in einer Sub-Diskussion einfach `#box-1` schreiben, um auf eine bestimmte Textbox in derselben Diskussion zu verweisen. Nur Frontend-Änderung (kein Backend nötig). Build OK, Health-Check bestanden.
