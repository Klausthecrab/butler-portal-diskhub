### #24 ⬜/✅-Toggle auf index.md hat keine Live-Rückmeldung
*— · 24.05.2026*

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
