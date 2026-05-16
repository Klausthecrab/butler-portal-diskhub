import { useState, useEffect, useCallback } from 'react'
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
  // Simple markdown to HTML (MVP — kein Parser, nur Basics)
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Horizontal rules
    .replace(/^---+/gm, '<hr />')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, (m) => {
      if (m.startsWith('<')) return m
      return m
    })
  return `<p>${html}</p>`
}

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

function SplitViewModal({ discussion, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`${API}/${discussion.id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [discussion.id])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>💬 {discussion.name}</div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.splitView}>
          {/* LEFT: Document */}
          <div className={styles.docPanel}>
            <div className={styles.docInner}>
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
                      <div key={sub.id} style={{ marginTop: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: 8 }}>📂 {sub.name}</h3>
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
            </div>
          </div>
          {/* RIGHT: Preview Panel (Placeholder) */}
          <div className={styles.previewPanel}>
            <div className={styles.previewPlaceholder}>
              <h3>🗣️ Unter Vorbehalt</h3>
              <p>
                Hier erscheint später der Live-Chat aus Discord.<br />
                Klicke auf <strong>"Hier weiterdiskutieren"</strong> um eine neue Session zu starten.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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