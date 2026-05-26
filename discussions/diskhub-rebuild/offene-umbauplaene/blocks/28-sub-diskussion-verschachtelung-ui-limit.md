### #50: Sub-Diskussion-Verschachtelung — UI zeigt keine Sub-Subs an (✓ erledigt)

*— · 25.05.2026*

**Problem**
Sub-Diskussionen, die innerhalb einer anderen Sub-Diskussion liegen (Sub-Subs), werden vom Frontend nicht im UI angezeigt. Der Sub-View ("Vollständige Ansicht") zeigt README, Blocks und Index der Sub-Diskussion — aber nicht deren eigene Sub-Diskussionen als Akkordeons.

**Ursache**
Das Backend (routes.py, Z. 600–621) scannt **immer** den aktuellen `folder` nach Sub-Ordnern — auch wenn `sub_id` gesetzt ist. Es liefert also korrekt Sub-Subs im `subs`-Array. Das Frontend (Page.jsx) rendert `data.subs` aber nur in der Haupt-Ansicht (Z. 2056–2148). Der Sub-View (Z. 1824–1899) hat keine Render-Schleife für `subViewData.subs`.

**Lösungsvorschlag**

**Teil 1: Sub-Akkordeon im Sub-View (Page.jsx, nach Z. 1899)**

Das existierende Pattern aus der Haupt-Ansicht (Z. 2056–2148) in den Sub-View übernehmen:

```jsx
{/* ── SUB-SUBS (verschachtelte Diskussionen) ── */}
{subViewData.subs && subViewData.subs.length > 0 && (
  <div className={styles.subsSection}>
    <div className={styles.sectionLabel}>📂 Sub-Diskussionen</div>
    {subViewData.subs.map((sub, idx) => {
      const subNum = String(idx + 1).padStart(2, '0')
      const isExpanded = expandedSubs.has(sub.id)
      const subDate = parseCreatedDate(sub.readme)
      return (
        <div key={sub.id} className={styles.blockWrapper}>
          <div className={styles.blockConnector}>
            <div className={styles.connectorTop}>
              <span className={styles.connectorDot}></span>
              <span className={styles.connectorLine}></span>
            </div>
            {subDate && (
              <div className={styles.connectorDate}>{subDate}</div>
            )}
          </div>
          <div className={styles.subDocBlock}>
            <div className={styles.subDocHeader}
              onClick={() => {
                setExpandedSubs(prev => {
                  const next = new Set(prev)
                  if (next.has(sub.id)) next.delete(sub.id); else next.add(sub.id)
                  return next
                })
              }}
              role="button" tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') {
                setExpandedSubs(prev => {
                  const next = new Set(prev)
                  if (next.has(sub.id)) next.delete(sub.id); else next.add(sub.id)
                  return next
                })
              }}}
            >
              <h3 className={styles.subDocTitle}>📂 #{subNum}: {readmeTitle(sub.readme) || sub.name}
                {sub.status?.erledigt > 0 && sub.status?.offen === 0 && (
                  <span className={`${styles.badge} ${styles.badgeDone}`}>✓ {sub.status.erledigt} erledigt</span>
                )}
                {sub.status?.offen > 0 && (
                  <span className={`${styles.badge} ${styles.badgeOpen}`}>● {sub.status.offen} offen</span>
                )}
              </h3>
              <button
                className={styles.copyLinkBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  const ref = discussion.id + '/' + activeSubView + '/' + sub.id
                  navigator.clipboard.writeText(ref)
                  onCopySub(sub.id)
                  setTimeout(() => onCopySub(null), 2000)
                }}
                title={'Referenz kopieren: ' + discussion.id + '/' + activeSubView + '/' + sub.id}
              >{copiedSub === sub.id ? '✅' : '🔗'}</button>
              <span className={styles.subDocArrow}>{isExpanded ? '▾' : '▸'}</span>
            </div>
            {isExpanded && (
              <div className={styles.subDocBody}>
                {(() => {
                  const toc = generateToc(sub.blocks, sub.index)
                  if (toc) {
                    return (
                      <div className={styles.markdownContent}
                        dangerouslySetInnerHTML={{ __html: toc }}
                      />
                    )
                  }
                  const preamble = extractPreamble(sub.readme)
                  if (preamble) {
                    return (
                      <div className={styles.markdownContent}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(preamble) }}
                      />
                    )
                  }
                  if (sub.readme) {
                    return (
                      <div className={styles.markdownContent}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(sub.readme) }}
                      />
                    )
                  }
                  return null
                })()}
                <div className={styles.subDocViewLink}
                  onClick={e => { e.stopPropagation(); window.history.pushState({subViewMode: true}, ''); setActiveSubView(sub.id) }}
                  role="button" tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') { window.history.pushState({subViewMode: true}, ''); setActiveSubView(sub.id) } }}
                >
                  → Vollständige Ansicht
                </div>
              </div>
            )}
          </div>
        </div>
      )
    })}
  </div>
)}
```

