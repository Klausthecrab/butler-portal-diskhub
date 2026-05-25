### #49 neue "offene Punkte" werden unformatiert angelegt (✓ erledigt)
*— · 22.05.2026*

**Problem**
Von Hermi via API (`add_box()`) angelegte Textboxen landen als unformatierte Textwände — keine Absätze, kein Schema, schwer lesbar.

**Lösung**
Backend `_auto_format_content()` in `routes.py` erkennt rohen Content an fehlenden Struktur-Markern und verpackt ihn automatisch in **Problem → Lösung → Status**. Bereits strukturierter Content (erkennt `**Problem**`, `**Lösung**`, `**Status**`) bleibt unverändert. Skill + Referenz-Doku aktualisiert.

**Status**
✅ erledigt

**Fortschritt (25.05.2026):**
- [x] `_auto_format_content()` Funktion in routes.py implementiert
- [x] Call Site in `add_box()` — roher Content wird vor dem Schreiben formatiert
- [x] Skill `knowledgeskill-diskhub-element-semantik`: Artefakt-Template gelöscht, Problem/Lösung/Status eingetragen
- [x] Referenz `diskhub-file-management-internals.md` aktualisiert
- [x] `diskhub-doc` Skill neu geschrieben (von index.md auf Textboxen umgestellt)
- [x] Commit `580c603` — gepusht
