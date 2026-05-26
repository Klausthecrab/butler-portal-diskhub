### #35: Lightbox für Bilder

*— · 22.05.2026*

> **Quelle:** Max (Diskussion #28 Bild-Upload)
>
> **Sub-Punkte:**
> - [ ] **L.01** — CSS für `.blockContent img` / `.markdownContent img`: max-height + zoom-in-Cursor
> - [ ] **L.02** — Lightbox-Komponente: onClick → Overlay mit Bild in Originalgröße
> - [ ] **L.03** — Beispielbild in Diskussion eintragen (z.B. Screenshot) um die Lightbox zu demonstrieren

---

## Plan L.01 — CSS für Bild-Skalierung

**Status: ✅ Bereits umgesetzt — doppelte Regel bereits entfernt**

Die CSS-Regeln existieren bereits in `Page.module.css`:

- `.blockContent img` (Z. 1078): `max-width: 100%; max-height: 400px; object-fit: contain; cursor: zoom-in; border-radius: 8px; border: 1px solid #334155; margin: 8px 0;`
- `.markdownContent img` (Z. 1844): Gleiche Regeln nochmal

**Status der Unterpunkte (26.05.2026):**
- ❌ Doppelte `.markdownContent img`-Regel — **existiert nicht mehr,** bereits entfernt bei früherem Edit. OK.
- ✅ `.chatImage` hat bereits `cursor: zoom-in` + `object-fit: contain`. Nichts zu tun.

**Fortschritt (26.05.2026):**
- [x] L.01 verifiziert: Keine doppelten Regeln, alle img-Regeln haben korrekte Properties ✅
- [ ] L.02 — Lightbox-Komponente (🔜 als nächstes)
- [ ] L.03 — Beispielbild (🔜 nach L.02)

**Zielbedingung:** Jedes `<img>` im Content-Bereich hat `max-height: 400px` + `cursor: zoom-in`. Keine doppelten CSS-Regeln.

---

## Plan L.02 — Lightbox-Komponente

**Status: ✅ Bereits vollständig implementiert (26.05.2026)**

Alle Komponenten bereits vorhanden:
- `lightboxImage`-State in Page-Komponente (Z. 2883) ✅
- Globaler Click-Handler im useEffect mit Event-Delegation (Z. 2908-2929) ✅
  - Prüft `img.closest('[class*="imageModal"]')` (kein Triggger im ImageUpload-Modal)
  - Prüft `img.closest('[class*="lightbox"]')` (kein Endlos-Loop)
  - Setzt `setLightboxImage(img.src)` ✅
- Overlay-JSX im Return (Z. 2968-2976) ✅
- Alle 5 CSS-Klassen in Page.module.css (Z. 2313-2356) ✅

**Fortschritt (26.05.2026):**
- [x] L.01 — CSS-Skalierung: bereits korrekt, kein Handlungsbedarf ✅
- [x] L.02 — Lightbox-Komponente: **komplett implementiert** ✅
- [ ] L.03 — Beispielbild: 🔜 noch zu erledigen

`renderMarkdown()` liefert HTML-Strings, die via `dangerouslySetInnerHTML` eingesetzt werden. React-Click-Handler direkt auf `<img>` sind in dem Modus nicht möglich. Stattdessen: **ein globaler Click-Listener auf Container-Ebene**.

**Schritte:**

1. **State in Page-Komponente (`App`) ergänzen:**
   ```js
   const [lightboxImage, setLightboxImage] = useState(null) // null = zu, URL = geöffnet
   ```

2. **Event-Delegation in der Container-Div:**
   - Auf dem Container (der `blockContent`/`markdownContent`-Div) einen `onClick`-Handler
   - Prüft `e.target.tagName === 'IMG'` und `e.target.closest('.blockContent, .markdownContent')`
   - Falls ja: `setLightboxImage(e.target.src)` — nativ, da die Bild-URLs von Discord-CDN/Uploads kommen

3. **Lightbox-Overlay (React-Komponente in Page.jsx):**
   ```jsx
   {lightboxImage && (
     <div className={styles.lightboxOverlay} onClick={() => setLightboxImage(null)}>
       <div className={styles.lightboxContainer} onClick={e => e.stopPropagation()}>
         <button className={styles.lightboxClose} onClick={() => setLightboxImage(null)}>✕</button>
         <img src={lightboxImage} alt="" className={styles.lightboxImage} />
       </div>
     </div>
   )}
   ```

4. **CSS in Page.module.css:**
   - `.lightboxOverlay`: `position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; display: flex; align-items: center; justify-content: center; cursor: pointer;`
   - `.lightboxContainer`: `position: relative; max-width: 90vw; max-height: 90vh; display: flex; align-items: center; justify-content: center;`
   - `.lightboxClose`: `position: absolute; top: -40px; right: 0; background: none; border: none; color: white; font-size: 28px; cursor: pointer;`
   - `.lightboxImage`: `max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: 4px;`

5. **Event-Delegation an den richtigen Stellen einbauen:**
   - In `BlocksSection` (Z. ~891): `onClick` auf die Container-Div mit `className={styles.blockContent}`
   - Bei `markdownContent`-Stellen (Z. ~730, ~977, ~1907, etc.)
   - Alternativ: Einmal auf `document` lauschen — einfacher, da nicht jede Stelle einzeln umgebaut werden muss

**Zielbedingung:** Klick auf skaliertes Bild → dunkler Overlay mit Original-Bild. Schließen per ✕ oder Klick außerhalb. Keine Backend-Änderung.

---

## Plan L.03 — Beispielbild

**Schritte:**
1. Screenshot einer DiskHub-Diskussion erstellen (z.B. `curl -s http://192.168.178.62:8090/diskhub/` → Browser-Screenshot)
2. Über den bestehenden ImageUpload-Modal in eine Textbox hochladen
3. Die generierte Markdown-Referenz (`![](url)`) in die Textbox #35 einfügen
4. Verifikation: Bild erscheint mit max-height, Klick öffnet Lightbox

**Zielbedingung:** Ein sichtbares skalierbares Bild in der Textbox #35, bei dem Klick die Lightbox öffnet.
