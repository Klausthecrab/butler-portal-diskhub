import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import styles from './Page.module.css'

const API = '/api/diskhub'

function timeAgo(ts) {
  if (!ts) return ''
  const now = Math.floor(Date.now() / 1000)
  const diff = now - ts
  if (diff < 60) return 'gerade eben'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return new Date(ts * 1000).toLocaleDateString('de-DE')
}

function parseTable(tableLines) {
  let headerRow = null
  const bodyRows = []
  let isHeader = true
  for (let t = 0; t < tableLines.length; t++) {
    const row = tableLines[t]
    if (/^\|[\s\-:]+\|$/.test(row)) { isHeader = false; continue }
    const cells = row.split('|').slice(1, -1).map(c => c.trim())
    if (isHeader) headerRow = cells
    else bodyRows.push(cells)
  }
  let html = '<table>'
  if (headerRow) html += '<thead><tr>' + headerRow.map(c => `<th>${c}</th>`).join('') + '</tr></thead>'
  if (bodyRows.length > 0) {
    html += '<tbody>'
    for (const row of bodyRows) html += '<tr>' + row.map(c => `<td>${c}</td>`).join('') + '</tr>'
    html += '</tbody>'
  }
  html += '</table>'
  return html
}

function renderMarkdown(md) {
  if (!md) return ''

  // Stage 0: Escape HTML entities
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Stage 1: Protect fenced code blocks
  const codeBlocks = []
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length
    codeBlocks.push({ lang, code })
    return `\x00CODEBLOCK${idx}\x00`
  })

  // Stage 2: Line-by-line block processing
  const lines = html.split('\n')
  const out = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // Code block placeholder — pass through
    if (line.includes('\x00CODEBLOCK')) { out.push(line); i++; continue }

    // Blockquote — collect consecutive > lines
    if (line.startsWith('> ')) {
      const quoteLines = []
      while (i < lines.length && lines[i].startsWith('> ')) { quoteLines.push(lines[i].slice(2)); i++ }
      out.push(`<blockquote>${quoteLines.join('\n')}</blockquote>`)
      continue
    }

    // Table — collect consecutive |...| lines
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines = []
      while (i < lines.length && lines[i].startsWith('|') && lines[i].endsWith('|')) { tableLines.push(lines[i]); i++ }
      out.push(parseTable(tableLines))
      continue
    }

    // Task list — - [x] or - [ ]
    const taskMatch = line.match(/^[-*]\s+\[([ x])\]\s+(.+)$/)
    if (taskMatch) {
      const items = []
      while (i < lines.length) {
        const m = lines[i].match(/^[-*]\s+\[([ x])\]\s+(.+)$/)
        if (!m) break
        const checked = m[1] === 'x'
        items.push(`<li class="${checked ? 'task-done' : 'task-pending'}"><input type="checkbox" ${checked ? 'checked' : ''} disabled />${m[2]}</li>`)
        i++
      }
      out.push(`<ul class="task-list">${items.join('')}</ul>`)
      continue
    }

    // Numbered list — 1. item
    const numMatch = line.match(/^\d+\.\s+(.+)$/)
    if (numMatch) {
      const items = []
      while (i < lines.length) {
        const m = lines[i].match(/^\d+\.\s+(.+)$/)
        if (!m) break
        items.push(`<li>${m[1]}</li>`)
        i++
      }
      out.push(`<ol>${items.join('')}</ol>`)
      continue
    }

    // Unordered list — - item (not a task)
    const ulMatch = line.match(/^[-*]\s+(.+)$/)
    if (ulMatch) {
      const items = []
      while (i < lines.length) {
        const m = lines[i].match(/^[-*]\s+(.+)$/)
        if (!m) break
        items.push(`<li>${m[1]}</li>`)
        i++
      }
      out.push(`<ul>${items.join('')}</ul>`)
      continue
    }

    // Headings
    if (line.startsWith('### ')) { out.push(`<h3>${line.slice(4)}</h3>`); i++; continue }
    if (line.startsWith('## ')) { out.push(`<h2>${line.slice(3)}</h2>`); i++; continue }
    if (line.startsWith('# ')) { out.push(`<h1>${line.slice(2)}</h1>`); i++; continue }

    // Horizontal rule
    if (/^---+$/.test(line)) { out.push('<hr />'); i++; continue }

    // Regular text line
    out.push(line)
    i++
  }

  html = out.join('\n')

  // Stage 3: Restore code blocks with language class
  html = html.replace(/\x00CODEBLOCK(\d+)\x00/g, (_, idx) => {
    const block = codeBlocks[parseInt(idx)]
    const langClass = block.lang ? ` class="language-${block.lang}"` : ''
    return `<pre><code${langClass}>${block.code}</code></pre>`
  })

  // Stage 4: Inline processing (safe — code blocks are placeholder-protected)
  html = html
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Stage 5: Smart paragraph wrapping — skip block elements
  const blockTags = ['<h1', '<h2', '<h3', '<ul', '<ol', '<li', '<table', '<pre', '<blockquote', '<hr', '<div']
  const paragraphs = html.split('\n\n')
  const wrapped = paragraphs.map(p => {
    const trimmed = p.trim()
    if (!trimmed) return ''
    const lines = trimmed.split('\n')
    const allBlocks = lines.every(l => {
      const t = l.trim()
      return !t || blockTags.some(tag => t.startsWith(tag))
    })
    return allBlocks ? trimmed : `<p>${trimmed}</p>`
  }).join('\n')

  return wrapped
}

function parseBlocksMd(md) {
  if (!md) return []
  const lines = md.split('\n')
  const blocks = []
  let current = null
  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (current) blocks.push(current)
      current = { heading: line, content: [] }
    } else if (current) {
      current.content.push(line)
    }
  }
  if (current) blocks.push(current)
  return blocks
}

function renderBlocksMd(md) {
  /** Einfacher Renderer für blocks.md:
   *  Jedes ### = Akkordeon-Block, Inhalt = Markdown, kein TOC/Status.
   */
  if (!md) return ''

  const lines = md.split('\n')
  const blocks = []
  let current = null

  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (current) blocks.push(current)
      current = { heading: line, content: [] }
    } else if (current) {
      current.content.push(line)
    }
  }
  if (current) blocks.push(current)

  if (blocks.length === 0) {
    // Fallback: kein ###-Kopf → als normalen Markdown rendern
    return renderMarkdown(md)
  }

  let html = '<div class="blocksList">'
  for (const block of blocks) {
    const title = block.heading.replace(/^###\s+/, '').trim()
    const content = block.content.join('\n').trim()
    html += '<details class="blockAccordion">'
    html += `<summary class="blockSummary">${title}</summary>`
    html += `<div class="blockBody">${renderMarkdown(content)}</div>`
    html += '</details>'
  }
  html += '</div>'
  return html
}

