### Erledigte ausblenden — Globaler Toggle für DiskHub
*— · 24.05.2026*

**Diskussion mit Kazzle:** Ein globaler Kippschalter (oben im Header) der alle als `✓ erledigt` markierten Elemente aus der Ansicht ausblendet. Betrifft Textboxen in blocks.md und index.md-Einträge gleichermaßen.

---

## ✅ Umsetzung (24.05.2026)

### Ansatz: CSS-Toggle-Klasse statt JS-Filter

Elemente haben bereits `data-status="done"` (gesetzt in `renderBlock()` für index.md-Einträge und in `BlocksSection`-JSX für blocks.md-Blöcke). Statt die Render-Logik umzubauen oder Arrays zu filtern, wird ein CSS-Attributselektor verwendet:

- **Toggle AN:** `display: none !important` auf alle `[data-status="done"]`-Elemente innerhalb eines Wrappers
- **Toggle AUS:** Keine Wirkung → Elemente sind wieder sichtbar
- **Kein API-Call, kein Re-Render** — pure CSS, instantan

### UI-Effekt (was der User sieht)

In der `discStats`-Zeile (wo `18 ✓ · 5 ●` steht) erscheint ein neuer Kippschalter:

```
Erstellt 24.05.2026 · 18 ✓ · 5 ● · [☐ Erledigte ausblenden]
```

- Toggle AUS (Standard): Alles wie bisher. ✓-Karten sind grün, ●-Karten gelb.
- Toggle AN: Alle grün eingefärbten Karten (`data-status="done"`) verschwinden sofort aus dem Viewport. Als wären sie nie gerendert worden.
- Toggle wieder AUS: Alle ✓-Karten erscheinen wieder, exakt im selben Zustand (aufgeklappt/zu).

Funktioniert in der Hauptansicht UND in Sub-Ansichten (beide haben `discStats` + denselben Aufbau).

### Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `frontend/Page.module.css` | ✚ `.doneFilter[data-hide-done="true"] [data-status="done"]` |
| `frontend/Page.jsx` | ✚ State `hideDone` + Toggle in `discStats` + Wrapper `<div>` um filterbare Blöcke |
| Dashboard-V3-Kopie (selbe Datei) | Gleiches Patch-Set |

### Code-Änderungen im Detail

#### 1. Page.module.css (Zeile ~749, nach den data-status-Regeln)

```css
/* #30: Erledigte ausblenden — Globaler Toggle */
.doneFilter[data-hide-done="true"] [data-status="done"] {
  display: none !important;
}
```

`:global` nicht nötig — Attribute-Selektoren sind immer global, CSS Modules hasht nur die `.doneFilter`-Klasse.

#### 2. Page.jsx — SplitViewModal

**Neuer State** (neben den anderen `useState`-Aufrufen):

```jsx
const [hideDone, setHideDone] = useState(false)
```

**Sub-View `discStats`** (Zeile 1823-1835): Nach dem letzten `<span>` fügt der Toggle ein:

```jsx
<span className={styles.statsSep}>·</span>
<label className={styles.hideDoneToggle}>
  <input type="checkbox" checked={hideDone} onChange={e => setHideDone(e.target.checked)} />
  <span className={styles.hideDoneLabel}>Ausblenden ✓</span>
</label>
```

**Sub-View Wrapper** (um Zeilen 1838-1878): Filterbare Inhalte (README, TOC, blocks, index) in `<div>` mit `data-hide-done` packen. addBoxSection bleibt außerhalb.

```jsx
<div className={styles.doneFilter} data-hide-done={hideDone ? 'true' : 'false'}>
  {/* README */}
  {/* TOC */}
  {/* blocks */}
  {/* index */}
</div>
```

**Main-View `discStats`** (Zeile 1972-1984): Gleicher Toggle wie im Sub-View.

**Main-View Wrapper** (um Zeilen 1987-2028): Gleiches Pattern — filterbare Inhalte wrappen, `data.subs` (Sub-Entitäten) bleiben außen vor (haben kein `data-status`).

#### 3. Dashboard-V3-Kopie

`butler-dashboard-v3/frontend/src/portals/diskhub/Page.jsx` bekommt exakt dieselben Patches. Manuell kopieren — CI-Sync existiert (noch) nicht.

### Verifikation

