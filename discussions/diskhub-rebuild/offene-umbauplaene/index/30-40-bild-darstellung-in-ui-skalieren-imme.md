### #40: Bild-Darstellung in UI — Skalieren + immer sichtbar (kein Akkordeon) (✓ erledigt) || CSS-Skalierung + no-accordion für 📷-Blöcke

*— · 23.05.2026*

> **Quelle:** Max (Feedback zu #38 — Testbild wird als blauer Kasten dargestellt)
>
> Bilder wurden als rohes `<img>` im Block-Content gerendert. Große Bilder zerrissen das Layout. Zudem waren Bild-Blöcke wie Textboxen im `<details>`-Accordion versteckt.
>
> **Sub-Punkte:**
> - [x] **B.01** — `.blockContent img`: max-height 400px + object-fit contain + cursor zoom-in
> - [x] **B.02** — `.markdownContent img`: gleiche Regeln für README-Bild-Content
> - [x] **B.03** — Neue CSS-Klasse `.imageBlockHeader`: kein cursor pointer + kein ::after-Pfeil
> - [x] **B.04** — JSX-Detektion: headingText.startsWith('📷') → kein `<details>`-Wrap, stattdessen `<div>` mit `.blockCard`
>
> **Ergebnis:** Bilder werden jetzt skaliert (max-width 100%, max-height 400px, object-fit contain, cursor zoom-in). 📷-Blöcke sind immer sichtbar — kein Accordion-Toggle. Header ohne Pfeil, aber gleiche Optik. Action-Buttons (Edit/Delete/Kopieren/In Sub entwickeln) bleiben erhalten.