function generateToc(blocksMd, indexMd, subs = [], tocMode = 'all') {
  /** Generiert Mini-TOC aus blocks.md + index.md (nur ###-Überschriften) + subs-Array */
  if (!blocksMd && !indexMd && !subs.length) return ''

  const items = [] // { type: 'block'|'sub', title, href?, done }

  // Aus blocks.md — jeder ###-Block bekommt box-N ID
  if (blocksMd) {
    let boxIdx = 0
    for (const line of blocksMd.split('\n')) {
      if (line.startsWith('### ')) {
        const title = line.replace(/^###\s+/, '').replace(/\s*\|\|.*/, '').trim()
        if (title) items.push({
          type: 'block',
          title,
          href: `#box-${boxIdx}`,
          done: title.includes('✓ erledigt')
        })
        boxIdx++
      }
    }
  }

  // Aus subs-Array (statt ### Sub: aus index.md zu parsen)
  for (const sub of subs) {
    if (sub.id && sub.name) {
      const subDone = sub._done !== undefined ? sub._done : (sub.status?.erledigt > 0 && sub.status?.offen === 0)
      items.push({ type: 'sub', title: sub.name, href: `#sub-${sub.id}`, done: subDone })
    }
  }

  if (items.length === 0) return ''

  // Nach tocMode filtern
  let filtered = items
  if (tocMode === 'open') {
    filtered = items.filter(i => !i.done)
  } else if (tocMode === 'done') {
    filtered = items.filter(i => i.done)
  }

  if (filtered.length === 0) return ''

  let html = '<hr style="border:none;border-top:1px solid #2d3a4e;margin:24px 0 16px 0;opacity:0.5">'
  html += '<div class="miniToc">'
  html += '<div class="tocHeading" style="display:flex;align-items:center;justify-content:space-between">'
  html += '<span>📋 Inhaltsverzeichnis</span>'
  html += '<span style="display:flex;gap:6px;font-size:0.75rem">'
  for (const m of ['all', 'open', 'done']) {
    const label = m === 'all' ? 'Alle' : m === 'open' ? 'Nur Offene' : 'Nur ✅'
    const isActive = tocMode === m
    html += `<button onclick="window.__setTocMode('${m}')" style="background:${isActive ? '#334155' : 'transparent'};color:#cbd5e1;border:1px solid #475569;border-radius:4px;padding:2px 8px;cursor:pointer;font-weight:${isActive ? '600' : '400'}">${label}</button>`
  }
  html += '</span>'
  html += '</div>'
  for (const item of filtered) {
    let prefix
    if (item.done) {
      prefix = '✅ '
    } else {
      const isImage = item.title.startsWith('📷 ')
      prefix = item.type === 'sub' ? '🗂️ ' : isImage ? '📷 ' : '📝 '
    }
    const displayTitle = !item.done && item.title.startsWith('📷 ') ? item.title.replace(/^📷\s+/, '') : item.title
    html += `<div class="tocItem"><a href="${item.href}" class="tocLink" onclick="event.preventDefault();var t=document.querySelector('${item.href}');if(t){t.scrollIntoView({behavior:'smooth'});}">├── ${prefix}${displayTitle}</a></div>`
  }
  html += '</div>'
  html += '<hr style="border:none;border-top:1px solid #2d3a4e;margin:16px 0 24px 0;opacity:0.5">'
  return html
}

// Block-aware rendering for index.md — drei Zonen: Header, Content, Footer
function renderIndexMd(md, mode, discussionId, indexFiles, hideDone = false) {
  if (!md) return ''

  if (mode === 'footer-only') {
    // Nur den Footer rendern (alles nach der letzten ---)
    const parts = md.split('\n---\n')
    if (parts.length < 2) return ''
    const footer = parts[parts.length - 1].trim()
    if (!footer) return ''
    return renderMarkdown(footer)
  }

  const lines = md.split('\n')
  let result = ''
  let currentBlock = null
  const preamble = []
  const blocks = [] // Alle geparsten Blöcke für TOC-Generierung

  for (const line of lines) {
    // Leerzeilen überspringen (kein semantischer Inhalt)
    const trimmed = line.trim()
    if (trimmed === '---' || trimmed === '___' || trimmed === '***') {
      // Horizontaler Strich: finalisiert aktuellen Block, reset zu preamble
      if (currentBlock) {
        blocks.push(currentBlock)
        currentBlock = null
        continue // Struktur-Trenner zwischen Blöcken — nicht sichtbar rendern
      }
      // Kein offener Block → Zeile normal in preamble belassen
    }
    if (line.startsWith('### ')) {
      // Vorherigen Block finalisieren
      if (currentBlock) {
        blocks.push(currentBlock)
      } else if (preamble.length > 0) {
        // Erster Block — preamble vorher rendern
        result = renderMarkdown(preamble.join('\n'))
      }
      currentBlock = {
        heading: line,
        content: [],
        footnote: '',
      }
    } else if (currentBlock) {
      // Prüfen auf Fußnote: *session:...* oder *Fußnote:...*
      const footnoteMatch = line.match(/^\*(session:|Fußnote:).+\*$/)
      if (footnoteMatch) {
        currentBlock.footnote = line
      } else if (line.startsWith('> **Ergebnis:**')) {
        currentBlock.result = line
      } else {
        currentBlock.content.push(line)
      }
    } else {
      preamble.push(line)
    }
  }

  // Letzten Block finalisieren
  if (currentBlock) {
    blocks.push(currentBlock)
  }

  // Letzten offenen Block finden für Rot-Akzent (L.7)
  let latestOpenIndex = -1
  for (let bIdx = blocks.length - 1; bIdx >= 0; bIdx--) {
    const b = blocks[bIdx]
    const bIsDone = !!b.result || b.heading.includes('(✓ erledigt)')
    if (!bIsDone) {
      latestOpenIndex = bIdx
      break
    }
  }

  // Alle Blöcke rendern
  for (let bIdx = 0; bIdx < blocks.length; bIdx++) {
    const block = blocks[bIdx]
    // #30: done-Blöcke überspringen wenn hideDone aktiv — verhindert Geister-Connector-Linien
    if (hideDone) {
      const bIsDone = !!block.result || block.heading.includes('(✓ erledigt)')
      if (bIsDone) continue
    }
    result += renderBlock(block, bIdx === latestOpenIndex, bIdx, discussionId, indexFiles)
  }

  // Rest-Preamble nach allen Blöcken anhängen (Sub-Referenzen, Footer)
  if (preamble.length > 0) {
    result += renderMarkdown(preamble.join('\n'))
  }

  return result
}

function renderBlock(block, isHot, blockIdx, discussionId, indexFiles) {
  const heading = block.heading.substring(4).trim() // "### " entfernen
  const content = block.content.join('\n').trim()
  const footnote = block.footnote || ''
  const result = block.result || ''

  const isSub = heading.startsWith('Sub:')
  // Status-Marker aus Heading entfernen (von alter Formatierung)
  const headingClean = heading.replace(/ \((✓ erledigt|● offen)\)$/, '')
  const cleanHeading = isSub ? headingClean.substring(4).trim() : headingClean

  // 🔗 Referenz für index.md-Einträge (#B)
  const entryLabelMatch = cleanHeading.match(/^#(\d+|[A-Z]):?\s*/)
  const entryNr = entryLabelMatch ? entryLabelMatch[1] : String(blockIdx)

  // Prüfen ob Block erledigt (Ergebnis-Zeile vorhanden oder alter Status)
  const hasResult = !!block.result || heading.includes('(✓ erledigt)')

  // Datum aus Fussnote extrahieren fuer Connector (E.6)
  let footnoteDate = ''
  if (footnote) {
    const cleanF = footnote.replace(/^\*|\*$/g, '').trim()
    // Direktes Datums-Pattern: DD.MM.YYYY
    let m = cleanF.match(/(\d{2}\.\d{2}\.\d{2,4})/)
    if (m) {
      footnoteDate = m[1]
    } else {
      // Fallback: YYYYMMDD aus Session-ID extrahieren
      m = cleanF.match(/(\d{4})(\d{2})(\d{2})/)
      if (m) {
        const y = parseInt(m[1]), mo = parseInt(m[2]), d = parseInt(m[3])
        if (mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
          footnoteDate = `${String(d).padStart(2,'0')}.${String(mo).padStart(2,'0')}.${y}`
        }
      }
    }
  }

  // Inline-Escaping für den Heading-Text
  const escapedHeading = cleanHeading
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  // 🔗 Referenz für index.md-Einträge (#B) — nach escapedHeading
  // #H: Pfad-Format für index/-Ordner (Phase 4 F.02), Fallback auf entry-NR für alte Diskussionen
  const fileSlug = indexFiles && indexFiles[blockIdx]?.name
  const escapedRef = fileSlug
    ? discussionId + '/index/' + fileSlug
    : discussionId + ' > entry-' + entryNr + ' "' + escapedHeading.replace(/"/g, '&quot;') + '"'

  // Zwei-Titel-System für Accordion (L.6): "Frage || Aussage"
  let titleQuestion = escapedHeading
  let titleStatement = ''
  const separatorIndex = escapedHeading.indexOf(' || ')
  if (separatorIndex >= 0) {
    titleQuestion = escapedHeading.slice(0, separatorIndex).trim()
    titleStatement = escapedHeading.slice(separatorIndex + 4).trim()
  }
  const hasSeparator = separatorIndex >= 0 && titleStatement.length > 0

  const statusBadge = hasResult
    ? `<span class="${styles.blockStatusBadge} ${styles.blockStatusDone}">✓ erledigt</span>`
    : ''
  const subBadge = isSub
    ? `<span class="${styles.blockSubBadge}">Sub</span>`
    : ''

  let html = `<div class="${styles.blockWrapper}">`
  // Connector: Dot + horizontale Linie an Oberkante, Datum darunter (E.6)
  html += `<div class="${styles.blockConnector}">`
  html += `<div class="${styles.connectorTop}">`
  html += `<span class="${styles.connectorDot}"></span>`
  html += `<span class="${styles.connectorLine}"></span>`
  html += `</div>`
  if (footnoteDate) {
    html += `<div class="${styles.connectorDate}">${footnoteDate}</div>`
  }
  html += `</div>`
  html += `<div id="punkt-${blockIdx}" class="${isSub ? styles.blockCardSub : styles.blockCard}" data-status="${hasResult ? 'done' : 'open'}"${isHot ? ' data-hot="true"' : ''}>`
  // Accordion-Titel mit Frage↔Aussage (L.6)
  let summaryTitle
  if (hasSeparator) {
    summaryTitle = `<span class="${styles.titleClosed}">${titleStatement}</span><span class="${styles.titleOpen}">${titleQuestion}</span>`
  } else {
    summaryTitle = escapedHeading
  }
  html += `<details${hasResult ? ' open' : ''}>`
  html += `<summary class="${styles.blockHeader}"><h3 title="${escapedHeading}">${subBadge}${summaryTitle}${statusBadge}</h3><button class="${styles.copyLinkBtn}" data-copy-entry data-ref="${escapedRef}" title="Referenz kopieren: ${escapedRef}">🔗</button><button class="${styles.copyLinkBtn}" data-toggle-index-done data-entry-index="${blockIdx}" title="${hasResult ? 'Als offen markieren' : 'Als erledigt markieren'}">${hasResult ? '✅' : '⬜'}</button></summary>`
  html += `<div class="${styles.blockContent}">${renderMarkdown(content)}</div>`
  if (result) {
    // Ergebnis-Zeile rendern
    const resultText = result
      .replace(/^> \*\*Ergebnis:\*\*\s*/i, '')
      .trim()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
    html += `<div class="${styles.blockResult}"><span class="${styles.blockResultIcon}">📌</span> ${resultText}</div>`
  }
  if (footnote) {
    // Fußnote ohne äußere Sternchen rendern
    const cleanFootnote = footnote.replace(/^\*|\*$/g, '').trim()
    const escapedFootnote = cleanFootnote
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    html += `<div class="${styles.blockFooter}"><em>${escapedFootnote}</em></div>`
  }
  html += `</details>`
  html += `</div>`  // close card
  html += `</div>`  // close blockWrapper
  return html
}

// Lese den ersten H1-Titel aus Markdown (für konsistente Titelzeile)
function readmeTitle(md) {
  if (!md) return ''
  const match = md.match(/^# (.+)$/m)
  return match ? match[1].trim() : ''
}

// Discord-CDN-URLs im Chat als Bilder rendern
function renderMessageContent(text) {
  if (!text) return text
  const imgRe = /(https:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net)\/[^\s)"'<>]+)/gi
  const parts = text.split(imgRe)
  if (parts.length <= 1) return text
  return parts
    .map((part, i) => {
      if (i % 2 === 0) return part || null
      return <img key={i} src={part} alt="" className={styles.chatImage} loading="lazy" />
    })
    .filter(Boolean)
}

// ─── Extrahiert die README-Präambel (alles zwischen H1 und erstem ---/###) ───
function extractPreamble(readme) {
  if (!readme) return ''
  const lines = readme.split('\n')
  let start = -1
  let end = -1
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith('# ')) {
      start = i + 1
      continue
    }
    if (start >= 0 && end < 0) {
      if (line === '---' || line === '___' || line.startsWith('###')) {
        end = i
        break
      }
    }
  }
  if (start < 0) return ''
  if (end < 0) end = lines.length
  return lines.slice(start, end).map(l => l.trim()).filter(Boolean).join('\n').trim()
}

// ─── Diff-Algorithmus (LCS-basiert) ─────────────────────────────────────────────
function computeDiff(oldText, newText) {
  const oldLines = (oldText || '').split('\n')
  const newLines = (newText || '').split('\n')
  const m = oldLines.length, n = newLines.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = oldLines[i - 1] === newLines[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1])
  const result = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.unshift({ type: 'unchanged', text: oldLines[i - 1] })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', text: newLines[j - 1] })
      j--
    } else {
      result.unshift({ type: 'removed', text: oldLines[i - 1] })
      i--
    }
  }
  return result
}

// ─── Readme Update Modal ──────────────────────────────────────────────────────

