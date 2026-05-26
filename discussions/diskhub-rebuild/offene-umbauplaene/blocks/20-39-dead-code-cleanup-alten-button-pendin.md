### #39: Alten 📷-Button entfernen + Platzhalter-Hinweis für Bild per STRG+V

*— · 26.05.2026 — Revision 1 (nach Kazzle-Feedback)*

> **Quelle:** Max (Feedback zu #37)
>
> **Nicht mehr gültig (Stand Revision 1):** Ursprünglich war geplant, die gesamte `pendingImage`-Logik zu entfernen.
> Nach Feedback: `pendingImage` + `onPaste` + Vorschau + `handleAddBox`-Branch **bleiben erhalten**.
> Nur eines stört: der 📷-Button in `addBoxActions` — der direkt wie ein eigener Upload-Modus aussieht.
>
> **Was wirklich passiert:**
> - 📷-Button (`addBoxImageBtn`) fliegt raus — das war ein überflüssiges UI-Element für etwas, das auch ohne Knopf per STRG+V geht
> - 🖼️-Button (ImageUploadModal) bleibt erhalten
> - STRG+V in Textarea (pendingImage-Logik) bleibt erhalten
>
> **Zusätzlicher Wunsch:** Im Textarea-Platzhalter ("Inhalt (Markdown)...") soll ein Hinweis stehen,
> dass Bilder per STRG+V eingefügt werden können — z.B. `"Inhalt (Markdown) — Bilder per STRG+V einfügen"`
> oder ähnlich knapp formuliert.

**Sub-Punkte:**
- [ ] **C.05** — `addBoxImageBtn` (📷) aus addBoxActions beider Views (Sub + Main) entfernen
- [ ] **C.07b** — `.addBoxImageBtn`-CSS-Klasse aus Page.module.css entfernen (optional, 🖼️-Button nutzt sie noch)
- [ ] **C.09** — Platzhalter-Text der Textarea aktualisieren auf z.B. `"Inhalt (Markdown) — Bilder per STRG+V"`
- [ ] **C.08** — Build + Rest + Health-Check

**Gelöschte Sub-Punkte (nicht mehr gewünscht):**
- ~~C.01 — pendingImage-State entfernen~~ ❌ bleibt
- ~~C.02 — onPaste entfernen~~ ❌ bleibt
- ~~C.03 — Vorschau-Block entfernen~~ ❌ bleibt
- ~~C.04 — File-Input entfernen~~ ❌ bleibt
- ~~C.06 — handleAddBox vereinfachen~~ ❌ bleibt
- ~~C.07 — CSS-Klassen pendingImagePreview usw. entfernen~~ ❌ bleiben

**Tests:**
- [ ] **T.01** — 🖼️-Button öffnet weiterhin ImageUploadModal (kein Regression)
- [ ] **T.02** — STRG+V in Textarea funktioniert weiterhin (pendingImage-Logik intakt)
- [ ] **T.03** — Textbox ohne Bild funktioniert (JSON-Submit)
- [ ] **T.04** — Build fehlerfrei

**Fortschritt (26.05.2026):**
- [x] **C.05** — 📷-Button aus addBoxActions beider Views entfernt (Sub-View Zeilen 2144-2150, Main-View Zeilen 2438-2444). 🖼️-Button bleibt erhalten.
- [x] **C.09** — Alle 4 Platzhalter von `"Inhalt (Markdown)..."` auf `"Inhalt (Markdown) — Bilder per STRG+V"` aktualisiert (editBlockModal ×2, addBox Sub-View, addBox Main-View)
- [-] **C.07b** — Übersprungen, weil 🖼️-Button noch `addBoxImageBtn`-CSS-Klasse nutzt
- [x] **C.08** — Build 16.07s ✅, Health-Check: `{"discussions_count": 6, "status": "ok"}`