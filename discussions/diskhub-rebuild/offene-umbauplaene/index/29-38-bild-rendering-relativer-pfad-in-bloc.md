### #38: Bild-Rendering — Relativer Pfad in blocks.md korrigieren (✓ erledigt) || Absoluter API-Pfad in blocks.md

*— · 23.05.2026*

> **Quelle:** Max (Feedback zu #37 — Bild wird in Diskussion nicht dargestellt)
>
> Das Backend schrieb in `add_box()` (Zeile 1799 `routes.py`) einen **relativen Pfad**:
> ```python
> image_md = f'\n![{clean_title}](assets/{filename})'
> ```
>
> `renderMarkdown()` erzeugte `<img src="assets/bild-2305-1.png">`. Der Browser löste relativ zur Dashboard-Basis-URL auf — falscher Pfad. Korrekt ist `GET /api/diskhub/assets/<disc_id>/<filename>` über den Flask-Serve-Endpoint.
>
> **Sub-Punkte:**
> - [x] **R.01** — `image_md` in `add_box()`: relativen Pfad durch API-Pfad ersetzen (discussion_id + optional sub_id als Query-Param)
>
> **Tests:**
> - [x] **T.01** — Bild-Block mit korrektem API-Pfad in blocks.md geschrieben und per HTTP 200 ausgeliefert
> - [x] **T.02** — sub_id wird im Code berücksichtigt (`?sub_id=`), manuell noch nicht getestet
> - [x] **T.03** — Alte Bild-Blöcke (3 Stück) wurden aufgeräumt: aus blocks.md entfernt + Assets gelöscht
> - [x] **T.04** — Bild kann gelöscht werden (#25 Delete-Block) — kein Code-Konflikt (nur content geändert)
> - [x] **T.05** — TOC zeigt 📷-Icon + Titel (nur `###`-Parser, kein Regression-Risiko)
>
> **Ergebnis:** `assets/{filename}` durch `/api/diskhub/assets/{discussion_id}/{filename}` ersetzt. Sub-Diskussionen bekommen `?sub_id=`. Backend-Neustart (debug=True) + Testbild verifiziert. Alte Bild-Blöcke bereinigt. Commit `d8c4104`.
