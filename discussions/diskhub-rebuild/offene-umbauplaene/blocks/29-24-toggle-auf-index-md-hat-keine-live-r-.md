### #24 ⬜/✅-Toggle auf index.md hat keine Live-Rückmeldung
*— · 24.05.2026 · Update: 25.05.2026*

Der ⬜/✅-Status-Toggle auf index.md-Einträgen funktioniert technisch (API ✅, Speichern ✅), aber das UI reagiert nicht live. Man sieht den Button nicht von ⬜ auf ✅ springen, die Titelleiste färbt sich nicht um — erst nach F5 und erneuter Navigation. Das fühlt sich kaputt an.

**Erwartung:** Klick auf ⬜/✅ → sofortige visuelle Änderung (Button wechselt, Titelleiste färbt sich ein). Wie bei den Textboxen (blocks.md), wo das bereits flüssig funktioniert. Minimale Verzögerung ist OK, aber kein API-Call-Warten, kein F5, kein Neuladen der ganzen Daten.

**Lösungsrichtung:** Optimistic UI — den neuen Status sofort lokal rendern, API-Call im Hintergrund, bei Fehler zurücksetzen. Der aktuelle fetchDiscussionData()-Reload ist zu langsam, weil erst der Toggle, dann ein kompletter API-Refresh, dann Re-Render. Der Klick-Effekt geht im Lade-Spinner unter.

**Fortschritt (25.05.2026):**
- [x] Optimistic UI implementiert — `data-toggle-index-done` Handler macht jetzt DOM-Manipulation sofort:
  - `data-status` toggeln → CSS färbt Header grün/grau
  - `details.open` toggeln (erledigt=aufgeklappt, offen=zugeklappt)
  - Button wechselt sofort ⬜↔✅
  - API läuft im Hintergrund
  - Bei Fehler: Rollback auf alten DOM-Zustand
  - `fetchDiscussionData()` entfällt — kein kompletter Daten-Neuload
- [x] Build geprüft (Vite, 16s, fehlerfrei)
- [x] Dashboard läuft auf Port 8090
- [x] Commit `553cdee` auf origin/master gepusht

**Feedback (25.05.2026) — Toggle-Re-Render:**
- Hauptdiskussion: Farbwechsel ✅, aber Seite rendert neu → Position springt zurück
- Sub-Diskussion: Farbwechsel bleibt komplett aus, erst nach Schließen/Öffnen sichtbar
- Ursache: `setSubViewData()` im success-Pfad triggert Re-Render der Sub-Ansicht. In der Hauptdiskussion überschreibt das den optimistischen DOM-Status weil Daten aus `fetchDiscussionData().index` kommen. In Sub-Diskussionen wird die ganze Sub-Ansicht neu aufgespannt → DOM-Änderung geht verloren.
  - **Fix 1 (Hermi, 25.05.):** `setSubViewData()` aus dem success-Pfad entfernt → hilft der Sub-Diskussion (kein Re-Spawn der Ansicht mehr), aber Hauptdiskussion hatte immer noch Positions-Sprung durch `dangerouslySetInnerHTML`-Re-Render
  - **Fix 2 (Hermi, 25.05.):** Zusätzlich `data.index` im React State optimistisch updaten. Problem: `data.index` ist ein **Markdown-String**, kein Array. Der erste Versuch (`prev.index[entryIndex].done`) war kaputt.
  - **Fix 3 (Hermi, 25.05.):** `patchIndex()`-Funktion — durchläuft die `###`-Zeilen im Markdown-String, findet den Eintrag per Index-Zähler, fügt/entfernt `(✓ erledigt)` im Heading-Text. Sowohl `setData` (Main) als auch `setSubViewData` (Sub) nutzen das.
  - **Status:** Build gemacht (Vite, 16s), beide Repos gepusht (butler-portal-diskhub + butler-dashboard-v3). Dateien sind Hardlinks (gleiche Inode) — ein Patch reicht.

