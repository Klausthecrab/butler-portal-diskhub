# Offene Umbaupläne

**Erstellt:** 21.05.2026 · 12 Sub-Diskussionen · 0 Blöcke

---

### #01: Datei-Struktur (✓ erledigt) || Neue Ordner-Struktur festlegen

*— · 21.05.2026*

> **Ergebnis:** Grundstruktur durch spätere Implementierungen abgedeckt — README.md + index.md + blocks.md + Sub-Ordner sind etabliert. Keine aktiven offenen Punkte mehr.

### #02: UI-Struktur (✓ erledigt) || Header-Body-Aufbau definieren

*— · 21.05.2026*

> **Ergebnis:** Vollständig durch Punkte 3–6 implementiert (Detail-Ansicht, Blocks vs Subs, Single Source of Truth, Duplikate entfernt).

### #03: Detail-Ansicht (✓ erledigt) || Zoom in Sub-Diskussionen

*— · 21.05.2026*

> **Ergebnis:** Browser-History-API + TOC in Sub-View + Technisch-Tab respektiert Subs

### #04: Blöcke vs. Sub-Diskussionen (✓ erledigt) || Klare Trennung einführen

*— · 21.05.2026*

> **Ergebnis:** Promotion-UI + visuelle Unterscheidung + Block-Status verworfen

### #05: Single Source of Truth (✓ erledigt) || Gleicher Text in Akkordeon und Detail-Ansicht

*— · 21.05.2026*

> **Ergebnis:** Sub-Karten zu Akkordeon umgebaut — volle README via renderMarkdown(), kein slice(0,200) mehr. "→ Vollständige Ansicht"-Link für Index/Blocks.

### #06: Doppelte Elemente entfernen (✓ erledigt) || Titel, Datum, ausgeklappte Subs

*— · 21.05.2026*

> **Ergebnis:** `renderIndexMd()` bekommt `mode='footer-only'` — Main-View rendert nur Footer (💬 Sub-Diskussion fortsetzen) ohne Preamble/### Sub: Blöcke. Sub-View bleibt voll.

### #07: Titelzeile im Akkordeon vereinheitlichen (✓ erledigt)

*— · 21.05.2026*

> **Ergebnis:** `readmeTitle()` parst H1 aus README — Header zeigt echten Titel statt `sub.name`. Single Source, kein `.title()`-Bug mehr. Fallback auf `sub.name` bei fehlender README.

### #08: Sub-Diskussionen nummerieren (✓ erledigt) || Sub-Akkordeon mit Nummer-Prefix

*— · 21.05.2026*

> **Ergebnis:** `data.subs.map()` bekommt `idx`-Parameter, Titel wird `#01:`, `#02:`, etc. via `padStart(2, '0')` vorangestellt.

### #09: Status-Auslese in Sub-Akkordeon fixen (✓ erledigt) || Status-Badge in Sub-Header

*— · 21.05.2026*

> **Ergebnis:** `sub.status` aus API-Daten im Header gerendert: grüner Badge bei `erledigt > 0 && offen === 0`, gelber Badge bei `offen > 0`. CSS-Klassen `.badgeDone`/`.badgeOpen` wiederverwendet.

### #10: Header-Box mit weißem Hintergrund + Trennlinien (✓ erledigt) || CSS für hellen Header

*— · 21.05.2026*

> **Ergebnis:** `.discHeader` von dunklem Gradient auf `#f8fafc` umgestellt, Textfarben invertiert (dunkel auf hell), `border-bottom: 2px solid #d1d5db` als Trennlinie.

### #11: Standardmäßig eingeklappte Subs fixen (✓ erledigt) || Ersten offenen Sub auto-expand

*— · 21.05.2026*

> **Ergebnis:** `useEffect` auf `data`: findet `data.subs.find(sub => sub.status?.offen > 0)` und setzt `expandedSubs = new Set([firstOpen.id])`. Alle anderen bleiben zu.

### #12: Kurzbeschreibung im aufgeklappten Akkordeon (✓ erledigt) || README-Präambel als Preview

*— · 21.05.2026*

> **Ergebnis:** `extractPreamble()` extrahiert alles zwischen H1 und erstem `---`/`###` aus `sub.readme`. Akkordeon zeigt diese Präambel + "→ Vollständige Ansicht"-Link — Single Source, kein separater Feld.

### #13: Header-Box Terracotta + Abgrenzung

*— · 21.05.2026*

Header-Box heller machen (pastell Terracotta), Ecken abrunden, Titel und Fußzeile dezent voneinander trennen.

### #14: Weißes Überbleibsel entfernen

*— · 21.05.2026*

Neben der Header-Box existiert noch ein zweites weißes Element ("Pille") aus Altbestand — entfernen oder anpassen.

### #15: Trennlinien um Inhaltsverzeichnis

*— · 21.05.2026*

Vor und nach dem TOC dezente Linien einziehen.

### #16: "Box hinzufügen"-Formular

*— · 21.05.2026*

Template/Formular ganz unten in der Diskussion: Titelzeile + Textfeld, um eine neue Box anzulegen.

### #17: "Zu Sub ändern"-Button + Session-Spawn

*— · 21.05.2026*

In jeder Box ein Button, der eine Session startet. Die KI durchgeht den Box-Inhalt mit dem User und leitet 1-n Sub-Diskussionen ab + legt sie automatisch an.

---

💬 **Sub-Diskussion fortsetzen**