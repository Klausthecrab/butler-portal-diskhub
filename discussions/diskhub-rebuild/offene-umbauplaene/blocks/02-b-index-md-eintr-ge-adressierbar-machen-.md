### #B: Index.md-Einträge adressierbar machen (🔗-Button) (✓ erledigt)
*— · 24.05.2026*

Alle ###-Einträge in index.md (ohne Sub-Diskussion) bekommen einen 🔗-Button. Kopiert: diskhub-rebuild/offene-umbauplaene#punkt-31. HTML-ID punkt-XX auf dem <h3>-Element, Auto-Scroll wie bei #box-Ankern.

Betrifft: #13, #29-#50+ (alle index.md-Einträge ohne eigenen Sub-Diskussions-Ordner)

✅ Umsetzung 25.05.2026 bestätigt: 🔗-Button mit `punkt-XX`-ID + `data-copy-entry` + globalem Click-Handler (Page.jsx Z. 437, 446, 2693-2699).