**Feedback (25.05.2026) — Max, nach Fix 3:**
- "Wirkt auf mich genau wie vorher" — keine sichtbare Änderung
- Shift+Strg+R hat nicht geholfen
- Hermi hat den Build im Browser getestet: Klick auf ⬜ → sofortiger Wechsel auf ✅, aber nach 3s (nach API-Response + Re-Render) wieder zurück auf ⬜. Der `patchIndex()`-State-Update scheint nicht zu greifen, oder der Re-Render kommt bevor das State-Update propagiert.
- **Verdacht:** Der Flask-Server (debug=True, Port 8090) served noch den alten Build, oder der Browser-Cache wird nicht richtig geleert (JS-Chunks haben `max-age=31536000, immutable`). Hermi hat den Build deployed, aber der Server wurde nicht neugestartet.
- ⚠️ Weiterer Verdacht: Die `###`-Zeilen in index.md enthalten `||`-Separator nach dem Status. `patchIndex()` hängt ` (✓ erledigt)` ans Zeilenende an — das könnte hinter den `||`-Teil geraten statt davor.

---

**Aktueller Stand (25.05.2026, 15:50 Uhr):**

### Analyse der beiden Verdachtsmomente

**Verdacht A (Server/Cache):** Durch Hermis Test (vorherige Session) wurde bestätigt: Der optimistische DOM-Clock funktioniert (sofortiges ✅) → der neue Code läuft teilweise. Aber nach API-Response kommt Re-Render → Toggle bounce-back. Das deutet auf ein CODE-Problem hin, nicht auf Server/Build.

**Verdacht B (||-Separator in patchIndex()):** FALSE ALARM. Die tatsächlichen index-Einträge in `discussions/*/*/index/*.md` sehen so aus:
```
### #27: Chronologische Sortierung (✓ erledigt) || Einträge in korrekter Reihenfolge
### #12: Kurzbeschreibung (✓ erledigt) || README-Präambel als Preview
### #20: Status-Zähler (✓ erledigt)
```
Das `||` steht IMMER vor dem Status-Marker. `patchIndex()` hängt mit `replace(/\s*$/, ' (✓ erledigt)')` ans ZEILENENDE an — nach dem `||`-Teil, also genau korrekt. Der Backend-Code in `routes.py` macht exakt dasselbe. ✅ Kein Problem.

**Eigentliche Root Cause identifiziert:**
Das Kernproblem ist `dangerouslySetInnerHTML`. Der Toggle macht:
1. ✅ Optimistischer DOM (Button wechselt, data-status ändert sich)
2. API-Call → Response → State-Update (`setData`/`setSubViewData` via `patchIndex()`)
3. React re-rendert → `dangerouslySetInnerHTML` ersetzt GANZEN HTML-Block
4. Alle DOM-Änderungen aus Schritt 1 sind WEG → Toggle bounce-back + Scroll-Sprung

Der hideDone-Toggle (Ausblenden ✓) hat dieses Problem NICHT, weil `BlocksSection` echte React-Komponenten nutzt. Der Checkbox-Change macht nur `setHideDone()` → React diffed die Komponenten sauber.

### Fix 4 — patchIndex() + State-Update komplett rausgeworfen

**Ansatz:** Wie hideDone — kein State-Update nach API-Response. Nur noch optimistischer DOM + Hintergrund-API ohne Re-Render.

**Was geändert wurde (25.05.2026, 15:30 Uhr):**
- `patchIndex()`-Funktion aus dem success-Pfad entfernt (70 Zeilen raus)
- `setSubViewData(prev => ...patchIndex(...))` entfernt
- `setData(prev => ...patchIndex(...))` entfernt
- Scroll-Stabilizer (`requestAnimationFrame` → `window.scrollTo`) entfernt
- Nach API-Response: nur noch `setErrorMsg('✅ Status aktualisiert')` und `setDebugLog(...)` — kein State-Update das Re-Render triggert
- Der optimistische DOM (data-status, details.open, button.textContent) bleibt stehen
- Der Fehler-Rollback im catch-Block bleibt erhalten

