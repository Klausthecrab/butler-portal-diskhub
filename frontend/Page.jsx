import { useState, useEffect, useCallback, useRef } from 'react'
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

function renderMarkdown(md) {
  if (!md) return ''
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^---+/gm, '<hr />')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, (m) => {
      if (m.startsWith('<')) return m
      return m
    })
  return `<p>${html}</p>`
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

// ─── Readme Update Modal ──────────────────────────────────────────────────────

function ReadmeModal({ discussionId, onClose, onUpdate, isSub, subId }) {
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState('')
  const [suggested, setSuggested] = useState('')
  const [editing, setEditing] = useState(false)
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
          <div className={styles.readmeBody}>
            <div className={styles.loading}>Hermi vergleicht README mit index.md…</div>
          </div>
        ) : (
          <div className={styles.readmeBody}>
            <div className={styles.readmeCompare}>
              <div className={styles.readmeCol}>
                <div className={styles.readmeColLabel}>Aktuelle README</div>
                <pre className={styles.readmePre}>{current}</pre>
              </div>
              <div className={styles.readmeCol}>
                <div className={styles.readmeColLabel}>Vorschlag</div>
                {editing ? (
                  <textarea
                    className={styles.readmeTextarea}
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                  />
                ) : (
                  <pre className={styles.readmePre}>{suggested}</pre>
                )}
              </div>
            </div>
            <div className={styles.readmeActions}>
              <button className={styles.previewBtn} onClick={() => { setEditing(!editing); if (!editing) setEditText(suggested) }}>
                {editing ? '📖 Vorschau' : '✏️ Bearbeiten'}
              </button>
              <button className={styles.previewBtnPrimary} onClick={() => onUpdate(editing ? editText : suggested)}>
                ✅ Übernehmen
              </button>
            </div>
          </div>
        )}
      </div>
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

function SplitViewModal({ discussion, onClose }) {
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
  const [generatedBlock, setGeneratedBlock] = useState('')
  const [triggeredAt, setTriggeredAt] = useState(null)
  const [showReadmeModal, setShowReadmeModal] = useState(false)
  const pollRef = useRef(null)
  const [activeSubId, setActiveSubId] = useState(null)
  const [activeTab, setActiveTab] = useState('discussion')
  const [gitLog, setGitLog] = useState(null)
  const [gitLogLoading, setGitLogLoading] = useState(false)

  // SSE Streaming
  const lastTsRef = useRef(0)
  const sseRef = useRef(null)
  const pollFallbackRef = useRef(null)

  // Split-View Resizer
  const [splitRatio, setSplitRatio] = useState(() => {
    try { return parseFloat(localStorage.getItem('diskhub-split-ratio') || '55') || 55 }
    catch (e) { return 55 }
  })
  const [isDragging, setIsDragging] = useState(false)
  const splitViewRef = useRef(null)
  const splitRatioRef = useRef(splitRatio)

  // Lade Diskussionsdaten
  useEffect(() => {
    setLoading(true)
    fetch(`${API}/${discussion.id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [discussion.id])

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

  // Git-Log laden bei Tab-Wechsel
  useEffect(() => {
    if (activeTab !== 'technical' || !discussion?.id) return
    setGitLogLoading(true)
    const currentSubId = activeSubId === '__main__' ? null : activeSubId
    const params = new URLSearchParams()
    if (currentSubId) params.set('sub_id', currentSubId)
    fetch(`${API}/git-log/${discussion.id}?${params}`)
      .then(r => r.json())
      .then(d => { setGitLog(d); setGitLogLoading(false) })
      .catch(() => { setGitLog(null); setGitLogLoading(false) })
  }, [activeTab, discussion?.id, activeSubId])

  // Session-Polling
  useEffect(() => {
    if (previewState !== 'polling') return

    let attempts = 0
    const maxAttempts = 60 // 5min bei 5s Intervall

    const poll = () => {
      const params = new URLSearchParams({ title: sessionTitle })
      if (triggeredAt) params.set('since', String(triggeredAt))

      fetch(`${API}/session-status?${params}`)
        .then(r => r.json())
        .then(d => {
          if (d.found && d.session) {
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
        if (data.messages && data.messages.length > 0) {
          setMessages(prev => [...prev, ...data.messages])
        }
      } catch (e) {
        // Ungültige Daten ignorieren
      }
    }

    eventSource.onerror = () => {
      // EventSource reconnectiert automatisch in den meisten Browsern
      // Fallback: einmalig nach 30s ohne SSE-Daten polling starten
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
    setPreviewState('starting')
    const currentSubId = activeSubId === '__main__' ? null : activeSubId

    fetch(`${API}/start-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discussion_id: discussion.id,
        is_sub: !!currentSubId,
        sub_id: currentSubId || undefined,
      }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'triggered' || d.status === 'partial') {
          setSessionTitle(d.session_title)
          setTriggeredAt(Math.floor(Date.now() / 1000))
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

  // Sub-Diskussion starten
  const handleStartSub = () => {
    setPreviewState('starting')
    setActiveSubId(null) // zurücksetzen für neuen Flow
    fetch(`${API}/start-sub-discussion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discussion_id: discussion.id,
        sub_id: 'neue-sub-' + Date.now(),
      }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'triggered' || d.status === 'partial') {
          setSessionTitle(d.session_title)
          setTriggeredAt(Math.floor(Date.now() / 1000))
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
            <div className={styles.modalTitle}>💬 {discussion.name}</div>
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
                      {data.readme && (
                        <div className={styles.markdownContent}
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(data.readme) }}
                        />
                      )}
                      {data.index && (
                        <div className={styles.markdownContent}
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(data.index) }}
                        />
                      )}
                      {data.subs && data.subs.map(sub => (
                        <div key={sub.id} className={styles.subDocBlock}>
                          <h3 className={styles.subDocTitle}>📂 {sub.name}</h3>
                          {sub.readme && (
                            <div className={styles.markdownContent}
                              dangerouslySetInnerHTML={{ __html: renderMarkdown(sub.readme) }}
                            />
                          )}
                          {sub.index && (
                            <div className={styles.markdownContent}
                              dangerouslySetInnerHTML={{ __html: renderMarkdown(sub.index) }}
                            />
                          )}
                        </div>
                      ))}
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

                {/* Breadcrumb / Sub-Tabs */}
                <div className={styles.previewBreadcrumb}>
                  <span className={styles.breadcrumbMain}>📌 {discussion.name}</span>
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
                    placeholder="Stichpunkte oder generierten Block editieren…"
                    value={userNotes}
                    onChange={e => setUserNotes(e.target.value)}
                  />
                  <div className={styles.summaryActions}>
                    <button className={styles.previewBtn} onClick={handleGenerate} disabled={previewState === 'generating'}>
                      🤖 Von Hermi generieren
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

  const fetchList = useCallback(() => {
    setLoading(true)
    const url = search ? `${API}/list?search=${encodeURIComponent(search)}` : `${API}/list`
    fetch(url)
      .then(r => r.json())
      .then(d => { setDiscussions(d.discussions || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search])

  useEffect(() => { fetchList() }, [fetchList])

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
        <SplitViewModal discussion={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}