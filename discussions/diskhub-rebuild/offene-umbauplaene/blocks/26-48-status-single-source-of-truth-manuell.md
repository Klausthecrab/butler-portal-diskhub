### #48: Status Single Source of Truth — Manuelle Status-Zeilen aus READMEs entfernen
*— · 24.05.2026*

> **Quelle:** Max (Diskussion #46 — Erwartungsbeschreibung Single Source of Truth für Status, 24.05.2026)
>
> Der `diskhub-doc` Skill setzt `(✓ erledigt)` korrekt auf Ebene 3 (Textbox in Sub-Diskussion). Aber die README.md-Dateien auf Ebene 2 (Sub-Diskussion) und Ebene 1 (Hauptdiskussion) enthalten noch manuelle Status-Zeilen (`**Status:** X erledigt · Y offen`). Diese sind redundant, weil `_parse_index_status()` den Status bereits automatisch aus den Textboxen zählt.
>
> **Ziel:** Status wird nur auf der tiefsten Ebene gesetzt (Ebene 3). Alle Eltern-Ebenen leiten den Status dynamisch ab — kein manuelles `**Status:**` mehr in READMEs.
>
> **Sub-Punkte:**
> - [x] **S.01** — `_parse_index_status()` geprüft: Zählt NUR index/-Einträge (### #XX:), ignoriert blocks/-Einträge komplett. Keine Level-1-Aggregation (Hauptebene summiert keine Sub-Status). → **muss erweitert werden**
> - [x] **S.02** — Frontend geprüft: Liest `data.parsed.done_count` / `open_count` aus API-Response. Werte werden korrekt angezeigt — Problem ist die Quelle (Backend), nicht das Frontend.
> - [ ] **S.03** — Manuelle `**Status:**`-Zeilen aus README.md von Ebene 2 (offene-umbauplaene/) entfernen
> - [ ] **S.04** — Manuelle `**Status:**`-Zeilen aus README.md von Ebene 1 (diskhub-rebuild/) entfernen
> - [ ] **S.05** — Verifikation: Status-Zähler im UI stimmt nach Entfernung noch (vorher/nachher-Vergleich)
> - [ ] **S.06** — Diskussion #46-Eintrag aktualisieren
>
> **Tests:**
> - [ ] **T.01** — Nach Entfernung: UI zeigt gleichen Status wie vorher
> - [ ] **T.02** — Neuen Punkt erledigen → Status auf Ebene 1+2 aktualisiert sich automatisch
> - [ ] **T.03** — Rückkanal: Status-Werte via API-Endpunkt sind korrekt
>
>> **Analyse (26.05.2026) — Hermi nach Code-Review:**
>>
>> **Aktuelle Situation:** Die Status-Anzeige im UI ist bereits fehlerhaft. `_parse_index_status()` zählt nur index/-Einträge (36 Stück, alle ✅) und ignoriert blocks/-Einträge (39 Stück, 21 ✅ + 18 offen). Für `offene-umbauplaene` zeigt das UI `36 ✓ · 0 ●` statt korrekt `57 ✓ · 18 ●`.
>>
>> Die manuellen `**Status:**`-Zeilen in READMEs werden bereits vom dynamischen Parser überschrieben — sie sind totes Gewicht, kein Schaden.
>>
>> **Problem: Level-1-Aggregation fehlt.** Die Hauptebene `diskhub-rebuild` hat eigene 18 Blöcke + 1 index-Eintrag, aggregiert aber NICHT den Status von `offene-umbauplaene`. Wenn S.03+S.04 umgesetzt werden, zeigt `diskhub-rebuild` plötzlich `2 ✓ · 17 ●` statt des korrekten Gesamt-Status.
>>
>> **Lösungsweg (empfohlen):**
>> 1. `_parse_index_status()` auf blocks/-Ordner erweitern — auch `### ` ohne `#XX:`-Präfix zählen (Regex: alle `^### `-Zeilen, nicht nur `### #(\d+):`)
>> 2. Level-1-Aggregation bauen: Hauptebene summiert eigene Items + Subs-Status
>> 3. Erst DANN die manuellen README-Zeilen entfernen
>>
>> **Neue offene Punkte:**
>> - [ ] **S.07** — Level-1-Aggregation: Hauptebene summiert Sub-Status (recursive über Subs)
>> - [ ] **S.08** — `_parse_index_status()` erweitern auf blocks/-Inhalt + alle `### `-Zeilen (nicht nur `#XX:`)
>> - [ ] **S.09** — Ghost-Block-Prüfung: Alle blocks/-Dateien auf >1 `###` scannen vor der Umstellung
>>
>> **UI-Risiko:** Keins. Das Frontend zeigt nur zwei Integer an (`done_count` / `open_count`). Solange Werte >0 kommen, sieht es normal aus. Erst wenn beide 0 wären (weil keine Daten aggregiert werden), würde `0 ✓ · 0 ●` erscheinen — kein Crash, aber unschön.

**Fortschritt (26.05.2026) — Umsetzung durch Hermi:**

**S.09 ✅** Ghost-Block-Prüfung: 1 Ghost in `104-sub-diskussionen-pruefung.md` (`###`→`##` gefixt). Keine weiteren Ghosts.

**S.08 ✅** `_parse_index_status()` → `_parse_status()` umbenannt. Regex von `### #\d+:` auf alle `^### `-Zeilen erweitert. Neue Funktion `_get_md_content(folder, name)` für Ordner/Fallback-Logik. Neue Funktion `_compute_status(folder)` aggregiert index + blocks.

**S.07 ✅** Level-1-Aggregation: Nach Sub-Lese-Loop summiert Hauptebene alle Sub-Status. Nur aktiv wenn `sub_path` leer (Hauptansicht).

**S.03 ✅** `**Status:** 12 erledigt · 0 offen` aus `offene-umbauplaene/README.md` entfernt. Ersetzt durch Hinweis auf dynamische Aggregation.

**S.04 ✅** `**Status:** 19 erledigt · 0 offen` aus `diskhub-rebuild/README.md` entfernt. Gleicher Hinweis.

**S.05 ✅** Verifikation via API:

| Endpunkt | Ergebnis |
|----------|----------|
| `GET /diskhub/...?sub_path=offene-umbauplaene` | 55 ✓ · 19 ● (26 blocks ✅ + 29 index ✅ = 55 done, 19 blocks offen) |
| `GET /diskhub/...` (Hauptebene) | 63 ✓ · 39 ● (1 eigen + 55+7 subs ✅ = 63, 19 eigen + 19+1 subs ● = 39) |
| `GET /diskhub/...?sub_path=diskhub-regelwerk` | 7 ✓ · 1 ● |
| `GET /diskhub/health` | 200 OK |

**UI-Risiko bestätigt:** Keine Frontend-Änderungen. `done_count`/`open_count` aus `data.parsed` — UI aktualisiert automatisch.

**Bekannte Einschränkung:** `blocks/` und `index/` Ordner erscheinen als leere Subs im API-Response. Kosmetisch, kein Funktionsproblem.

---

💬 **Sub-Diskussion fortsetzen**