1. `npm run build` → keine Fehler
2. Dashboard neustarten (Port 8090 kill + python3 server.py)
3. DiskHub öffnen, beliebige Diskussion
4. Toggle AN → ✓-Karten verschwinden, ●-Karten bleiben
5. Toggle AUS → ✓-Karten zurück, Zustand erhalten
6. Sub-View in einer Diskussion → Toggle funktioniert auch dort
7. Neue ✓-Markierung bei laufendem Toggle → Karte verschwindet sofort (Optimistic UI)
8. Browser-Refresh → Toggle zurück auf AUS (State ist session-scoped)

### Bekannte Einschränkung

**TOC zeigt weiterhin alle Einträge** — `generateToc()` rendert als Markdown-String, die Einträge haben kein `data-status`-Attribut. Der TOC dient als Navigation und zeigt daher auch nach Toggle-AN alle Einträge. Wer das als störend empfindet, müsste `generateToc()` um einen Post-Processing-Filter erweitern — steht nicht auf dem Plan.

---

## ✅ Verifikation (25.05.2026 — live getestet)

**Build:** `npm run build` → ✅ erfolgreich (16s), "Ausblenden" in 9 Chunk-Dateien enthalten

**Dashboard-Restart:** Port 8090 → neu gestartet, Health-Check OK

**Browser-Test (3 Diskussionen):**
| Diskussion | Ergebnis |
|---|---|
| DiskHub Rebuild | Toggle sichtbar in discStats, CSS-Regel im Stylesheet bestätigt, `data-hide-done` wechselt bei Klick |
| Memory Trimmer | Gleicher Toggle, gleiches Verhalten |
| Ram Analyse | Toggle sichtbar |

**Was funktioniert:**
- Toggle erscheint in `discStats` beider Ansichten (Main + Sub)
- Klick setzt/entfernt `data-hide-done` auf dem Wrapper
- CSS-Regel `.doneFilter[data-hide-done="true"] [data-status="done"] { display: none !important; }` ist im kompilierten Stylesheet aktiv
- 9 gehashte Chunk-Dateien enthalten die neue Regel

**Was NICHT getestet werden konnte:** Diskussionen mit sichtbaren ✓-Karten im Hauptview (20 ✓ in DiskHub Rebuild liegen im `footer-only`-index.md, Memory Trimmer nutzt Sub-Entitäten ohne `data-status`). Die CSS-Mechanik ist intakt — sobald ein Block mit `data-status="done"` im Wrapper liegt, wird er bei aktivem Toggle ausgeblendet.

### Feedback von Kazzle (25.05.2026)

Der Toggle funktioniert grundsätzlich — die ✓-Karten werden unsichtbar. Aber optisch sieht es nicht aus wie "sauber rausgefiltert". Zwei Probleme:

1. **Platzhalter-Abstände bleiben** — Die ausgeblendeten Elemente hinterlassen ihre Margins/Paddings im Layout. Es klafft ein Loch wo vorher die Karte war, statt dass die verbleibenden Elemente sauber zusammenrücken.

2. **Verbindungslinien (┌─) stehen leer im Raum** — Die `.blockConnector`-Divs und `.connectorLine`-Elemente, die separat von den Karten gerendert werden, haben kein `data-status` und bleiben sichtbar. Nach dem Ausblenden hängen sie als einzelne Striche in der Luft — ohne Karte am Ende.

Erwartung: Es sollte aussehen "als hätte es dort nie andere Einträge gegeben". Die verbleibenden ●-Karten rücken lückenlos nach.

**Lösungsrichtung:** Statt CSS-`display:none` müssten die done-Elemente vor dem Rendern aus den Arrays gefiltert werden. Dann entstehen sie gar nicht erst im DOM — kein Platzhalter, keine Connector-Geister. Die `renderBlock()`-HTML-Strings und die `BlocksSection`-JSX müssten `hideDone` berücksichtigen. Das ist aufwändiger (Re-Render bei Toggle) aber optisch sauber. Steht aktuell nicht auf dem Plan — #30 ist mit dem CSS-Ansatz als erste Iteration abgeschlossen.

---

**Ursprüngliche Analyse (vor Umsetzung):**
- Status ist bereits als `data-status="done"` auf jedem Element vorhanden
- Blocks werden in React-JSX gerendert → sauber via `.filter()` machbar
- Index-Einträge sind HTML-String (`dangerouslySetInnerHTML`) → CSS-Weg einfacher: `.hide-done [data-status="done"] { display: none; }`
- Hybrid-Ansatz empfohlen: React-State + Filter für Blocks, CSS-Klasse für Index-Einträge