**Debug-Infos im UI (für Kazzle sichtbar):**
- Grüne Debug-Leiste unten am Bildschirmrand (fixed, `z-index: 9999`)
- Zeigt nach Toggle-Klick: `[Toggle] idx=X was=⬜ → ✅ scrollY=NNN` dann `[Toggle] API ok — DOM bleibt optimistisch`
- Kein F12/Console nötig — erscheint direkt im Browser

**Build + Deployment:**
```bash
cd ~/repos/butler-dashboard-v3/frontend && npm run build  # 16s, fehlerfrei
cd ~/repos/butler-portal-diskhub && git push origin master  # Commit bdf7d7b
kill $(lsof -ti:8090) && cd ~/repos/butler-dashboard-v3/backend && python3 server.py &  # Neustart
```

**Verifizierung (per curl):**
```bash
curl -s http://localhost:8090/ | grep -o 'src="[^"]*"' | grep index
# → /assets/index-msxoR_cH.js
curl -s http://localhost:8090/assets/Page-DF2k4hvb.js | grep 'DOM bleibt optimistisch'
# → gefunden! ✅ Neuer Build LIVE
```

**Hardlinks:** `~/repos/butler-portal-diskhub/frontend/Page.jsx` und `~/repos/butler-dashboard-v3/frontend/src/portals/diskhub/Page.jsx` haben identische Inode (3280139) — Hardlink, Änderung gilt für beide.

### Ungeklärtes Problem

**Kazzle testet (25.05.2026, 15:50):**
- Strg+F5 / Strg+Shift+R gemacht
- Sieht **keine** grüne Debug-Leiste
- Verhalten fühlt sich "wie gestern" an — kein Fix spürbar

**Mögliche Ursachen:**
1. Browser-Cache ignoriert Strg+F5 nicht (selten, aber möglich bei Service Workern oder extrem aggressivem Cache)
2. Der Flask-Server served die index.html mit `Cache-Control: public, max-age=...` für index.html selbst (nicht nur JS-Chunks)
3. Es läuft ein reverse proxy (nginx?) vor Flask der den alten Build cached
4. Kazzle ist auf einem anderen Gerät/Netzwerk als der Butler-Server
5. Der Browser hat den neuen Chunk geladen, aber irgendein Teil des alten Codes persistiert (React Hot Reload oder lokal gespeicherte Daten?)
6. Die Seite wird über einen anderen Port/Host geladen als localhost:8090

**Nächste Schritte für neue Session:**
- Debug: curl gegen die tatsächliche URL die Kazzle im Browser nutzt (nicht localhost:8090 sondern 192.168.178.62:8090 oder ähnlich?)
- Prüfen ob nginx oder anderer Proxy dazwischen hängt
- Prüfen ob Flask die index.html cached (debug=True sollte nicht, aber evtl. send_from_directory mit Cache-Header)
- Alternative: nach dem Build `send_from_directory` in server.py prüfen — evtl. wird index.html einmalig gecached
- Workaround: `?v=2` Cache-Buster in der URL testen
- Workaround: `window.location.reload(true)` im Browser erzwingen

---

**Übergabe-Prompt für neue Hermi-Session:**

> Lies die Textbox #24 in der Sub-Diskussion "Offene Umbauplaene" (Diskhub Rebuild):
> `~/repos/butler-portal-diskhub/discussions/diskhub-rebuild/offene-umbauplaene/blocks/29-24-toggle-auf-index-md-hat-keine-live-r-.md`
>
> Fix 4 ist deployt (Build + Server-Neustart), per curl auf localhost:8090 verifiziert — der neue Code ist LIVE. Aber Kazzle sieht keine Debug-Leiste und spürt keine Verbesserung. Finde raus warum.
>
> **Vorgehen:**
> 1. Erstelle einen Plan was du prüfen willst (siehe "Nächste Schritte" in der Textbox)
> 2. Erkläre Kazzle den Plan
> 3. Warte auf seine finale Freigabe — starte nichts ohne OK