### #15: Trennlinien um Inhaltsverzeichnis (✓ erledigt)

*— · 21.05.2026*

> **Ergebnis:** Zwei `<hr>`-Elemente mit dezentem Inline-Style (`border-top: 1px solid #2d3a4e`, `opacity: 0.5`) vor und nach dem TOC in `generateToc()` eingefügt. Inline-Style statt CSS Module, da der HTML-String via `dangerouslySetInnerHTML` gerendert wird und CSS-Module-Hashes nicht greifen. Build OK.
