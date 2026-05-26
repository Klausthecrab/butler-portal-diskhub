### #35: Sub-Diskussionen nummerieren (✓ erledigt)
*— · 21.05.2026*

**Problem:** Die Sub-Diskussionen unter "Offene Umbaupläne" haben keine konsistente Adressierung. Für Feedback/Diskussion sollen sie via Nummer referenzierbar sein.

**Lösung:**
- Die bestehenden Sub-Diskussionen erhalten in ihrer Titelzeile innerhalb der index.md eine sichtbare Nummer
- Vorschlag: `#01: Datei-Struktur`, `#02: UI-Struktur`, `#03: Detail-Ansicht` usw.
- Nummer = Ordnername (zweistellig), direkt im `### Sub:`-Title

**Status**
✅ erledigt — `data.subs.map()` bekommt `idx`-Parameter, Titel wird `#01:`, `#02:`, etc. via `padStart(2, '0')` vorangestellt.