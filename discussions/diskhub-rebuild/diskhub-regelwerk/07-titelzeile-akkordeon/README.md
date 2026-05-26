# Titelzeile im Akkordeon vereinheitlichen

**Erstellt:** 21.05.2026 · **Status:** ✓ erledigt

**Problem:** Die Titelzeile von Sub-Diskussionen im Akkordeon zeigt unterschiedlichen Text, je nachdem ob zugeklappt oder aufgeklappt. Der Backend-generierte `sub.name` (`sub_name.replace('-', ' ').title()`) zerstört Capitalisierung — z.B. `02-ui-struktur` → `02 Ui Struktur`, während der README-Titel korrekt `# UI-Struktur` lautet. Zugeklappt sieht man den falschen Namen, aufgeklappt den richtigen README-Titel.

**Ursache:** Backend verwendet Python `.title()` für Namensgenerierung, was Wörter wie "UI", "README" etc. falsch kapitalisiert (`Ui`, `Readme`). Der Frontend-Header zeigt diesen Backend-Namen, während der aufgeklappte Body den echten README-Titel rendert.

**Lösung:**
- Neue Helper-Funktion `readmeTitle(md)` in `Page.jsx` — parst den ersten H1 aus Markdown via `md.match(/^# (.+)$/m)`
- Akkordeon-Header verwendet: `📂 {readmeTitle(sub.readme) || sub.name}`
- Fallback auf `sub.name` falls keine README vorhanden
- Single Source of Truth: Der Titel kommt IMMER aus der README — egal ob zugeklappt (Header) oder aufgeklappt (Body)

**Nicht geändert:** Sub-View Modal-Header / Breadcrumb (`subViewData.sub_name`) — separater Kontext, nicht vom User beanstandet.