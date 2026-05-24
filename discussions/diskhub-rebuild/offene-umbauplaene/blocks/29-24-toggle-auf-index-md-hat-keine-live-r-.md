### #24 ⬜/✅-Toggle auf index.md hat keine Live-Rückmeldung
*— · 24.05.2026*

Der ⬜/✅-Status-Toggle auf index.md-Einträgen funktioniert technisch (API ✅, Speichern ✅), aber das UI reagiert nicht live. Man sieht den Button nicht von ⬜ auf ✅ springen, die Titelleiste färbt sich nicht um — erst nach F5 und erneuter Navigation. Das fühlt sich kaputt an.

**Erwartung:** Klick auf ⬜/✅ → sofortige visuelle Änderung (Button wechselt, Titelleiste färbt sich ein). Wie bei den Textboxen (blocks.md), wo das bereits flüssig funktioniert. Minimale Verzögerung ist OK, aber kein API-Call-Warten, kein F5, kein Neuladen der ganzen Daten.

**Lösungsrichtung:** Optimistic UI — den neuen Status sofort lokal rendern, API-Call im Hintergrund, bei Fehler zurücksetzen. Der aktuelle fetchDiscussionData()-Reload ist zu langsam, weil erst der Toggle, dann ein kompletter API-Refresh, dann Re-Render. Der Klick-Effekt geht im Lade-Spinner unter.
