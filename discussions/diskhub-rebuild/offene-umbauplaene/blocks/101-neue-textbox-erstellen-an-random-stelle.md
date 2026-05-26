### neue textbox erstellen an random stelle
*— · 25.05.2026*

**Problem**
wird random irgendwo einsortiert "wo eine zahl frei ist" - wirkt zumindest so. 
erwartung: chronologisch. neue textbox erscheint "unten"

**Lösung**

### Konvention (ab sofort)

Neue Boxen kriegen immer die nächsthöhere Nummer — egal ob irgendwo Lücken klaffen. Keine alten Nummern wiederbeleben, keine Lücken füllen. Neue Box = ans Ende.

Konkret: `max(bestehende Nummern) + 1`. Aktuell höchste Nummer ist `105` → nächste neue Box wird `106`.

### Umsetzungsschritte

1. **Bestand aufnehmen (aktuell höchste Nummer ermitteln)**
   - `ls blocks/*.md | grep -oP '^\d+' | sort -n | tail -1`
   - Ergibt `max_n`. Nächste Box = `max_n + 1`.
   - ✅ Verifikation: Kommando ausführen, `max_n` notieren.

2. **Konvention in README.md der offene-umbauplaene verankern**
   - In `offene-umbauplaene/README.md` unter "Regeln" ergänzen:
     > **Nummerierung:** Neue Boxen kriegen immer `max_n + 1`. Nie alte Nummern wiederbeleben. Lücken bleiben Lücken. Neue Box = ganz unten.
   - ✅ Verifikation: README.md zeigt die Regel.

3. **Bestands-Check: Gibt es Boxen die gegen die Konvention verstoßen?**
   - Boxen sortiert nach Nummer listen: `ls blocks/*.md | sort -t/ -k2 -V`
   - Prüfen ob eine Box mit kleiner Nummer zwischen größeren liegt (z.B. `99-` zwischen `39-` und `100-`)
   - Falls ja: Liste der "Out-of-Order"-Boxen erstellen. Max entscheidet ob umsortiert oder ignoriert.
   - ✅ Verifikation: Entweder "Keine OoO-Boxen" oder konkrete Liste mit Nummern.

4. **Prüfung auf index/-Ordner ausweiten**
   - Gleicher Check in `index/`: `ls index/*.md | sort -t/ -k2 -V`
   - Aktuelle Größte: `105` → nächste `106`
   - ✅ Verifikation: index/-Boxen sauber aufsteigend? Falls nicht: Liste.

5. **Anwendung beim nächsten Anlegen einer neuen Box**
   - Neue Box bekommt `(max_n + 1)`-Präfix und landet durch `ls -v` chronologisch unten.
   - ✅ Verifikation: `ls -v blocks/*.md | tail -3` zeigt die neueste Box ganz unten.

**Fortschritt (26.05.2026):**
- [x] **Bestand aufnehmen** — blocks/ max_n=105, index/ max_n=34
- [x] **Konvention in README.md verankert** — unter `### Regeln` aufgenommen
- [x] **Bestands-Check blocks/:** Keine Out-of-Order-Boxen gefunden. Lücken bei 16, 27, 40-99 — laut Konvention bleiben die bestehen.
- [x] **Bestands-Check index/:** Keine Out-of-Order-Boxen gefunden. Aufsteigend von 07 bis 34.
- [ ] Nächste neue Box: blocks/ → 106, index/ → 35

**Status**
🔜 offen