**Wichtig:** Der "Vollständige Ansicht"-Link setzt `activeSubView = sub.id`. Das triggert den API-Call (Z. 1112):  
`fetch(${API}/${discussion.id}?sub_id=${activeSubView})`  
Das Backend joint dann `DISCUSSIONS_DIR/discussion_id/sub_id` — also nur eine Ebene. Das funktioniert nicht für Sub-Subs, weil der Pfad `discussion_id/sub_ebene1/sub_ebene2` sein müsste.

**Teil 2: Backend-Änderung — sub_id → sub_path (routes.py)**

Statt `sub_id` als einfachen Namen nutzen wir `sub_path` als Pfad-Fragment. Der Join funktioniert identisch:

```python
# Zeile 496
sub_path = request.args.get('sub_path', '').strip()
# oder: sub_path = request.args.get('sub_id', '').strip()  # Abwärtskompatibel

# Zeile 498-499
if sub_path:
    folder = os.path.join(DISCUSSIONS_DIR, discussion_id, sub_path)
else:
    folder = os.path.join(DISCUSSIONS_DIR, discussion_id)
```

`os.path.join` kann beliebig viele Pfadteile:  
`os.path.join(DISCUSSIONS_DIR, "disk-a", "sub-x", "sub-y")` → funktioniert.

**Teil 3: Frontend API-Call anpassen (Page.jsx, Z. 1112)**

```jsx
// Aktuell: fetch(`${API}/${discussion.id}?sub_id=${encodeURIComponent(activeSubView)}`)
// Neu: Sub-Pfad-Hierarchie mitgeben
const currentSubPath = activeSubViewStack.length > 0 
  ? activeSubViewStack.join('/') + '/' + activeSubView
  : activeSubView
fetch(`${API}/${discussion.id}?sub_path=${encodeURIComponent(currentSubPath)}`)
```

Dafür braucht es einen **Sub-View-Stack** (z.B. `activeSubViewPath` als String, der beim Betreten einer Sub-Sub verlängert wird).

**Aufwand**
- Page.jsx: ~50 Zeilen neuer JSX-Code (Sub-Akkordeon) + ~10 Zeilen API-Call-Anpassung
- routes.py: 1 Zeile ändern (sub_id → sub_path, Name bleibt `sub_path` im Query)
- Keine neuen Abhängigkeiten, kein CSS-Neubau (Styles existieren)

**Alternative (Light)**
Sub-Akkordeon ohne "Vollständige Ansicht"-Link für Sub-Subs einbauen. Der Link wird nur angezeigt, wenn es die oberste Sub-Ebene ist. Kein Backend-Eingriff nötig.

**Umsetzung (25.05.2026)**
- Backend (routes.py): `sub_id` → `sub_path` Query-Parameter — `os.path.join` verarbeitet beliebig viele Pfad-Ebenen
- Frontend API-Call (Page.jsx Z. 1112): `?sub_id=` → `?sub_path=`
- Frontend Sub-View (Page.jsx Z. 1899–2000): Sub-Akkordeon mit Akkordeon-Toggle, Badges, Copy-Link und "Vollständige Ansicht"
- "Vollständige Ansicht" für Sub-Subs baut Pfad: `activeSubView + '/' + sub.id`
- `activeSubView` ist jetzt ein Pfad-String (z.B. `"28-sub-diskussion/low-prio-zurueckgestellt"`)
- Popstate schließt gesamten Sub-View (kein Stack — eine Ebene zurück folgt)

**Verifikation (25.05.2026)**
- Dashboard-Server neugestartet — Code live
- API-Test Hauptansicht (`/diskhub-rebuild`): funktioniert ✅
- API-Test Sub-View 1. Ebene (`?sub_path=offene-umbauplaene`): 13 Subs ✅
- API-Test Sub-Sub 2. Ebene (`?sub_path=offene-umbauplaene/low-prio-zurueckgestellt`): Textbox #34 sichtbar ✅
- API-Test Sub-Sub-Sub 3. Ebene (`?sub_path=offene-umbauplaene/low-prio-zurueckgestellt/test-verschachtelung`): Titel, Blocks, Index korrekt ✅
- KeyError `'index'` bei leerem `index/`-Ordner gefunden und gefixt (routes.py Z. 584–588)
- Textbox `#34: Diskussions-Struktur-Konzept / Archiv` von `offene-umbauplaene/blocks/` nach `low-prio-zurueckgestellt/blocks/` verschoben — taucht im Sub-Sub-View auf ✅
- Dummy-Diskussion `test-verschachtelung` als Sub-Sub-Sub angelegt — bestätigt 3-Ebenen-Verschachtelung ✅

**Limitation**
Browser-Zurück (Popstate) schließt den gesamten Sub-View — eine Ebene zurück aus Sub-Sub erfordert einen Navigation-Stack. Folgt bei Bedarf.

**Status**
✅ erledigt — umgesetzt + verifiziert (25.05.2026)