### Erwartungsbeschreibung — Single Source of Truth für Status
*— · 24.05.2026*

Der Erledigt-Status wird nur an einer Stelle gesetzt: auf der tiefsten Ebene des entsprechenden Elements — also in der Sub-Sub-Diskussion oder in der Textbox, wo die Arbeit tatsächlich dokumentiert ist.

Alle Ebenen darüber (Sub-Diskussion, Haupt-Diskussion) lesen diesen Status automatisch aus — sie repliceren ihn nicht als eigenen Text. Kein (✓ erledigt) in index.md, kein **Status:** ✓ in README. Das Frontend ermittelt den Status dynamisch aus den Daten der untergeordneten Elemente.

Bedeutung: Ich pflege den Status einmal → er erscheint überall dort, wo dieses Element referenziert wird. Konsistent, wartbar, keine Sync-Probleme.
