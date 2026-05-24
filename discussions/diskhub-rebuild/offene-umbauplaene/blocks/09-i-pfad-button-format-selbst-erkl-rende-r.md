### #I: Pfad-Button-Format — Selbst-erklärende Referenz für KI-Sessions
*— · 24.05.2026*

> **Quelle:** `diskhub-rebuild/blocks/09-pfad-button-format` — 🔗-Button-Format-Entscheidung

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

**Aktuelles Format (nach Phase 4):**

| Element-Typ | Format | Beispiel |
|---|---|---|
| Textbox | `<diskussion>/blocks/<name>` | `diskhub-rebuild/blocks/09-pfad-button-format` |
| Bild (📷-Block) | `<diskussion>/blocks/<name>` | `diskhub-rebuild/blocks/14-img-1-bild-rendering` |
| Sub-Diskussion | `<diskussion>/<sub-slug>` | `diskhub-rebuild/offene-umbauplaene` |
| index.md-Eintrag | `<diskussion>/index/<name>` | `diskhub-rebuild/index/00-01-datei-struktur` |

Vorteile des Pfad-Formats:
- Stabile Referenz: Datei-Name ändert sich nie, auch bei Löschung nicht
- Selbst-erklärend: Pfad kodiert Hierarchie (Diskussion → blocks/index → Datei)
- Einheitlich: Gleiches Schema für Textboxen, Bilder und index-Einträge
- Fallback: Diskussionen ohne blocks/- oder index/-Ordner verwenden weiterhin `> box-<nr>` / `> entry-<nr>`

**Nummern-Stabilität (wichtig!):**
Wenn eine Textbox gelöscht wird, bleibt ihre Nummer "gestorben" — keine neue Box bekommt `box-18`. Sonst verweisen alte Referenzen plötzlich auf einen anderen Inhalt.
- Technisch: blocks.md bekommt Platzhalter oder die Nummer wird nie neu vergeben
- Alternativ: UUIDs statt Index? (aber weniger lesbar)
- Fragen an Max: Reicht "nie neu vergeben" oder brauchen wir einen sichtbaren Platzhalter in blocks.md?

**Offene Fragen (teilweise durch Phase 4 beantwortet):**

- ~~Soll das Format auch von Hermi-Kommandos geparst werden können?~~ → **Noch offen.** Pfad-Format `diskussion/blocks/<name>` ist stabil genug für späteres Parsing.
- ~~Brauchen index.md-Einträge das gleiche `entry-`-Format?~~ → **Erledigt (Phase 4):** index.md-Einträge nutzen jetzt das gleiche Pfad-Format `diskussion/index/<name>`.
- ~~Soll das Format später durch ein strukturierteres Schema ersetzt werden?~~ → **Noch offen.** Aktuelles Pfad-Format ist pragmatisch und stabil.

**Fortschritt (24.05.2026):**
|- [x] `copyBoxLink()` in `Page.jsx` umgestellt: akzeptiert `headingText`, erzeugt `diskussion > box-<nr> "titel"` (bzw. `img-<nr>` für 📷-Blöcke) — **Phase 4: umgestellt auf Pfad-Format `diskussion/blocks/<name>`**
|- [x] Beide 🔗-Buttons (Textboxen + Bild-Blöcke) aktualisiert — rufen `copyBoxLink(idx, headingText)` auf
|- [x] Title-Attribut zeigt Vorschau des kopierten Strings
|- [x] Build OK (16.39s), Dashboard-Neustart, API 200
|- [x] **Sub-Diskussionen 🔗 (#C):** Bereits implementiert — Button kopiert `diskhub-rebuild/offene-umbauplaene` (Zeile 1960) — **unverändert, Pfad-Format war hier schon korrekt**
|- [x] **index.md-Einträge 🔗 (#B):** Bereits implementiert — Button kopiert `diskhub-rebuild > entry-31 "Titel"` via globalem Click-Handler (Zeile 403+2564) — **Phase 4: umgestellt auf `diskhub-rebuild/index/<name>`**
- [ ] Nummern-Stabilität (Platzhalter bei Löschung) noch nicht implementiert
