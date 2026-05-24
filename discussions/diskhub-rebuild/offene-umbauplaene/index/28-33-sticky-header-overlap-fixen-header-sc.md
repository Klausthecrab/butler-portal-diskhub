### #33: Sticky-Header-Overlap fixen || Header schließt bündig ab (✓ erledigt)

*— · 22.05.2026*

> **Ergebnis:** `.docPanel` hatte `padding: 20px 24px` — der sticky `.docTabs` bei `top: 0` saß innerhalb dieser Padding-Lücke. Beim Scrollen wanderte Content (Terracotta-`.discHeader`) hinter die Tabs und schimmerte durch die 20px-Lücke durch. Fix: `.docPanel` padding-top entfernt (`padding: 0 24px 20px`), `.docTabs` mit `margin: 0 -24px` edge-to-edge gespannt und eigenes `padding: 0 24px` für horizontale Innenabstände. Tabs sitzen jetzt bündig am Panel-Top — kein Schlitz mehr. Build OK, Health-Check bestanden.
