### #35: Lightbox für Bilder

*— · 22.05.2026*

> **Quelle:** Max (Diskussion #28 Bild-Upload)
> Bilder werden aktuell als rohes `<img>` ohne Größenbeschränkung gerendert — große Bilder zerreißen das Layout.
>
> Gewünscht:
> - Bilder im Content automatisch skalieren (z.B. `max-width: 100%`, `max-height: 400px`, `object-fit: contain`, `cursor: zoom-in`)
> - Klick auf skaliertes Bild öffnet Lightbox-Modal: Bild in Originalgröße, dunkler Hintergrund, zentriert, Close per X oder Klick außerhalb
> - Nur Frontend (kein Backend) — ändert `renderMarkdown()` + neue `.imageLightbox`-Komponente + CSS
>
> **Sub-Punkte:**
> - [ ] **L.01** — CSS für `.docBody img` / `.markdownContent img`: max-height + zoom-in-Cursor
> - [ ] **L.02** — Lightbox-Komponente: onClick → Overlay mit Bild in Originalgröße
> - [ ] **L.03** — Beispielbild in Diskussion eintragen (z.B. Screenshot) um die Lightbox zu demonstrieren
