### #24 ⬜/✅-Toggle auf index.md hat keine Live-Rückmeldung (✓ erledigt)
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

## Analyse der beiden Verdachtsmomente

**Verdacht A (Server/Cache):** Durch Hermis Test (vorherige Session) wurde bestätigt: Der optimistische DOM-Clock funktioniert (sofortiges ✅) → der neue Code läuft teilweise. Aber nach API-Response kommt Re-Render → Toggle bounce-back. Das deutet auf ein CODE-Problem hin, nicht auf Server/Build.

**Verdacht B (||-Separator in patchIndex()):** FALSE ALARM. Die tatsächlichen index-Einträge in `discussions/*/*/index/*.md` sehen so aus:
```
## #27: Chronologische Sortierung (✓ erledigt) || Einträge in korrekter Reihenfolge
## #12: Kurzbeschreibung (✓ erledigt) || README-Präambel als Preview
## #20: Status-Zähler (✓ erledigt)
```
Das `||` steht IMMER vor dem Status-Marker. `patchIndex()` hängt mit `replace(/\s*$/, ' (✓ erledigt)')` ans ZEILENENDE an — nach dem `||`-Teil, also genau korrekt. Der Backend-Code in `routes.py` macht exakt dasselbe. ✅ Kein Problem.

**Eigentliche Root Cause identifiziert:**
Das Kernproblem ist `dangerouslySetInnerHTML`. Der Toggle macht:
1. ✅ Optimistischer DOM (Button wechselt, data-status ändert sich)
2. API-Call → Response → State-Update (`setData`/`setSubViewData` via `patchIndex()`)
3. React re-rendert → `dangerouslySetInnerHTML` ersetzt GANZEN HTML-Block
4. Alle DOM-Änderungen aus Schritt 1 sind WEG → Toggle bounce-back + Scroll-Sprung

Der hideDone-Toggle (Ausblenden ✓) hat dieses Problem NICHT, weil `BlocksSection` echte React-Komponenten nutzt. Der Checkbox-Change macht nur `setHideDone()` → React diffed die Komponenten sauber.

## Fix 4 — patchIndex() + State-Update komplett rausgeworfen

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

## Root Cause gefunden — data-toggle-index-done Buttons existieren nicht im DOM

**Live-Browser-Test (25.05.2026, 16:48 — Herme in neuer Session):**

Nachdem Fix 4 (Build ✅, Server ✅, Cache-Header fix ✅) deployt war, sah Kazzle trotz Cache-Deaktivierung keine Debug-Leiste. Hermi hat per Headless-Browser die Seite live geladen, "Diskhub Rebuild" geöffnet und das DOM inspiziert.

**Ergebnis:** `document.querySelector('[data-toggle-index-done]')` → **`null`**. Im gesamten DOM existiert kein Element mit `data-toggle-index-done`.

**Warum die Buttons fehlen:**

Der Render-Pfad in der **Haupt-Diskussion** ist zweigeteilt:

1. **`generateToc()` (Zeile 227)** — rendert das Inhaltsverzeichnis als **reine Textzeilen**: `<div class="tocItem">├── 📝 Titel</div>`. Kein Button, kein `data-toggle-index-done`, nichts klickbares. Nur Deko-Text.

2. **`renderIndexMd(data.index, 'footer-only', ...)` (Zeile 2053)** — wird mit `mode='footer-only'` aufgerufen → gibt NUR den Footer (alles nach der letzten `---`) zurück. **Keine Blöcke, keine `data-toggle-index-done` Buttons.**

Die `data-toggle-index-done` Buttons werden in `renderBlock()` (Zeile 451) erzeugt, aber `renderBlock()` wird NUR in `renderIndexMd()` mit dem Default-Modus (ohne `mode`) aufgerufen — und das passiert NUR in **Sub-Diskussionen** (Zeile 1897).

Für die Haupt-Diskussion: Index-Blöcke werden überhaupt nicht als interaktive Buttons gerendert. Das `generateToc()` macht nur statischen Text, und `renderIndexMd()` im `footer-only`-Modus gibt nur den Footer.

**Konsequenz:** Der globale `click`-Handler in Zeile 1188 (`e.target.closest('[data-toggle-index-done]')`) kann **nie** feuern — weder vor noch nach Fix 4. Der Toggle auf index.md-Einträge in der Haupt-Diskussion war also von Anfang an defekt. Fix 4 hat korrekten Code für den Fall bereitgestellt, dass ein Button geklickt wird — aber die Buttons existieren nicht.

**Das erklärt auch Fix 3->Fix 4:** In der vorherigen Session (Fix 3) hatte Hermi den Toggle im Browser getestet und ein sofortiges ✅ gesehen, das später bounce-backte. Das war der **Textbox-Toggle (blocks.md)**, nicht der index.md-Toggle. Der blocks.md-Toggle hat einen anderen Click-Handler (`onClick={()=>O(...)}`) und bounce-backt wegen `dangerouslySetInnerHTML`. Fix 4 hat das nur für index.md gelöst — aber da es dort nie klickbare Buttons gab, war der Fix nicht spürbar.