function ReadmeModal({ discussionId, onClose, onUpdate, isSub, subId }) {
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState('')
  const [suggested, setSuggested] = useState('')
  const [preview, setPreview] = useState(false) // false = Editing mode (I.5), true = Diff-Preview (I.2)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ discussion_id: discussionId })
    if (isSub && subId) {
      params.set('is_sub', 'true')
      params.set('sub_id', subId)
    }
    fetch(`${API}/suggest-readme?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'ok') {
          setCurrent(d.current_readme)
          setSuggested(d.suggested_readme)
          setEditText(d.suggested_readme)
        } else {
          setSuggested('Fehler: ' + (d.error || 'Unbekannt'))
        }
        setLoading(false)
      })
      .catch(() => { setLoading(false); setSuggested('Fehler beim Laden') })
  }, [discussionId, isSub, subId])

  // compute diff for preview mode
  const diff = useMemo(() => {
    if (!preview || !current || !suggested) return null
    return computeDiff(current, suggested)
  }, [current, suggested, preview])

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.readmeModalOverlay} onClick={handleOverlay}>
      <div className={styles.readmeModal}>
        <div className={styles.readmeModalHeader}>
          <span>📋 README aktualisieren</span>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        {loading ? (
          <div>
            <div className={styles.readmeLoadingWrap}>
              <div className={styles.spinner} />
              <p className={styles.readmeLoadingText}>Hermi analysiert README und index.md…</p>
              <p className={styles.readmeLoadingHint}>Das kann bis zu 30s dauern.</p>
            </div>
          </div>
        ) : (
          <div className={styles.readmeBody}>
            <div className={styles.readmeCompare}>
              <div className={styles.readmeCol}>
                <div className={styles.readmeColLabel}>Aktuelle README</div>
                {diff ? (
                  <div className={styles.readmeDiffPre}>
                    {diff.filter(l => l.type !== 'added').map((line, i) => (
                      <div key={i} className={
                        line.type === 'removed' ? styles.diffRemovedLine : ''
                      }>
                        <span className={styles.diffMarker}>{line.type === 'removed' ? '−' : ' '}</span>
                        {line.text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className={styles.readmePre}>{current}</pre>
                )}
              </div>
              <div className={styles.readmeCol}>
                <div className={styles.readmeColLabel}>Vorschlag</div>
                {preview && diff ? (
                  <div className={styles.readmeDiffPre}>
                    {diff.filter(l => l.type !== 'removed').map((line, i) => (
                      <div key={i} className={
                        line.type === 'added' ? styles.diffAddedLine : ''
                      }>
                        <span className={styles.diffMarker}>{line.type === 'added' ? '+' : ' '}</span>
                        {line.text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <textarea
                    className={styles.readmeTextarea}
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                  />
                )}
              </div>
            </div>
            <p className={styles.readmeHint}>Der Vorschlag kommt von Hermes. Prüfe ob die Änderung sinnvoll ist — du musst sie nicht übernehmen.</p>
            <div className={styles.readmeActions}>
              <button className={styles.previewBtn} onClick={() => setPreview(!preview)}>
                {preview ? '✏️ Bearbeiten' : '📖 Vorschau (Diff)'}
              </button>
              <button className={styles.previewBtnPrimary} onClick={() => onUpdate(editText)}>
                ✅ Übernehmen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Blocks Section (mit Connector #18 + Promote-Button) ──────────

// Parse Datum aus block content: *— · DD.MM.YYYY*
function parseBlockDate(contentLines) {
  for (let i = 0; i < Math.min(3, contentLines.length); i++) {
    const m = contentLines[i].match(/\*\s*—\s*·\s*(\d{2}\.\d{2}\.\d{2,4})\s*\*/)
    if (m) return { date: m[1], idx: i }
  }
  return null
}

// Parse **Erstellt:** DD.MM.YYYY aus README
function parseCreatedDate(readme) {
  if (!readme) return ''
  const m = readme.match(/\*\*Erstellt:\*\*\s*(\d{2}\.\d{2}\.\d{2,4})/)
  return m ? m[1] : ''
}

function BlocksSection({ md, discussionId, isSub, subId, blocksFiles, onConvertToSub, onEditBlock, onDeleteBlock, hideDone }) {
  blocksFiles = blocksFiles || []
  const blocks = useMemo(() => parseBlocksMd(md), [md])
  // #41: Neu = unten — chronologische Reihenfolge (neuestes Element zuletzt)
  const reversedBlocks = useMemo(() => {
    return blocks.map((block, i) => ({ block, originalIdx: i }))
  }, [blocks])
  const [editingIndex, setEditingIndex] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)

  if (!blocks.length) {
    if (md) return <div className={styles.markdownContent} dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }} />
    return null
  }

  // #30: done-Elemente vor dem Rendern filtern (statt CSS display:none), damit Connector-Linien nicht als Geister stehen bleiben
  const filteredBlocks = hideDone
    ? reversedBlocks.filter(({ block }) => {
        const h = block.heading.replace(/^###\s+/, '').trim()
        return !h.includes('(✓ erledigt)')
      })
    : reversedBlocks

  const startEditing = (idx, headingText, content) => {
    setEditingIndex(idx)
    setEditTitle(headingText)
    setEditContent(content)
    setConfirmingDelete(null)
  }

  const cancelEditing = () => {
    setEditingIndex(null)
    setEditTitle('')
    setEditContent('')
  }

const saveEdit = (idx, file_name) => {
    if (!editTitle.trim()) return
    setEditLoading(true)
    onEditBlock(idx, editTitle.trim(), editContent, file_name, () => {
      setEditingIndex(null)
      setEditTitle('')
      setEditContent('')
      setEditLoading(false)
    })
  }

  const handleDelete = (idx, file_name) => {
    if (confirmingDelete === idx) {
      setConfirmingDelete(null)
      onDeleteBlock(idx, file_name)
    } else {
      setConfirmingDelete(idx)
      setTimeout(() => setConfirmingDelete(null), 4000)
    }
  }

  const handleToggleDone = (idx, headingText, content, file_name) => {
    const isDone = headingText.includes('(✓ erledigt)')
    let newTitle
    if (isDone) {
      newTitle = headingText.replace(/\s*\(✓ erledigt\)\s*/g, ' ').trim()
    } else {
      newTitle = headingText + ' (✓ erledigt)'
    }
    onEditBlock(idx, newTitle, content, file_name, () => {})
  }

  const copyBoxLink = (idx, headingText, file_name) => {
    const subPath = isSub && subId ? '/' + subId : ''
    const cleanedTitle = headingText.replace(/^📷\s*/, '').trim()
    const prefix = headingText.startsWith('📷') ? 'img' : 'box'
    let ref
    if (file_name) {
      // #H: Pfad-Format für Einzeldateien
      ref = discussionId + subPath + '/blocks/' + file_name
    } else {
      // Fallback: altes box-NR-Format
      ref = discussionId + subPath + ' > ' + prefix + '-' + idx + ' "' + cleanedTitle + '"'
    }
    navigator.clipboard.writeText(ref)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Auto-Scroll zu Textbox beim Laden per URL-Hash
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.startsWith('#box-')) {
      const id = hash.slice(1)
      requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
  }, [])

  return (
    <div>
      {filteredBlocks.map(({ block, originalIdx }, displayIdx) => {
        const headingText = block.heading.replace(/^###\s+/, '').trim()
        const isDone = headingText.includes('(✓ erledigt)')

        // Datum aus Content parsen und aus sichtbarem Inhalt entfernen
        const dateInfo = parseBlockDate(block.content)
        const filteredContent = dateInfo
          ? block.content.filter((_, i) => i !== dateInfo.idx)
          : block.content
        const content = filteredContent.join('\n').trim()

        // #H: file_name aus blocks_files[] für Einzeldateien-API
        const file_name = blocksFiles[originalIdx]?.name

        // #40: Bild-Blöcke immer sichtbar ohne Accordion
        const isImageBlock = headingText.startsWith('📷')
        const headerClass = isImageBlock ? styles.imageBlockHeader : styles.blockHeader

        return (
          <div key={displayIdx} className={styles.blockWrapper}>
            <div className={styles.blockConnector}>
              <div className={styles.connectorTop}>
                <span className={styles.connectorDot}></span>
                <span className={styles.connectorLine}></span>
              </div>
              {dateInfo && (
                <div className={styles.connectorDate}>{dateInfo.date}</div>
              )}
            </div>
            {isImageBlock ? (
              <div id={'box-' + originalIdx} className={styles.blockCard} data-status={isDone ? 'done' : 'open'}>
                <div className={headerClass}>
                  <h3 title={headingText}>{editingIndex === originalIdx ? '✏️ ' + editTitle : headingText}</h3>
                  <span className={styles.boxAnchorLabel}>#box-{originalIdx}</span>
                </div>

              {/* Edit-Modus: Input-Felder statt gerendertem Content */}
              {editingIndex === originalIdx ? (
                <div className={styles.editBlockForm}>
                  <label className={styles.editBlockLabel}>Titel</label>
                  <input
                    className={styles.editBlockInput}
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Titel der Textbox..."
                  />
                  <label className={styles.editBlockLabel}>Inhalt (Markdown)</label>
                  <textarea
                    className={styles.editBlockTextarea}
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    placeholder="Inhalt (Markdown)..."
                  />
                  <div className={styles.editBlockButtons}>
                    <button
                      className={styles.editBlockSaveBtn}
                      onClick={() => saveEdit(originalIdx, file_name)}
                      disabled={editLoading || !editTitle.trim()}
                    >
                      {editLoading ? '⏳ Speichern...' : '✅ Speichern'}
                    </button>
                    <button
                      className={styles.editBlockCancelBtn}
                      onClick={cancelEditing}
                      disabled={editLoading}
                    >
                      ❌ Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.blockContent}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                />
              )}

              <div className={styles.blockActions}>
                <button
                  className={styles.convertBtn}
                  onClick={() => onConvertToSub?.(headingText, content)}
                  title="💬 Startet eine Discord-Session mit dem Inhalt dieser Textbox. Die Session wird im rechten Preview-Panel geöffnet — Hermes geht den Text Schritt für Schritt mit dir durch, diskutiert Ideen, sammelt Feedback und leitet konkrete Vorschläge für neue Sub-Diskussionen ab. Diese können später übernommen werden."
                >
                  💬 In Sub entwickeln
                </button>
                <button
                  className={styles.copyLinkBtn}
                  onClick={() => copyBoxLink(originalIdx, headingText, file_name)}
                  title={'Referenz kopieren: ' + discussionId + (isSub && subId ? '/' + subId : '') + ' > ' + (headingText.startsWith('📷') ? 'img' : 'box') + '-' + originalIdx + ' "' + headingText.replace(/^📷\s*/, '').trim() + '"'}
                >
                  {copiedIndex === originalIdx ? '✅' : '🔗'}
                </button>
                <button
                  className={`${styles.toggleDoneBtn} ${isDone ? styles.toggleDoneBtnActive : ''}`}
                  onClick={() => handleToggleDone(originalIdx, headingText, content, file_name)}
                  title={isDone ? 'Als offen markieren' : 'Als erledigt markieren'}
                >
                  {isDone ? '✅' : '⬜'}
                </button>
                <button
                  className={styles.editBlockActionBtn}
                  onClick={() => startEditing(originalIdx, headingText, content)}
                  title="Diese Textbox bearbeiten"
                >
                  ✏️
                </button>
                <button
                  className={`${styles.deleteBlockActionBtn} ${confirmingDelete === originalIdx ? styles.deleteBlockActionBtnDanger : ''}`}
                  onClick={() => handleDelete(originalIdx, file_name)}
                  title={confirmingDelete === originalIdx ? 'Erneut klicken zum Löschen' : 'Diese Textbox löschen'}
                >
                  {confirmingDelete === originalIdx ? '⚠️ Sicher?' : '🗑️'}
                </button>
              </div>
              </div>
            ) : (
              <details id={'box-' + originalIdx} className={styles.blockCard} data-status={isDone ? 'done' : 'open'}>
                <summary className={headerClass}>
                  <h3 title={headingText}>{editingIndex === originalIdx ? '✏️ ' + editTitle : headingText}</h3>
                  <span className={styles.boxAnchorLabel}>#box-{originalIdx}</span>
                </summary>

              {/* Edit-Modus: Input-Felder statt gerendertem Content */}
              {editingIndex === originalIdx ? (
                <div className={styles.editBlockForm}>
                  <label className={styles.editBlockLabel}>Titel</label>
                  <input
                    className={styles.editBlockInput}
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Titel der Textbox..."
                  />
                  <label className={styles.editBlockLabel}>Inhalt (Markdown)</label>
                  <textarea
                    className={styles.editBlockTextarea}
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    placeholder="Inhalt (Markdown)..."
                  />
                  <div className={styles.editBlockButtons}>
                    <button
                      className={styles.editBlockSaveBtn}
                      onClick={() => saveEdit(originalIdx, file_name)}
                      disabled={editLoading || !editTitle.trim()}
                    >
                      {editLoading ? '⏳ Speichern...' : '✅ Speichern'}
                    </button>
                    <button
                      className={styles.editBlockCancelBtn}
                      onClick={cancelEditing}
                      disabled={editLoading}
                    >
                      ❌ Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.blockContent}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                />
              )}

              <div className={styles.blockActions}>
                <button
                  className={styles.convertBtn}
                  onClick={() => onConvertToSub?.(headingText, content)}
                  title="💬 Startet eine Discord-Session mit dem Inhalt dieser Textbox. Die Session wird im rechten Preview-Panel geöffnet — Hermes geht den Text Schritt für Schritt mit dir durch, diskutiert Ideen, sammelt Feedback und leitet konkrete Vorschläge für neue Sub-Diskussionen ab. Diese können später übernommen werden."
                >
                  💬 In Sub entwickeln
                </button>
                <button
                  className={styles.copyLinkBtn}
                  onClick={() => copyBoxLink(originalIdx, headingText, file_name)}
                  title={'Referenz kopieren: ' + discussionId + (isSub && subId ? '/' + subId : '') + ' > ' + (headingText.startsWith('📷') ? 'img' : 'box') + '-' + originalIdx + ' "' + headingText.replace(/^📷\s*/, '').trim() + '"'}
                >
                  {copiedIndex === originalIdx ? '✅' : '🔗'}
                </button>
                <button
                  className={`${styles.toggleDoneBtn} ${isDone ? styles.toggleDoneBtnActive : ''}`}
                  onClick={() => handleToggleDone(originalIdx, headingText, content, file_name)}
                  title={isDone ? 'Als offen markieren' : 'Als erledigt markieren'}
                >
                  {isDone ? '✅' : '⬜'}
                </button>
                <button
                  className={styles.editBlockActionBtn}
                  onClick={() => startEditing(originalIdx, headingText, content)}
                  title="Diese Textbox bearbeiten"
                >
                  ✏️
                </button>
                <button
                  className={`${styles.deleteBlockActionBtn} ${confirmingDelete === originalIdx ? styles.deleteBlockActionBtnDanger : ''}`}
                  onClick={() => handleDelete(originalIdx, file_name)}
                  title={confirmingDelete === originalIdx ? 'Erneut klicken zum Löschen' : 'Diese Textbox löschen'}
                >
                  {confirmingDelete === originalIdx ? '⚠️ Sicher?' : '🗑️'}
                </button>
              </div>
              </details>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Discussion Card ─────────────────────────────────────────────────────────

function DiscussionCard({ discussion, onClick }) {
  const { name, status, subs, last_modified } = discussion
  const hasOpen = status.offen > 0
  const hasDone = status.erledigt > 0

  return (
    <div className={styles.card} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onClick() }}
    >
      <div className={styles.cardTop}>
        <div>
          <div className={styles.cardTitle}>{name}</div>
          <div className={styles.cardMeta}>
            {hasDone && <span className={`${styles.badge} ${styles.badgeDone}`}>✓ {status.erledigt} erledigt</span>}
            {hasOpen && <span className={`${styles.badge} ${styles.badgeOpen}`}>● {status.offen} offen</span>}
            {!hasDone && !hasOpen && <span className={`${styles.badge} ${styles.badgeIdle}`}>○ keine Aktivität</span>}
            {subs.length > 0 && <span>{subs.length} Sub</span>}
            <span className={styles.time}>{timeAgo(last_modified)}</span>
          </div>
        </div>
      </div>
      {subs.length > 0 && (
        <div className={styles.subs}>
          {subs.map(sub => (
            <div key={sub.id} className={styles.subItem}>
              <span className={`${styles.subDot} ${sub.status.offen > 0 ? 'open' : sub.status.erledigt > 0 ? 'done' : 'idle'}`} />
              {sub.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Split-View Modal (Diskussion + Preview) ─────────────────────────────────

function SplitViewModal({ discussion, onClose, copiedSub, onCopySub }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Session State
  const [previewState, setPreviewState] = useState('idle') // idle|starting|polling|active|generating|adopting|error
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [selectedSet, setSelectedSet] = useState(new Set())
  const [userNotes, setUserNotes] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [debugLog, setDebugLog] = useState([])
  const [generatedBlock, setGeneratedBlock] = useState('')
  const [triggeredAt, setTriggeredAt] = useState(null)
  const [showReadmeModal, setShowReadmeModal] = useState(false)
  const pollRef = useRef(null)
  const [activeTab, setActiveTab] = useState('discussion')
  const [gitLog, setGitLog] = useState(null)
  const [gitLogLoading, setGitLogLoading] = useState(false)
  const [showSubDialog, setShowSubDialog] = useState(false)
  const [subDialogName, setSubDialogName] = useState('')
  const [freitextMode, setFreitextMode] = useState(false)
  const fileInputRef = useRef(null)
  const boxImageInputRef = useRef(null)
  const [activeSubView, setActiveSubView] = useState(null)
  const [subViewData, setSubViewData] = useState(null)
  const [subViewLoading, setSubViewLoading] = useState(false)
  const [expandedSubs, setExpandedSubs] = useState(new Set())
  const [subOverrides, setSubOverrides] = useState({})
  // Box-Add Form
  const [boxTitle, setBoxTitle] = useState('')
  const [boxContent, setBoxContent] = useState('')
  const [boxLoading, setBoxLoading] = useState(false)
  const [pendingImage, setPendingImage] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [hideDone, setHideDone] = useState(false)
  const [tocMode, setTocMode] = useState('all')
  window.__setTocMode = setTocMode

  // Sub-Override-Helper: override vor automatischer Erkennung
  const getSubDone = useCallback((subId, status) => {
    const override = subOverrides[subId]
    if (override === 'done') return true
    if (override === 'open') return false
    return status?.erledigt > 0 && status?.offen === 0
  }, [subOverrides])

  // SSE Streaming
  const lastTsRef = useRef(0)
  const sseRef = useRef(null)
  const pollFallbackRef = useRef(null)

  // Split-View Resizer
  const [splitRatio, setSplitRatio] = useState(() => {
    try { return parseFloat(localStorage.getItem('diskhub-split-ratio') || '65') || 65 }
    catch (e) { return 65 }
  })
  const [isDragging, setIsDragging] = useState(false)
  const splitViewRef = useRef(null)
  const splitRatioRef = useRef(splitRatio)

  // Lade Diskussionsdaten
  const fetchDiscussionData = useCallback(() => {
    setLoading(true)
    fetch(`${API}/${discussion.id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [discussion.id])

  useEffect(() => { fetchDiscussionData() }, [fetchDiscussionData])

  // Standardmäßig ersten offenen Sub expandieren (#11)
  useEffect(() => {
    if (data?.subs) {
      const firstOpen = data.subs.find(sub => sub.status?.offen > 0)
      if (firstOpen) {
        setExpandedSubs(new Set([firstOpen.id]))
      }
    }
  }, [data])

  // Lade Sub-Diskussionsdaten bei Zoom
  useEffect(() => {
    if (!activeSubView || !discussion?.id) return
    setSubViewLoading(true)
    fetch(`${API}/${discussion.id}?sub_path=${encodeURIComponent(activeSubView)}`)
      .then(r => r.json())
      .then(d => { setSubViewData(d); setSubViewLoading(false) })
      .catch(() => setSubViewLoading(false))
  }, [activeSubView, discussion?.id])

  // Draft aus localStorage wiederherstellen
  useEffect(() => {
    const key = `diskhub-draft-${discussion.id}`
    try {
      const saved = localStorage.getItem(key)
      if (saved) setUserNotes(saved)
    } catch (e) { /* localStorage nicht verfügbar */ }
  }, [discussion.id])

  // Draft in localStorage speichern (bei Änderung)
  const draftTimerRef = useRef(null)
  useEffect(() => {
    const key = `diskhub-draft-${discussion.id}`
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    draftTimerRef.current = setTimeout(() => {
      try {
        if (userNotes) localStorage.setItem(key, userNotes)
        else localStorage.removeItem(key)
      } catch (e) { /* localStorage nicht verfügbar */ }
    }, 500) // 500ms Debounce
    return () => { if (draftTimerRef.current) clearTimeout(draftTimerRef.current) }
  }, [userNotes, discussion.id])

  // Escape zum Schliessen
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Popstate für Browser-Back-Button — schließt Sub-View
  useEffect(() => {
    const handler = () => {
      if (activeSubView) {
        setActiveSubView(null)
        window.history.replaceState(null, '')
      }
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [activeSubView])

  // Cleanup Polling
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (sseRef.current) sseRef.current.close()
      if (pollFallbackRef.current) clearInterval(pollFallbackRef.current)
    }
  }, [])

  // lastTsRef mit neuestem Nachrichten-Timestamp synchronisieren
  useEffect(() => {
    if (messages.length > 0) {
      const timestamps = messages
        .filter(m => m.ts != null)
        .map(m => parseFloat(m.ts))
        .filter(t => !isNaN(t))
      if (timestamps.length > 0) {
        lastTsRef.current = Math.max(...timestamps)
      }
    }
  }, [messages])

  // Sync ref for drag handler
  useEffect(() => { splitRatioRef.current = splitRatio }, [splitRatio])

  // Globaler Click-Handler: data-toggle-index-done (index.md Status-Toggle)
  useEffect(() => {
    const handler = (e) => {
      const toggleBtn = e.target.closest('[data-toggle-index-done]')
      if (!toggleBtn) return
      const entryIndex = parseInt(toggleBtn.getAttribute('data-entry-index'), 10)
      if (isNaN(entryIndex)) return

      // Optimistic UI: sofort umschalten, API im Hintergrund
      const wasDone = toggleBtn.textContent.trim() === '✅'
      const card = toggleBtn.closest('[data-status]')
      const newIsDone = !wasDone

      // Scroll-Position vor Re-Render speichern + Debug-Log
      const scrollYBefore = window.scrollY
      setDebugLog(prev => [...prev.slice(-4), { text: `[Toggle] idx=${entryIndex} was=${wasDone ? '✅' : '⬜'} → ${newIsDone ? '✅' : '⬜'} scrollY=${scrollYBefore}`, ts: Date.now() }])

      // data-status toggeln → CSS färbt Header grün/grau
      card.setAttribute('data-status', newIsDone ? 'done' : 'open')
      // details open toggeln (erledigt = aufgeklappt, offen = zu)
      const details = card.querySelector('details')
      if (details) details.open = newIsDone
      // Button sofort wechseln
      toggleBtn.textContent = newIsDone ? '✅' : '⬜'
      toggleBtn.title = newIsDone ? 'Als offen markieren' : 'Als erledigt markieren'

      fetch(`${API}/edit-index-title`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discussion_id: discussion.id,
          entry_index: entryIndex,
          is_sub: !!activeSubView,
          sub_id: activeSubView || undefined,
        }),
      })
        .then(r => r.json())
        .then(d => {
          if (d.status === 'ok') {
            setErrorMsg('✅ Status aktualisiert' + (d.sha ? ' (' + d.sha.slice(0, 7) + ')' : ''))
            setDebugLog(prev => [...prev.slice(-4), { text: `[Toggle] API ok — DOM bleibt optimistisch`, ts: Date.now() }])
          } else {
            // Fehler → Rollback
            card.setAttribute('data-status', wasDone ? 'done' : 'open')
            if (details) details.open = wasDone
            toggleBtn.textContent = wasDone ? '✅' : '⬜'
            toggleBtn.title = wasDone ? 'Als offen markieren' : 'Als erledigt markieren'
            setErrorMsg('❌ ' + (d.error || 'Fehler beim Status-Toggle'))
          }
        })
        .catch(() => {
          // Netzwerkfehler → Rollback
          card.setAttribute('data-status', wasDone ? 'done' : 'open')
          if (details) details.open = wasDone
          toggleBtn.textContent = wasDone ? '✅' : '⬜'
          toggleBtn.title = wasDone ? 'Als offen markieren' : 'Als erledigt markieren'
          setErrorMsg('❌ Netzwerkfehler — Status nicht gespeichert')
        })
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [discussion.id, activeSubView])

  // Split-View Resizer — globaler Drag-Listener
  useEffect(() => {
    if (!isDragging) return
    let lastRatio = splitRatioRef.current

    const handleMove = (e) => {
      if (!splitViewRef.current) return
      const rect = splitViewRef.current.getBoundingClientRect()
      lastRatio = Math.max(20, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100))
      setSplitRatio(lastRatio)
    }

    const handleUp = () => {
      setIsDragging(false)
      try { localStorage.setItem('diskhub-split-ratio', String(lastRatio)) } catch (e) {}
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [isDragging])

  // Git-Log laden bei Tab-Wechsel (respektiert Sub-View)
  useEffect(() => {
    if (activeTab !== 'technical' || !discussion?.id) return
    setGitLogLoading(true)
    let url = `${API}/git-log/${discussion.id}`
    if (activeSubView) url += `?sub_id=${encodeURIComponent(activeSubView)}`
    fetch(url)
      .then(r => r.json())
      .then(d => { setGitLog(d); setGitLogLoading(false) })
      .catch(() => { setGitLog(null); setGitLogLoading(false) })
  }, [activeTab, discussion?.id, activeSubView])
  
  // Session-Polling
  useEffect(() => {
    if (previewState !== 'polling') return

    let attempts = 0
    const maxAttempts = 60 // 5min bei 5s Intervall

    const poll = () => {
      console.log('[DISKHUB] Poll', { title: sessionTitle, triggeredAt, attempt: attempts + 1 })
      const params = new URLSearchParams({ title: sessionTitle })
      if (triggeredAt) params.set('since', String(triggeredAt))

      fetch(`${API}/session-status?${params}`)
        .then(r => r.json())
        .then(d => {
          if (d.found && d.session) {
            console.log('[DISKHUB] Poll SUCCESS', { sessionId: d.session.id, title: d.session.title, msgs: d.session.message_count })
            setSessionId(d.session.id)

            // Messages vor dem SSE-Connect laden — so ist since_ts korrekt
            fetch(`${API}/session-messages/${d.session.id}`)
              .then(r => r.json())
              .then(msgData => {
                if (msgData.messages) {
                  setMessages(msgData.messages)
                  const timestamps = msgData.messages
                    .filter(m => m.ts != null)
                    .map(m => parseFloat(m.ts))
                    .filter(t => !isNaN(t))
                  if (timestamps.length > 0) {
                    lastTsRef.current = Math.max(...timestamps)
                  }
                }
              })
              .catch(() => {})

            setPreviewState('active')
            if (pollRef.current) clearInterval(pollRef.current)
          } else {
            attempts++
            if (attempts >= maxAttempts) {
              setPreviewState('error')
              setErrorMsg('Hermi hat nicht reagiert. Session manuell in Discord starten?')
              if (pollRef.current) clearInterval(pollRef.current)
            }
          }
        })
        .catch(() => {
          attempts++
          if (attempts >= maxAttempts) {
            setPreviewState('error')
            setErrorMsg('Polling fehlgeschlagen')
            if (pollRef.current) clearInterval(pollRef.current)
          }
        })
    }

    pollRef.current = setInterval(poll, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [previewState, sessionTitle, triggeredAt])

  const fetchMessages = (sid) => {
    if (!sid) return
    fetch(`${API}/session-messages/${sid}`)
      .then(r => r.json())
      .then(d => {
        if (d.messages) setMessages(d.messages)
      })
      .catch(() => {})
  }

  // Refresh-Nachrichten — SSE statt Polling
  useEffect(() => {
    if (previewState !== 'active' || !sessionId) return

    // Bestehende Verbindung schließen
    if (sseRef.current) sseRef.current.close()

    // SSE-Verbindung aufbauen — since_ts aus aktuellen Messages, nicht aus 0
    const maxTs = messages
      .filter(m => m.ts != null)
      .map(m => parseFloat(m.ts))
      .filter(t => !isNaN(t))
    const sinceTs = maxTs.length > 0 ? Math.max(...maxTs) : lastTsRef.current
    const eventSource = new EventSource(`${API}/session-messages-stream/${sessionId}?since_ts=${sinceTs}`)
    sseRef.current = eventSource

    eventSource.onmessage = (event) => {
      if (!event.data || event.data.startsWith(':')) return
      try {
        const data = JSON.parse(event.data)
        console.log('[DISKHUB] SSE message', { msgCount: data.messages?.length, total_new: data.total_new })
        if (data.messages && data.messages.length > 0) {
          setMessages(prev => [...prev, ...data.messages])
        }
      } catch (e) {
        // Ungültige Daten ignorieren
      }
    }

    eventSource.onerror = () => {
      console.log('[DISKHUB] SSE error — reconnect/fallback')
      // EventSource reconnectiert automatisch
      if (!pollFallbackRef.current) {
        const iv = setInterval(() => {
          fetchMessages(sessionId)
        }, 8000)
        pollFallbackRef.current = iv
      }
    }

    // SSE-Erfolg: Fallback-Polling stoppen (falls aktiv)
    eventSource.onopen = () => {
      if (pollFallbackRef.current) {
        clearInterval(pollFallbackRef.current)
        pollFallbackRef.current = null
      }
    }

    return () => {
      eventSource.close()
      sseRef.current = null
      if (pollFallbackRef.current) {
        clearInterval(pollFallbackRef.current)
        pollFallbackRef.current = null
      }
    }
  }, [previewState, sessionId])

  // "Hier weiterdiskutieren"
  const handleStartSession = () => {
    console.log('[DISKHUB] handleStartSession', { discussion_id: discussion.id, t: Math.floor(Date.now() / 1000) })
    setPreviewState('starting')
    setTriggeredAt(Math.floor(Date.now() / 1000))  // JETZT erfassen — vor dem Fetch

    fetch(`${API}/start-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discussion_id: discussion.id,
        is_sub: false,
      }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'triggered' || d.status === 'partial') {
          setSessionTitle(d.session_title)
          setPreviewState('polling')
        } else {
          setPreviewState('error')
          setErrorMsg('Webhook-Fehler: ' + JSON.stringify(d))
        }
      })
      .catch(e => {
        setPreviewState('error')
        setErrorMsg('Netzwerkfehler: ' + e.message)
      })
  }

  // Nachricht umschalten (selektieren)
  const toggleMessage = (idx) => {
    const s = new Set(selectedSet)
    if (s.has(idx)) s.delete(idx)
    else s.add(idx)
    setSelectedSet(s)
  }

  // Von Hermi generieren
  const handleGenerate = () => {
    setPreviewState('generating')
    const selectedMsgs = Array.from(selectedSet).map(i => messages[i]).filter(Boolean)

    fetch(`${API}/generate-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discussion_id: discussion.id,
        selected_messages: selectedMsgs,
        user_notes: userNotes,
      }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'ok') {
          setGeneratedBlock(d.summary)
          setUserNotes(d.summary)
        } else {
          setErrorMsg(d.error || 'Generation fehlgeschlagen')
        }
        setPreviewState('active')
      })
      .catch(() => {
        setPreviewState('active')
        setErrorMsg('Netzwerkfehler')
      })
  }

  // In Dokument übernehmen
  const handleAdopt = () => {
    setPreviewState('adopting')
    const currentSubId = activeSubId === '__main__' ? null : activeSubId

    // Bild-URLs aus ausgewählten Nachrichten sammeln
    const selectedMessages = Array.from(selectedSet).map(i => messages[i]).filter(Boolean)
    const imgRe = /https:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net)\/[^\s)"'<>]+/gi
    const images = []
    selectedMessages.forEach(m => {
      if (m?.content) {
        const matches = [...m.content.matchAll(imgRe)]
        for (const match of matches) {
          const url = match[0]
          const filename = url.split('/').pop()?.split('?')[0] || `bild-${Date.now()}.png`
          if (!images.some(i => i.url === url)) {
            images.push({ url, filename })
          }
        }
      }
    })

    fetch(`${API}/adopt-block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discussion_id: discussion.id,
        block_content: userNotes || generatedBlock || '(kein Inhalt)',
        is_sub: !!currentSubId,
        sub_id: currentSubId || undefined,
        images: images.length > 0 ? images : undefined,
      }),
    })
      .then(r => r.json())
      .then(d => {
        setPreviewState('active')
        if (d.status === 'ok') {
          setErrorMsg('✅ Übernommen: ' + (d.sha || 'ok'))
          setUserNotes('')
          setGeneratedBlock('')
          setSelectedSet(new Set())
          try { localStorage.removeItem(`diskhub-draft-${discussion.id}`) } catch (e) {}
        } else {
          setErrorMsg('❌ ' + (d.error || 'Übernahme fehlgeschlagen'))
        }
      })
      .catch(() => {
        setPreviewState('active')
        setErrorMsg('❌ Netzwerkfehler bei Übernahme')
      })
  }

  // Sub-Diskussion starten (C.3 — mit Namenseingabe)
  const handleStartSub = (subName) => {
    console.log('[DISKHUB] handleStartSub', { subName, discussion_id: discussion.id, t: Math.floor(Date.now() / 1000) })
    const name = subName || ('neue-sub-' + Date.now())
    setPreviewState('starting')
    setTriggeredAt(Math.floor(Date.now() / 1000))  // vor dem Fetch
    fetch(`${API}/start-sub-discussion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discussion_id: discussion.id,
        sub_id: name,
      }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'triggered' || d.status === 'partial') {
          setSessionTitle(d.session_title)
          setPreviewState('polling')
        } else {
          setPreviewState('error')
          setErrorMsg('Webhook-Fehler: ' + JSON.stringify(d))
        }
      })
      .catch(e => {
        setPreviewState('error')
        setErrorMsg('Netzwerkfehler: ' + e.message)
      })
  }

  // README aktualisieren
  const handleReadmeUpdate = (newContent) => {
    fetch(`${API}/update-readme`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discussion_id: discussion.id,
        new_readme: newContent,
      }),
    })
      .then(r => r.json())
      .then(d => {
        setShowReadmeModal(false)
        if (d.status === 'ok') {
          setErrorMsg('✅ README aktualisiert: ' + (d.sha || 'ok'))
        } else {
          setErrorMsg('❌ ' + (d.error || 'Update fehlgeschlagen'))
        }
      })
      .catch(() => {
        setShowReadmeModal(false)
        setErrorMsg('❌ Netzwerkfehler')
      })
  }

  // Session verwerfen
  const handleDiscard = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    setPreviewState('idle')
    setSessionId(null)
    setMessages([])
    setSelectedSet(new Set())
    setUserNotes('')
    setGeneratedBlock('')
    setErrorMsg('')
    setTriggeredAt(null)
    try { localStorage.removeItem(`diskhub-draft-${discussion.id}`) } catch (e) {}
  }

  // Box zu Sub-Diskussion konvertieren — startet Session mit Box-Content (#17)
  const handleConvertToSub = (boxTitle, boxContent) => {
    console.log('[DISKHUB] handleConvertToSub', { boxTitle, discussion_id: discussion.id, t: Math.floor(Date.now() / 1000) })
    setPreviewState('starting')
    setTriggeredAt(Math.floor(Date.now() / 1000))
    fetch(`${API}/start-box-to-sub`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discussion_id: discussion.id,
        box_title: boxTitle,
        box_content: boxContent,
        is_sub: !!activeSubView,
        sub_id: activeSubView || undefined,
      }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'triggered' || d.status === 'partial') {
          setSessionTitle(d.session_title)
          setPreviewState('polling')
        } else {
          setPreviewState('error')
          setErrorMsg('Webhook-Fehler: ' + JSON.stringify(d))
        }
      })
      .catch(e => {
        setPreviewState('error')
        setErrorMsg('Netzwerkfehler: ' + e.message)
      })
  }

  // Textbox bearbeiten (#25 + #H: file_name)
  const handleEditBlock = (blockIndex, title, content, file_name, onSuccess) => {
    const payload = {
      discussion_id: discussion.id,
      block_index: blockIndex,
      title,
      content,
      is_sub: !!activeSubView,
      sub_id: activeSubView || undefined,
    }
    if (file_name) {
      payload.file_name = file_name
    }
    fetch(`${API}/edit-block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'ok') {
          setErrorMsg('✅ Textbox aktualisiert: ' + (d.sha ? d.sha.slice(0, 7) : 'ok'))
          fetchDiscussionData()
          onSuccess()
        } else {
          setErrorMsg('❌ ' + (d.error || 'Fehler beim Bearbeiten'))
          onSuccess()
        }
      })
      .catch(e => {
        setErrorMsg('❌ Netzwerkfehler: ' + e.message)
        onSuccess()
      })
  }

  // Textbox löschen (#25 + #H: file_name)
  const handleDeleteBlock = (blockIndex, file_name) => {
    const payload = {
      discussion_id: discussion.id,
      block_index: blockIndex,
      is_sub: !!activeSubView,
      sub_id: activeSubView || undefined,
    }
    if (file_name) {
      payload.file_name = file_name
    }
    fetch(`${API}/delete-block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'ok') {
          setErrorMsg('🗑️ Textbox gelöscht' + (d.blocks_left !== undefined ? ` (${d.blocks_left} verbleibend)` : ''))
          fetchDiscussionData()
        } else {
          setErrorMsg('❌ ' + (d.error || 'Fehler beim Löschen'))
        }
      })
      .catch(e => {
        setErrorMsg('❌ Netzwerkfehler: ' + e.message)
      })
  }

  // Box hinzufügen (in blocks.md)
  const handleAddBox = () => {
    if (!boxTitle.trim()) return
    setBoxLoading(true)

    const doFetch = (body, headers) => {
      fetch(`${API}/add-box`, {
        method: 'POST',
        headers,
        body,
      })
        .then(r => r.json())
        .then(d => {
          setBoxLoading(false)
          if (d.status === 'ok') {
            setBoxTitle('')
            setBoxContent('')
            setPendingImage(null)
            fetchDiscussionData()
            setErrorMsg('✅ Box hinzugefügt: ' + (d.sha || 'ok'))
          } else {
            setErrorMsg('❌ ' + (d.error || 'Fehler'))
          }
        })
        .catch(() => {
          setBoxLoading(false)
          setErrorMsg('❌ Netzwerkfehler')
        })
    }

    if (pendingImage) {
      // Multipart-FormData mit Bild
      const formData = new FormData()
      formData.append('discussion_id', discussion.id)
      formData.append('title', boxTitle.trim())
      formData.append('content', boxContent.trim())
      formData.append('is_sub', activeSubView ? 'true' : 'false')
      if (activeSubView) formData.append('sub_id', activeSubView)
      formData.append('image', pendingImage)
      doFetch(formData, {}) // kein Content-Type — Browser setzt multipart boundary
    } else {
      // Klassischer JSON-Request
      doFetch(JSON.stringify({
        discussion_id: discussion.id,
        title: boxTitle.trim(),
        content: boxContent.trim(),
        is_sub: !!activeSubView,
        sub_id: activeSubView || undefined,
      }), { 'Content-Type': 'application/json' })
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const selectedCount = selectedSet.size
  const userMsgCount = messages.filter(m => m.role === 'user').length
  const assistantMsgCount = messages.filter(m => m.role === 'assistant').length

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            {activeSubView ? (
              <>
                <button
                  className={styles.backBtn}
                  onClick={() => { window.history.replaceState(null, ''); setActiveSubView(null) }}
                  title="Zurück zur Hauptdiskussion"
                >
                  ← Zurück
                </button>
                <div className={styles.modalTitle}>📂 {subViewData?.sub_name || activeSubView}</div>
              </>
            ) : (
              <div className={styles.modalTitle}>💬 {discussion.name}</div>
            )}
            <button className={styles.readmeBtn} onClick={() => setShowReadmeModal(true)} title="README aktualisieren">
              📋 README
            </button>
          </div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.splitView} ref={splitViewRef}>
          {/* LEFT: Document */}
          <div className={styles.docPanel} style={{ width: `${splitRatio}%` }}>
            <div className={styles.docTabs}>
              <button
                className={`${styles.docTab} ${activeTab === 'discussion' ? styles.docTabActive : ''}`}
                onClick={() => setActiveTab('discussion')}
              >
                💬 Diskussion
              </button>
              <button
                className={`${styles.docTab} ${activeTab === 'technical' ? styles.docTabActive : ''}`}
                onClick={() => setActiveTab('technical')}
              >
                ⚙ Technisch
              </button>
            </div>
            <div className={styles.docInner}>
              {activeTab === 'discussion' ? (
                <div className={styles.docBody}>
                  {loading ? (
                    <div className={styles.loading}>Lade Diskussion...</div>
                  ) : data ? (
                    <>
                      {/* Sub-View Breadcrumb */}
                      {activeSubView && subViewData ? (
                        <div className={styles.subViewBreadcrumb}>
                          <span className={styles.subViewBreadcrumbLink} onClick={() => { window.history.replaceState(null, ''); setActiveSubView(null) }}>
                            {discussion.name}
                          </span>
                          <span className={styles.subViewBreadcrumbSep}> ▶ </span>
                          <span className={styles.subViewBreadcrumbCurrent}>
                            {subViewData.sub_name || activeSubView}
                          </span>
                        </div>
                      ) : null}

                      {activeSubView ? (
                        /* ── SUB-VIEW ── */
                        subViewLoading ? (
                          <div className={styles.loading}>Lade Sub-Diskussion...</div>
                        ) : subViewData ? (
                          <>
                            {subViewData.parsed && (
                              <>
                                <div className={styles.discHeader}>
                                  <div className={styles.discTitle}>{subViewData.parsed.title}</div>
                                  {subViewData.parsed.question && (
                                    <div className={styles.discQuestion}>{subViewData.parsed.question}</div>
                                  )}
                                </div>
<div className={styles.discStats}>
                                  <span>Erstellt {subViewData.parsed.created_at}</span>
                                  <span className={styles.statsSep}>·</span>
                                  <span className={styles.statDone}>{subViewData.parsed.done_count} ✓</span>
                                  <span className={styles.statsSep}>·</span>
                                  <span className={styles.statOpen}>{subViewData.parsed.open_count} ●</span>
                                  {subViewData.parsed.updated_at && (
                                    <>
                                      <span className={styles.statsSep}>·</span>
                                      <span>Zuletzt {subViewData.parsed.updated_at}</span>
                                    </>
                                  )}
                                  <span className={styles.statsSep}>·</span>
                                  <label className={styles.hideDoneToggle}>
                                    <input type="checkbox" checked={hideDone} onChange={e => {
                                      const checked = e.target.checked
                                      setHideDone(checked)
                                      if (checked) setTocMode('open')
                                      else setTocMode('all')
                                    }} />
                                    <span className={styles.hideDoneLabel}>Ausblenden ✓</span>
                                  </label>
                                </div>
                              </>
                            )}
                            {subViewData.readme_body ? (
                              <div className={styles.markdownContent}
                                dangerouslySetInnerHTML={{
                                  __html: renderMarkdown(
                                    subViewData.readme_body.split('\n').filter(line => {
                                      const t = line.trim()
                                      return !t.startsWith('**Erledigt:**') && !t.startsWith('**Offen:**')
                                    }).join('\n')
                                  )
                                }}
                              />
                            ) : subViewData.readme ? (
                              <div className={styles.markdownContent}
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(subViewData.readme) }}
                              />
                            ) : null}
                            {/* #107: TOC comes before blocks in sub-view */}
                            {generateToc(subViewData.blocks, subViewData.index, subViewData.subs?.map(s => ({...s, _done: getSubDone(s.id, s.status)})), tocMode) && (
                              <div className={styles.markdownContent}
                                dangerouslySetInnerHTML={{ __html: generateToc(subViewData.blocks, subViewData.index, subViewData.subs?.map(s => ({...s, _done: getSubDone(s.id, s.status)})), tocMode) }}
                              />
                            )}
                            {/* Blocks section after TOC — #107: ohne Label, in Mixed-List */}
                            <div>
                            {subViewData.blocks && (
                              <div className={styles.blocksSection}>
                                <BlocksSection
                                md={subViewData.blocks}
                                discussionId={discussion.id}
                                isSub={true}
                                subId={activeSubView}
                                blocksFiles={subViewData.blocks_files}
                                onConvertToSub={handleConvertToSub}
                                onEditBlock={handleEditBlock}
                                onDeleteBlock={handleDeleteBlock}
                                hideDone={hideDone}
                                />
                              </div>
                            )}
                            {subViewData.index && (
                              <div className={styles.markdownContent}
                                dangerouslySetInnerHTML={{ __html: renderIndexMd(subViewData.index, undefined, discussion.id, subViewData.index_files || [], hideDone) }}
                              />
                            )}
                            {/* #107: Sub-subs ohne Label, in Mixed-List */}
                            {subViewData.subs && subViewData.subs.length > 0 && (
                              <>{subViewData.subs
                                  .filter(sub => {
                                    if (!hideDone) return true
                                    const override = subOverrides[sub.id]
                                    if (override === 'done') return false
                                    if (override === 'open') return true
                                    return !(sub.status?.erledigt > 0 && sub.status?.offen === 0)
                                  })
                                  .map((sub, idx) => {
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
<h3 id={`sub-${sub.id}`} className={styles.subDocTitle}>
                                            <span className={styles.subIconCheck}>{(subOverrides[sub.id] === 'done' || (!subOverrides[sub.id] && sub.status?.erledigt > 0 && sub.status?.offen === 0)) ? '✅' : '📂'}</span> #{subNum}: {readmeTitle(sub.readme) || sub.name}
                                            {(subOverrides[sub.id] === 'done' || (!subOverrides[sub.id] && sub.status?.erledigt > 0 && sub.status?.offen === 0)) && (
                                              <span className={`${styles.badge} ${styles.badgeDone}`}>✓ {sub.status.erledigt} erledigt</span>
                                            )}
                                            {(subOverrides[sub.id] === 'open' || sub.status?.offen > 0) && subOverrides[sub.id] !== 'done' && (
                                              <span className={`${styles.badge} ${styles.badgeOpen}`}>● {sub.status.offen} offen</span>
                                            )}
                                          </h3>
                                          <button
                                            className={styles.copyLinkBtn}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              const override = subOverrides[sub.id]
                                              if (override === 'done') {
                                                setSubOverrides(prev => ({...prev, [sub.id]: 'open'}))
                                              } else if (override === 'open') {
                                                setSubOverrides(prev => ({...prev, [sub.id]: 'done'}))
                                              } else {
                                                // Kein Override → umgekehrt zur Auto-Erkennung
                                                const isAutoDone = sub.status?.erledigt > 0 && sub.status?.offen === 0
                                                setSubOverrides(prev => ({...prev, [sub.id]: isAutoDone ? 'open' : 'done'}))
                                              }
                                            }}
                                            title="Erledigt/Offen umschalten"
                                          >{(subOverrides[sub.id] === 'done' || (!subOverrides[sub.id] && sub.status?.erledigt > 0 && sub.status?.offen === 0)) ? '✅' : '⬜'}</button>
                                          <button
                                            className={styles.copyLinkBtn}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              const subId = sub.id
                                              const parentId = discussion.id + '/' + (activeSubView || '')
                                              const ref = parentId.replace(/\/+$/, '') + '/' + subId
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
                                              const toc = generateToc(sub.blocks, sub.index, sub.subs || [])
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
                                              onClick={e => { e.stopPropagation(); window.history.pushState({subViewMode: true}, ''); setActiveSubView(activeSubView + '/' + sub.id) }}
                                              role="button" tabIndex={0}
                                              onKeyDown={e => { if (e.key === 'Enter') { window.history.pushState({subViewMode: true}, ''); setActiveSubView(activeSubView + '/' + sub.id) } }}
                                            >
                                              → Vollständige Ansicht
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </>)}
                            </div>
                            {/* Box hinzufügen — Sub-View */}
                            <div className={styles.addBoxSection}>
                              <div className={styles.sectionLabel}>➕ Neue Textbox</div>
                              <input
                                className={styles.addBoxInput}
                                type="text"
                                placeholder="Titel der Box..."
                                value={boxTitle}
                                onChange={e => setBoxTitle(e.target.value)}
                              />
                              <textarea
                                className={styles.addBoxTextarea}
                                placeholder="Inhalt (Markdown)..."
                                value={boxContent}
                                onChange={e => setBoxContent(e.target.value)}
                                onPaste={e => {
                                  const items = e.clipboardData?.items
                                  if (!items) return
                                  for (const item of items) {
                                    if (item.type.startsWith('image/')) {
                                      const file = item.getAsFile()
                                      if (file && file.size <= 5 * 1024 * 1024) {
                                        setPendingImage(file)
                                        e.preventDefault()
                                      }
                                      break
                                    }
                                  }
                                }}
                              />
                              {/* Bild-Vorschau */}
                              {pendingImage && (
                                <div className={styles.pendingImagePreview}>
                                  <img
                                    src={URL.createObjectURL(pendingImage)}
                                    alt="Vorschau"
                                    className={styles.pendingImageThumb}
                                  />
                                  <span className={styles.pendingImageName}>{pendingImage.name}</span>
                                  <button
                                    className={styles.pendingImageRemove}
                                    onClick={() => setPendingImage(null)}
                                    title="Bild entfernen"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                              <input
                                ref={boxImageInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={e => {
                                  const file = e.target.files?.[0]
                                  if (file && file.size <= 5 * 1024 * 1024) {
                                    setPendingImage(file)
                                  }
                                  e.target.value = ''
                                }}
                              />
                              <div className={styles.addBoxActions}>
                                <button
                                  className={styles.previewBtnPrimary}
                                  onClick={handleAddBox}
                                  disabled={boxLoading || !boxTitle.trim()}
                                >
                                  {boxLoading ? '⏳ Speichern...' : '➕ Box hinzufügen'}
                                </button>
                                <button
                                  className={styles.addBoxImageBtn}
                                  onClick={() => boxImageInputRef.current?.click()}
                                  title={pendingImage ? 'Bild ausgewählt' : 'Bild einfügen (STRG+V oder Dateiauswahl)'}
                                >
                                  {pendingImage ? '📷✓' : '📷'}
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className={styles.loading}>Fehler beim Laden</div>
                        )
                      ) : (
                        /* ── MAIN-VIEW ── */
                        <>
                          {data.parsed && (
                            <>
                              <div className={styles.discHeader}>
                                <div className={styles.discTitle}>{data.parsed.title}</div>
                                {data.parsed.question && (
                                  <div className={styles.discQuestion}>{data.parsed.question}</div>
                                )}
                              </div>
<div className={styles.discStats}>
                                <span>Erstellt {data.parsed.created_at}</span>
                                <span className={styles.statsSep}>·</span>
                                <span className={styles.statDone}>{data.parsed.done_count} ✓</span>
                                <span className={styles.statsSep}>·</span>
                                <span className={styles.statOpen}>{data.parsed.open_count} ●</span>
                                {data.parsed.updated_at && (
                                  <>
                                    <span className={styles.statsSep}>·</span>
                                    <span>Zuletzt {data.parsed.updated_at}</span>
                                  </>
                                )}
                                <span className={styles.statsSep}>·</span>
                                <label className={styles.hideDoneToggle}>
                                  <input type="checkbox" checked={hideDone} onChange={e => {
                                      const checked = e.target.checked
                                      setHideDone(checked)
                                      if (checked) setTocMode('open')
                                      else setTocMode('all')
                                    }} />
                                  <span className={styles.hideDoneLabel}>Ausblenden ✓</span>
                                </label>
                              </div>
                            </>
                          )}
                          {data.readme_body ? (
                            <div className={styles.markdownContent}
                              dangerouslySetInnerHTML={{
                                __html: renderMarkdown(
                                  data.readme_body.split('\n').filter(line => {
                                    const t = line.trim()
                                    return !t.startsWith('**Erledigt:**') && !t.startsWith('**Offen:**')
                                  }).join('\n')
                                )
                              }}
                            />
                          ) : data.readme ? (
                            <div className={styles.markdownContent}
                              dangerouslySetInnerHTML={{ __html: renderMarkdown(data.readme) }}
                            />
                          ) : null}
                          {/* TOC */}
                          {generateToc(data.blocks, data.index, data.subs?.map(s => ({...s, _done: getSubDone(s.id, s.status)})), tocMode) && (
                            <div className={styles.markdownContent}
                              dangerouslySetInnerHTML={{ __html: generateToc(data.blocks, data.index, data.subs?.map(s => ({...s, _done: getSubDone(s.id, s.status)})), tocMode) }}
                            />
                          )}
                          {/* Index — zwischen TOC und Mixed-List */}
                          {data.index && (
                            <div className={styles.markdownContent}
                              dangerouslySetInnerHTML={{ __html: renderIndexMd(data.index, undefined, discussion.id, data.index_files || [], hideDone) }}
                            />
                          )}
                          {/* #107: Mixed list — blocks + subs ohne Label */}
                          <div>
                          {data.blocks && (
                            <div className={styles.blocksSection}>
                              <BlocksSection
                                md={data.blocks}
                                discussionId={discussion.id}
                                isSub={false}
                                subId={undefined}
                                blocksFiles={data.blocks_files}
                                onConvertToSub={handleConvertToSub}
                                onEditBlock={handleEditBlock}
                                onDeleteBlock={handleDeleteBlock}
                                hideDone={hideDone}
                              />
                            </div>
                          )}
                          {data.subs && data.subs
                            .filter(sub => {
                              if (!hideDone) return true
                              const override = subOverrides[sub.id]
                              if (override === 'done') return false
                              if (override === 'open') return true
                              return !(sub.status?.erledigt > 0 && sub.status?.offen === 0)
                            })
                            .map((sub, idx) => {
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
                                  <h3 id={`sub-${sub.id}`} className={styles.subDocTitle}>
                                    <span className={styles.subIconCheck}>{(subOverrides[sub.id] === 'done' || (!subOverrides[sub.id] && sub.status?.erledigt > 0 && sub.status?.offen === 0)) ? '✅' : '📂'}</span> #{subNum}: {readmeTitle(sub.readme) || sub.name}
                                    {(subOverrides[sub.id] === 'done' || (!subOverrides[sub.id] && sub.status?.erledigt > 0 && sub.status?.offen === 0)) && (
                                      <span className={`${styles.badge} ${styles.badgeDone}`}>✓ {sub.status.erledigt} erledigt</span>
                                    )}
                                    {(subOverrides[sub.id] === 'open' || sub.status?.offen > 0) && subOverrides[sub.id] !== 'done' && (
                                      <span className={`${styles.badge} ${styles.badgeOpen}`}>● {sub.status.offen} offen</span>
                                    )}
                                  </h3>
                                  <button
                                    className={styles.copyLinkBtn}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const override = subOverrides[sub.id]
                                      if (override === 'done') {
                                        setSubOverrides(prev => ({...prev, [sub.id]: 'open'}))
                                      } else if (override === 'open') {
                                        setSubOverrides(prev => ({...prev, [sub.id]: 'done'}))
                                      } else {
                                        // Kein Override → umgekehrt zur Auto-Erkennung
                                        const isAutoDone = sub.status?.erledigt > 0 && sub.status?.offen === 0
                                        setSubOverrides(prev => ({...prev, [sub.id]: isAutoDone ? 'open' : 'done'}))
                                      }
                                    }}
                                    title="Erledigt/Offen umschalten"
                                  >{(subOverrides[sub.id] === 'done' || (!subOverrides[sub.id] && sub.status?.erledigt > 0 && sub.status?.offen === 0)) ? '✅' : '⬜'}</button>
                                  <button
                                    className={styles.copyLinkBtn}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const ref = discussion.id + '/' + sub.id
                                      navigator.clipboard.writeText(ref)
                                      onCopySub(sub.id)
                                      setTimeout(() => onCopySub(null), 2000)
                                    }}
                                    title={'Referenz kopieren: ' + discussion.id + '/' + sub.id}
                                  >{copiedSub === sub.id ? '✅' : '🔗'}</button>
                                  <span className={styles.subDocArrow}>{isExpanded ? '▾' : '▸'}</span>
                                </div>
                                {isExpanded && (
                                  <div className={styles.subDocBody}>
                                    {(() => {
                                      // TOC aus blocks.md + index.md generieren (#22)
                                      const toc = generateToc(sub.blocks, sub.index, sub.subs || [])
                                      if (toc) {
                                        return (
                                          <div className={styles.markdownContent}
                                            dangerouslySetInnerHTML={{ __html: toc }}
                                          />
                                        )
                                      }
                                      // Fallback: README-Präambel (wenn kein blocks/index)
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
                          {/* Box hinzufügen — Main-View */}
                          <div className={styles.addBoxSection}>
                            <div className={styles.sectionLabel}>➕ Neue Textbox</div>
                            <input
                              className={styles.addBoxInput}
                              type="text"
                              placeholder="Titel der Box..."
                              value={boxTitle}
                              onChange={e => setBoxTitle(e.target.value)}
                            />
                            <textarea
                              className={styles.addBoxTextarea}
                              placeholder="Inhalt (Markdown)..."
                              value={boxContent}
                              onChange={e => setBoxContent(e.target.value)}
                              onPaste={e => {
                                const items = e.clipboardData?.items
                                if (!items) return
                                for (const item of items) {
                                  if (item.type.startsWith('image/')) {
                                    const file = item.getAsFile()
                                    if (file && file.size <= 5 * 1024 * 1024) {
                                      setPendingImage(file)
                                      e.preventDefault()
                                    }
                                    break
                                  }
                                }
                              }}
                            />
                            {/* Bild-Vorschau */}
                            {pendingImage && (
                              <div className={styles.pendingImagePreview}>
                                <img
                                  src={URL.createObjectURL(pendingImage)}
                                  alt="Vorschau"
                                  className={styles.pendingImageThumb}
                                />
                                <span className={styles.pendingImageName}>{pendingImage.name}</span>
                                <button
                                  className={styles.pendingImageRemove}
                                  onClick={() => setPendingImage(null)}
                                  title="Bild entfernen"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                            <input
                              ref={boxImageInputRef}
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={e => {
                                const file = e.target.files?.[0]
                                if (file && file.size <= 5 * 1024 * 1024) {
                                  setPendingImage(file)
                                }
                                e.target.value = ''
                              }}
                            />
                            <div className={styles.addBoxActions}>
                              <button
                                className={styles.previewBtnPrimary}
                                onClick={handleAddBox}
                                disabled={boxLoading || !boxTitle.trim()}
                              >
                                {boxLoading ? '⏳ Speichern...' : '➕ Box hinzufügen'}
                              </button>
                              <button
                                className={styles.addBoxImageBtn}
                                onClick={() => setShowImageModal(true)}
                                title="📷 Bild-Modal (STRG+V oder Upload)"
                              >
                                🖼️
                              </button>
                              <button
                                className={styles.addBoxImageBtn}
                                onClick={() => boxImageInputRef.current?.click()}
                                title={pendingImage ? 'Bild ausgewählt' : 'Bild einfügen (STRG+V oder Dateiauswahl)'}
                              >
                                {pendingImage ? '📷✓' : '📷'}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className={styles.loading}>Fehler beim Laden</div>
                  )}
                </div>
              ) : (
                <div className={styles.docBody}>
                  {gitLogLoading ? (
                    <div className={styles.loading}>Lade Git-History...</div>
                  ) : gitLog && gitLog.commits ? (
                    gitLog.commits.length === 0 ? (
                      <div className={styles.loading}>Keine Commits gefunden</div>
                    ) : (
                      <div className={styles.gitLogList}>
                        {gitLog.commits.map((c, i) => (
                          <div key={c.sha || i} className={styles.gitLogEntry}>
                            <div className={styles.gitLogHeader}>
                              <code className={styles.gitLogSha}>{c.sha}</code>
                              <span className={styles.gitLogDate}>{c.date}</span>
                            </div>
                            <div className={styles.gitLogMessage}>{c.message}</div>
                            <div className={styles.gitLogMeta}>
                              <span className={styles.gitLogAuthor}>{c.author}</span>
                              <span className={styles.gitLogStats}>
                                {c.files_changed} Datei{c.files_changed !== 1 ? 'en' : ''} ·
                                <span className={styles.gitLogIns}> +{c.insertions}</span>
                                {c.deletions > 0 && <span className={styles.gitLogDel}> -{c.deletions}</span>}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className={styles.loading}>Git-History nicht verfügbar</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* DIVIDER */}
          <div
            className={isDragging ? styles.splitDividerActive : styles.splitDivider}
            onMouseDown={(e) => { e.preventDefault(); setIsDragging(true) }}
          />

          {/* RIGHT: Preview Panel */}
          <div className={styles.previewPanel} style={{ width: `${100 - splitRatio}%` }}>
            {previewState === 'idle' && (
              <div className={styles.previewPlaceholder}>
                <h3>🗣️ Unter Vorbehalt</h3>
                <p>
                  Klicke auf <strong>"Hier weiterdiskutieren"</strong> um eine neue Session zu starten.
                  Die Diskussion läuft dann in <strong>#diskussion-one</strong> auf Discord.
                </p>
                <button className={styles.previewBtnPrimary} onClick={handleStartSession}>
                  🎤 Hier weiterdiskutieren
                </button>
              </div>
            )}

            {previewState === 'starting' && (
              <div className={styles.previewPlaceholder}>
                <div className={styles.spinner} />
                <p>Starte Diskussion via Discord-Webhook…</p>
              </div>
            )}

            {previewState === 'polling' && (
              <div className={styles.previewPlaceholder}>
                <div className={styles.spinner} />
                <p>Warte auf Antwort von Hermi in #diskussion-one…</p>
                <p className={styles.pollingHint}>Session: {sessionTitle}</p>
                <button className={styles.previewBtnDanger} onClick={handleDiscard}>
                  ✕ Abbrechen
                </button>
              </div>
            )}

            {previewState === 'active' && (
              <div className={styles.previewActive}>
                {/* Session Header */}
                <div className={styles.previewHeader}>
                  <div className={styles.previewHeaderInfo}>
                    <span className={styles.previewDot} />
                    <span className={styles.previewSessionName}>{sessionTitle || 'Aktive Session'}</span>
                    <span className={styles.previewMsgCount}>
                      {userMsgCount} User · {assistantMsgCount} Hermi
                    </span>
                  </div>
                  <div className={styles.previewHeaderActions}>
                    <button className={styles.previewBtnSmall} onClick={handleStartSession} title="Neue Session starten">
                      🔄 Neu starten
                    </button>
                    <button className={styles.previewBtnDangerSmall} onClick={handleDiscard} title="Session verwerfen">
                      ✕
                    </button>
                  </div>
                </div>

                {/* Breadcrumb */}
                <div className={styles.previewBreadcrumb}>
                  <span className={styles.breadcrumbDotMain} />
                  <span className={styles.breadcrumbMain}>{discussion.name}</span>
                </div>

                {/* Chat Messages */}
                <div className={styles.chatArea}>
                  {messages.filter(m => m.role !== 'tool' && m.role !== 'session_meta').map((m, idx) => {
                    const realIdx = messages.indexOf(m)
                    const isSelected = selectedSet.has(realIdx)
                    const isUser = m.role === 'user'
                    const isAssistant = m.role === 'assistant'
                    return (
                      <div
                        key={idx}
                        className={`${styles.chatMsg} ${isSelected ? styles.chatMsgSelected : ''} ${isUser ? styles.chatMsgUser : styles.chatMsgHermi}`}
                        onClick={() => toggleMessage(realIdx)}
                      >
                        <div className={styles.chatMsgHeader}>
                          <span className={isUser ? styles.chatAuthorUser : styles.chatAuthorHermi}>
                            {isUser ? 'Max' : 'Hermi'}
                          </span>
                          <span className={styles.chatTime}>{m.timestamp}</span>
                        </div>
                        <div className={styles.chatMsgContent}>{renderMessageContent(m.content)}</div>
                      </div>
                    )
                  })}
                  {messages.filter(m => m.role !== 'tool' && m.role !== 'session_meta').length === 0 && (
                    <div className={styles.chatEmpty}>Noch keine Nachrichten. Diskutiere in #diskussion-one auf Discord.</div>
                  )}
                </div>

                {/* Selection Counter */}
                <div className={styles.selectionBar}>
                  <span>{selectedCount > 0 ? `${selectedCount} von ${messages.filter(m => m.role !== 'tool' && m.role !== 'session_meta').length} Nachrichten ausgewählt` : 'Klicke auf Nachrichten zur Auswahl'}</span>
                </div>

                {/* Summary Editor */}
                <div className={styles.summaryEditor}>
                  <textarea
                    className={styles.summaryTextarea}
                    placeholder={freitextMode ? "Freitext eingeben…" : "Stichpunkte oder generierten Block editieren…"}
                    value={userNotes}
                    onChange={e => setUserNotes(e.target.value)}
                  />
                  <div className={styles.summaryActions}>
                    <button className={styles.previewBtn} onClick={handleGenerate} disabled={previewState === 'generating'}>
                      🤖 Von Hermi generieren
                    </button>
                    <button className={styles.previewBtn} onClick={() => {
                      setFreitextMode(true)
                      document.querySelector(`.${styles.summaryTextarea.split(' ')[0]}`)?.focus()
                    }} title="Freitext schreiben">
                      ✏️ Freitext
                    </button>
                    <button className={styles.previewBtn} onClick={() => fileInputRef.current?.click()} title="Bild einfügen">
                      📷 Bild einfügen
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => {
                          setUserNotes(prev => prev + (prev ? '\n' : '') + `![${file.name}](${reader.result})`)
                        }
                        reader.readAsDataURL(file)
                        e.target.value = ''
                      }}
                    />
                    <button className={styles.previewBtn} onClick={() => setShowSubDialog(true)} title="Neue Sub-Diskussion starten">
                      + Sub-Diskussion starten
                    </button>
                    <button className={styles.previewBtnPrimary} onClick={handleAdopt} disabled={previewState === 'adopting' || !userNotes.trim()}>
                      ✅ In Dokument übernehmen
                    </button>
                  </div>
                </div>
              </div>
            )}

            {previewState === 'generating' && (
              <div className={styles.previewPlaceholder}>
                <div className={styles.spinner} />
                <p>Hermi generiert Zusammenfassung…</p>
              </div>
            )}

            {previewState === 'adopting' && (
              <div className={styles.previewPlaceholder}>
                <div className={styles.spinner} />
                <p>⏳ Hermi arbeitet an der Übernahme…</p>
                <p className={styles.pollingHint}>Das kann bis zu 30s dauern.</p>
              </div>
            )}

            {previewState === 'error' && (
              <div className={styles.previewError}>
                <div className={styles.errorBanner}>
                  <span>❌ {errorMsg || 'Unbekannter Fehler'}</span>
                  <button className={styles.previewBtnDangerSmall} onClick={handleDiscard}>
                    ✕ Schließen
                  </button>
                </div>
                <button className={styles.previewBtn} onClick={handleStartSession} style={{ marginTop: 12 }}>
                  🔄 Erneut versuchen
                </button>
              </div>
            )}

            {/* Error Banner (non-blocking) with retry */}
            {errorMsg && previewState === 'active' && (
              <div className={styles.errorBanner}>
                <span>{errorMsg}</span>
                <div className={styles.errorBannerActions}>
                  {errorMsg.startsWith('❌') && (userNotes || generatedBlock) && (
                    <button className={styles.errorRetryBtn} onClick={handleAdopt}>
                      🔄 Erneut versuchen
                    </button>
                  )}
                  <button className={styles.errorBannerClose} onClick={() => setErrorMsg('')}>✕</button>
                </div>
              </div>
            )}

            {/* Sub-Start Dialog (C.3) */}
            {showSubDialog && (
              <div className={styles.subDialogOverlay} onClick={(e) => { if (e.target === e.currentTarget) { setShowSubDialog(false); setSubDialogName('') } }}>
                <div className={styles.subDialog}>
                  <div className={styles.subDialogHeader}>
                    + Neue Sub-Diskussion starten
                  </div>
                  <input
                    className={styles.subDialogInput}
                    type="text"
                    placeholder="z.B. API-Key-Handling"
                    value={subDialogName}
                    onChange={e => setSubDialogName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && subDialogName.trim()) { const n = subDialogName.trim(); setShowSubDialog(false); setSubDialogName(''); handleStartSub(n) } }}
                    autoFocus
                  />
                  <div className={styles.subDialogHint}>
                    Eine Sub-Diskussion entsteht, wenn eine KI-Session zu einer konkreten Fragestellung stattfand. Normale Blöcke dokumentieren Ideen und Entscheidungen — Subs sind das Ergebnis einer Diskussion mit Hermi.
                  </div>
                  <div className={styles.subDialogActions}>
                    <button className={styles.previewBtn} onClick={() => { setShowSubDialog(false); setSubDialogName('') }}>
                      Abbrechen
                    </button>
                    <button
                      className={styles.previewBtnPrimary}
                      disabled={!subDialogName.trim()}
                      onClick={() => { const n = subDialogName.trim(); setShowSubDialog(false); setSubDialogName(''); handleStartSub(n) }}
                    >
                      🚀 Starten
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* README Modal */}
        {showReadmeModal && (
          <ReadmeModal
            discussionId={discussion.id}
            onClose={() => setShowReadmeModal(false)}
            onUpdate={handleReadmeUpdate}
            isSub={false}
            subId={null}
          />
        )}
        {showImageModal && (
          <ImageUploadModal
            discussionId={discussion.id}
            activeSubView={!!activeSubView}
            subId={activeSubView}
            onClose={() => setShowImageModal(false)}
            onSuccess={() => fetchDiscussionData()}
          />
        )}
      </div>
      {/* Debug-Log für Toggle-Testing — sichtbar für Kazzle */}
      {debugLog.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#1a1a2e', color: '#a0ffa0', fontSize: 11, fontFamily: 'monospace', padding: '4px 8px', zIndex: 9999, borderTop: '1px solid #333', opacity: 0.9 }}>
          {debugLog[debugLog.length - 1].text}
          {debugLog.length > 1 && <span style={{ opacity: 0.4, marginLeft: 12 }}>+{debugLog.length - 1} ältere</span>}
        </div>
      )}
    </div>
  )
}

// ─── Image Upload Modal (#37) ──────────────────────────────────────────────────

function ImageUploadModal({ discussionId, activeSubView, subId, onClose, onSuccess }) {
  const [pendingImage, setPendingImage] = useState(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  // Default title: Screenshot DD.MM.YYYY
  useEffect(() => {
    const now = new Date()
    const d = String(now.getDate()).padStart(2, '0')
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const y = now.getFullYear()
    setTitle(`Screenshot ${d}.${m}.${y}`)
  }, [])

  // Global paste on modal overlay
  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file && file.size <= 5 * 1024 * 1024) {
          setPendingImage(file)
          e.preventDefault()
        }
        break
      }
    }
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.size <= 5 * 1024 * 1024) {
      setPendingImage(file)
    }
    e.target.value = ''
  }

  const handleSubmit = () => {
    if (!pendingImage) return
    setLoading(true)

    const formData = new FormData()
    formData.append('discussion_id', discussionId)
    formData.append('title', title.trim())
    formData.append('image', pendingImage)
    formData.append('is_sub', activeSubView ? 'true' : 'false')
    if (activeSubView && subId) formData.append('sub_id', subId)

    fetch('/api/diskhub/add-box', {
      method: 'POST',
      body: formData,
    })
      .then(r => r.json())
      .then(d => {
        setLoading(false)
        if (d.status === 'ok') {
          onSuccess()
          onClose()
        }
      })
      .catch(() => {
        setLoading(false)
      })
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.imageModalOverlay} onClick={handleOverlayClick} onPaste={handlePaste}>
      <div className={styles.imageModalContent}>
        <button className={styles.imageModalClose} onClick={onClose}>✕</button>
        <div className={styles.imageModalBody}>
          {!pendingImage ? (
            <div className={styles.imageDropzone}>
              <div className={styles.imageDropzoneIcon}>📷</div>
              <div className={styles.imageDropzoneText}>STRG+V zum Einfügen</div>
              <div className={styles.imageDropzoneSub}>oder</div>
              <button className={styles.imageUploadBtn} onClick={() => fileInputRef.current?.click()}>
                Datei auswählen
              </button>
            </div>
          ) : (
            <div className={styles.imagePreviewArea}>
              <img
                src={URL.createObjectURL(pendingImage)}
                alt="Vorschau"
                className={styles.imagePreview}
              />
              <button
                className={styles.imagePreviewRemove}
                onClick={() => setPendingImage(null)}
                title="Bild entfernen"
              >
                ✕
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <div className={styles.imageModalFooter}>
            <input
              className={styles.imageTitleInput}
              type="text"
              placeholder="Titel (optional)"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <button
              className={styles.imageSubmitBtn}
              onClick={handleSubmit}
              disabled={loading || !pendingImage}
            >
              {loading ? '⏳' : '✅ Bestätigen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Page() {
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [copiedSub, setCopiedSub] = useState(null)

  const fetchList = useCallback(() => {
    setLoading(true)
    const url = search ? `${API}/list?search=${encodeURIComponent(search)}` : `${API}/list`
    fetch(url)
      .then(r => r.json())
      .then(d => { setDiscussions(d.discussions || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search])

  useEffect(() => { fetchList() }, [fetchList])

  // Auto-Scroll zu index.md-Eintrag per #punkt- Hash (#B)
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.startsWith('#punkt-')) {
      const id = hash.slice(1)
      requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
  }, [selected])

  // Globaler Click-Handler für [data-copy-entry] und [data-toggle-index-done] Buttons (#B)
  useEffect(() => {
    const handler = (e) => {
      const btn = e.target.closest('[data-copy-entry]')
      if (btn) {
        const ref = btn.getAttribute('data-ref')
        if (ref) navigator.clipboard.writeText(ref)
        const origText = btn.textContent
        btn.textContent = '✅'
        setTimeout(() => { btn.textContent = origText }, 2000)
        return
      }
      }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  return (
    <div className={styles.diskhubContainer}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          💬 DiskHub
          <span>{discussions.length}</span>
        </div>
        <div className={styles.searchRow}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Diskussion suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Lade Diskussionen...</div>
      ) : discussions.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>Keine Diskussionen gefunden</h3>
          <p>Erstelle eine neue Diskussion oder passe deine Suche an.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {discussions.map(d => (
            <DiscussionCard key={d.id} discussion={d} onClick={() => setSelected(d)} />
          ))}
        </div>
      )}

      {selected && (
        <SplitViewModal discussion={selected} onClose={() => setSelected(null)} copiedSub={copiedSub} onCopySub={setCopiedSub} />
      )}
    </div>
  )
}