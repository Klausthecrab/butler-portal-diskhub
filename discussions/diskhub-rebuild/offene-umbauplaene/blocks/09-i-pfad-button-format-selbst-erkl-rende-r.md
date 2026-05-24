### #I: Pfad-Button-Format — Selbst-erklärende Referenz für KI-Sessions
*— · 24.05.2026*

> **Quelle:** diskhub-rebuild#box-18 (pfad button in diskhub)

**Ziel:**
Der 🔗-Button in Textboxen, Bild-Blöcken, Sub-Diskussionen und index.md-Einträgen kopiert einen String in die Zwischenablage, der einer frischen KI-Instanz auf Anhieb sagt:
1. Um welche Diskussion geht es?
2. Welche Hierarchie-Ebene / welcher Element-Typ (Textbox, Sub-Diskussion, index-Eintrag, Bild)?
3. Welche Position innerhalb der Diskussion?
4. Worum geht es inhaltlich?
→ Ohne dass die KI raten, suchen oder zusätzlichen Kontext brauchen muss.

**Max' Vision (aus der Diskussion):**
- Eine kompakte, einheitliche Notation, die sowohl Menschen als auch KI verstehen
- Der kopierte String ist KEIN Prompt und KEINE Anweisung — nur eine präzise Referenz
- Die Notation kodiert die Hierarchie: Ist das Element eine Textbox (flach), eine Sub-Diskussion (Ordner) oder ein index.md-Eintrag (Sonderrolle)?
- Die Nummer/ID ist stabil: Einmal vergeben, nie wieder verwendet — auch wenn das Element später gelöscht wird
- Keine mehrzeiligen Strings — einzeilig, kompakt, sofort erfassbar
- Der gleiche Mechanismus funktioniert für alle Element-Typen (Textbox, Bild, Sub, index-Eintrag)

**Vorschlag (zu diskutieren):**

| Element-Typ | Format | Beispiel |
|---|---|---|
| Textbox | `<diskussion> > box-<nr> "<titel>"` | `diskhub-rebuild > box-18 "pfad button in diskhub"` |
| Bild | `<diskussion> > img-<nr> "<titel>"` | `diskhub-rebuild > img-1 "Bild-Rendering Fix #38"` |
| Sub-Diskussion | `<diskussion>/<sub-slug>` | `diskhub-rebuild/offene-umbauplaene` |
| index.md-Eintrag | `<diskussion> > entry-<nr> "<titel>"` | `diskhub-rebuild > entry-31 "Pfad-Button für index.md"` |

Warum dieses Format:
- `>` trennt Hierarchie-Ebenen — sofort lesbar als "A > B"
- `box-`, `img-`, `entry-`, Sub-als-Pfad kodieren den Element-Typ
- Der Titel in Anführungszeichen ist ein Kurz-Kontext — kein Ratespiel mehr
- Kompakt: einzeilig, meist unter 100 Zeichen

**Nummern-Stabilität (wichtig!):**
Wenn eine Textbox gelöscht wird, bleibt ihre Nummer "gestorben" — keine neue Box bekommt `box-18`. Sonst verweisen alte Referenzen plötzlich auf einen anderen Inhalt.
- Technisch: blocks.md bekommt Platzhalter oder die Nummer wird nie neu vergeben
- Alternativ: UUIDs statt Index? (aber weniger lesbar)
- Fragen an Max: Reicht "nie neu vergeben" oder brauchen wir einen sichtbaren Platzhalter in blocks.md?

**Offene Fragen:**
- Soll das Format auch von Hermi-Kommandos geparst werden können (z.B. `/lies diskhub-rebuild > box-18`)?
- Brauchen index.md-Einträge das gleiche `entry-`-Format oder reicht der bestehende `#punkt-<nr>`-Anchor?
- Soll das Format später durch ein strukturierteres Schema ersetzt werden (z.B. `diskhub://`-URI)?

**Fortschritt (24.05.2026):**
- [x] `copyBoxLink()` in `Page.jsx` umgestellt: akzeptiert `headingText`, erzeugt `diskussion > box-<nr> "titel"` (bzw. `img-<nr>` für 📷-Blöcke)
- [x] Beide 🔗-Buttons (Textboxen + Bild-Blöcke) aktualisiert — rufen `copyBoxLink(idx, headingText)` auf
- [x] Title-Attribut zeigt Vorschau des kopierten Strings
- [x] Build OK (16.39s), Dashboard-Neustart, API 200
- [x] **Sub-Diskussionen 🔗 (#C):** Bereits implementiert — Button kopiert `diskhub-rebuild/offene-umbauplaene` (Zeile 1960)
- [x] **index.md-Einträge 🔗 (#B):** Bereits implementiert — Button kopiert `diskhub-rebuild > entry-31 "Titel"` via globalem Click-Handler (Zeile 403+2564)
- [ ] Nummern-Stabilität (Platzhalter bei Löschung) noch nicht implementiert