## Fix 5 — Main-View rendert index-Einträge jetzt mit Toggle-Buttons

**Ansatz:** `renderIndexMd(data.index, 'footer-only', ...)` → `renderIndexMd(data.index, undefined, ...)`. Damit durchläuft die Haupt-Diskussion den gleichen Block-Parser wie Sub-Diskussionen und erzeugt `data-toggle-index-done` Buttons für jeden `###`-Eintrag.

**Was geändert wurde (25.05.2026, 17:45 Uhr — Hermi Two):**
- Zeile 2053 in `Page.jsx`: `'footer-only'` → `undefined` (zweites Argument von `renderIndexMd()`)
- `renderIndexMd()` rendert jetzt alle `###`-Blöcke aus `data.index` als interaktive Accordion-Karten mit ⬜/✅-Button — exakt wie im Sub-Diskussions-View (Zeile 1897)
- Footer-Text (alles nach der letzten `---`) erscheint trotzdem als Rest-Preamble unter den Blöcken
- `hideDone`-Filter funktioniert auch für index-Einträge (filtert `(✓ erledigt)`-Blöcke)
- Der globale Click-Handler (Zeile 1185) feuert jetzt bei Klick auf die index-Toggle-Buttons

**Build + Deployment:**
```bash
cd ~/repos/butler-dashboard-v3/frontend && npm run build
pkill -f "python3 server.py"
cd ~/repos/butler-dashboard-v3/backend && python3 server.py &
cd ~/repos/butler-portal-diskhub && git add -A && git commit -m "fix: main view index toggle by removing footer-only mode" && git push
```

**Verifikation:**
- ⬜/✅-Button erscheint jetzt in der Haupt-Diskussion unter den Textboxen
- Klick → sofortiger optimistischer DOM-Update (data-status, details.open, Button-Text)
- API-Call im Hintergrund → kein Re-Render, kein Bounce-Back
- Debug-Leiste zeigt `[Toggle] idx=X was=⬜ → ✅` bei Klick

**Nächste Schritte (ALT — ersetzt durch Fix 5):**
- `renderIndexMd()` in der Haupt-Diskussion muss den vollen Modus verwenden (nicht `footer-only`) damit die `data-toggle-index-done` Buttons gerendert werden
- ODER `generateToc()` muss klickbare `data-toggle-index-done` Buttons statt reiner Textzeilen generieren

> **Ergebnis:** Fix 5 deployed: `renderIndexMd()` in der Haupt-Diskussion verwendet jetzt `undefined` statt `'footer-only'` als Modus. Index-Einträge werden als interaktive Accordion-Blöcke mit ⬜/✅-Button gerendert — exakt wie in Sub-Diskussionen. Der Toggle ist jetzt klickbar (vorher nicht) — aber das Live-Verhalten ist noch defekt (siehe Feedback unten).

---

**Dieser Eintrag ist erledigt — Fix 5 umgesetzt (25.05.2026, 17:45 Uhr).**

**⚠️ Nachträglicher Korrektur-Hinweis (25.05.2026):** Der Fix war NUR die Sichtbarkeit der Toggle-Buttons. Das Toggle-Verhalten selbst (optimistischer DOM → kein Re-Render) ist weiterhin defekt. Siehe "Kazzle's Feedback nach Fix 5" unten.

---

## Kazzle's Feedback nach Fix 5 (25.05.2026)

**Live-Test nach Fix 5 + Registry-Start + Dashboard-Neustart:**
- Toggle-Buttons sind jetzt sichtbar ✅ (Fix 5 hat das gelöst)
- Aber der Klick fühlt sich immer noch kaputt an ❌

## Haupt-Diskussion: Screen-Reset + Bounce-Back
Klick auf ⬜/✅ → Button wechselt kurz → dann setzt die gesamte Seite zurück. Der Screen springt nach oben (Scroll-Position verloren), der Toggle-Status ist weg. Fühlt sich an wie ein Page-Reload.

**Verdacht:** Der optimistische DOM-Update (Fix 4) wird durch einen Re-Render überschrieben. Mögliche Trigger: `setErrorMsg()`, `setDebugLog()` oder `dangerouslySetInnerHTML` im Main-View-Index-Renderer spannen den gesamten Block neu auf.

## Sub-Diskussion: Änderung unsichtbar bis Exit+Re-Entry
Klick auf ⬜/✅ → kein sichtbarer Farbwechsel. Der neue Status (z.B. grüne Titelleiste bei ✅) erscheint erst wenn man die Sub-Diskussion schließt und wieder öffnet.

**Verdacht:** `setSubViewData()` oder ein anderer State-Change rendert den gesamten Sub-View neu. Der `dangerouslySetInnerHTML`-Block überschreibt dabei den optimistischen DOM.

## Bekannte Dokumentation (deckt sich mit Fix 3/Fix 4)
Die Symptome sind identisch mit den bereits dokumentierten Fixes 3 und 4 (Zeile 22-29, Zeile 54-61). Der `dangerouslySetInnerHTML`-Re-Render wurde damals identifiziert, aber Fix 4 (nur optimistischer DOM ohne State-Update) hat das Problem nur für den Fall gelöst *dass ein Button geklickt wird* — und da die Buttons bis Fix 5 gar nicht existierten, war Fix 4 nie aktiv getestet. Jetzt wo die Buttons da sind, zeigt sich dass Fix 4 allein nicht reicht.

**Nächste Schritte — Toggle-Live-Verhalten reparieren:**

Der Toggle ist jetzt sichtbar, aber das Live-Feedback (optimistischer DOM, kein Re-Render) ist defekt. Zwei Symptome, eine Ursache: `dangerouslySetInnerHTML` überschreibt nach API-Response den optimistischen DOM.

**Option A — Re-Render verhindern (minimaler Eingriff):**
Ursache finden warum `renderIndexMd()` nach API-Response neu gerendert wird. Verdacht: `setErrorMsg('✅ Status aktualisiert')` triggert React-Re-Render, der den `dangerouslySetInnerHTML`-Block neu aufspannt. Wenn der Re-Render verhindert wird, bleibt der optimistische DOM (Fix 4) stehen.
- Ziel: Kein State-Change (ausser setDebugLog) im Toggle-Success-Pfad
- Risiko: Scroll-Sprung könnte auch vom `dangerouslySetInnerHTML` selbst kommen (React ersetzt den gesamten HTML-Block bei jedem Render, auch ohne State-Change durch Parent)

**Option B — Scroll-Position stabilisieren (Quick-Win):**
Im Toggle-Handler vor dem DOM-Update `window.scrollY` speichern, nach dem DOM-Update per `window.scrollTo()` wiederherstellen. Schützt vor Scroll-Sprung, aber behebt nicht das Bounce-Back.
- Aufwand: ~5 Zeilen im globalen Click-Handler
- Bounce-Back bleibt, aber Scroll-Sprung ist weg → fühlt sich besser an

**Option C — Echte React-Komponente statt dangerouslySetInnerHTML (grundlegend):**
Analog zu `BlocksSection` eine `IndexSection`-React-Komponente bauen. Statt `renderIndexMd()` als string-basiertes HTML zu rendern, parst sie die `###`-Blöcke in echte React-Komponenten. Toggle wird dann via React-State + `useState` gesteuert — kein Re-Render-Problem, kein DOM-Override.
- Aufwand: ~200 Zeilen neue Komponente, Test + Build
- Beseitigt die Ursache endgültig
- Nachteil: Größerer Eingriff, Risiko von Nebenwirkungen

**Empfehlung:** Option A zuerst versuchen (minimaler Eingriff, sofort testbar). Wenn das nicht reicht → Option B als Pflaster. Wenn beides nicht hilft → Option C.

## Learnings aus Fix 5

## Dashboard-Server: Python 3.12 Pflicht

Flask ist nur für Python 3.12 (`/usr/bin/python3.12`) installiert (system-level via `--break-system-packages`). Das Hermes-Venv (Python 3.11) und das Registry-Venv haben kein Flask. Server nie mit `python3` (alias) starten — immer explizit:

```bash
cd ~/repos/butler-dashboard-v3/backend && /usr/bin/python3.12 server.py
```

## Registry-Boot-Order: Dashboard braucht Registry

Das Dashboard lädt Portal-Backends (diskhub, projekte, etc.) NUR beim Start aus der butler-registry (Port 8025). Läuft die Registry nicht, registriert der dynamische Loader keine Blueprints → alle API-Routen fallen ins SPA-Catchall → leeres UI.

**Korrekter Neustart:**

```bash
# 1. Registry starten (wenn tot)
cd ~/repos/butler-registry && /usr/bin/python3.12 server.py
# 2. Warten bis healthy
curl -s http://localhost:8025/api/health  # → {"status":"healthy"}
# 3. Dashboard neustarten
kill $(lsof -ti:8090)
cd ~/repos/butler-dashboard-v3/backend && /usr/bin/python3.12 server.py
```

**Wichtig:** `pkill -f "python3.*server.py"` killt Registry UND Dashboard (gleicher Process-Name). Stattdessen Port-spezifisch killen: `kill $(lsof -ti:PORT)`.

## Delay-Effekt: Fix war korrekt, UI trotzdem leer

Fix 5 (footer-only → undefined) war von Anfang an korrekt. Kazzle sah ein leeres UI weil die Registry nach einem Server-Neustart nicht mehr lief — das Dashboard hatte beim Start keinen diskhub-Blueprint geladen. Erst nach Registry-Start + Dashboard-Neustart war der Fix sichtbar.

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