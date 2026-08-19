import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext.jsx'

function timeAgo(ts) {
  const d = Math.floor((Date.now() - ts) / 1000)
  if (d < 60) return d + 's ago'
  if (d < 3600) return Math.floor(d / 60) + 'm ago'
  if (d < 86400) return Math.floor(d / 3600) + 'h ago'
  return Math.floor(d / 86400) + 'd ago'
}
const icons = { leave: '🗓', doc: '📄', timesheet: '⏱', recruit: '👥', reminder: '🔔' }

export default function NotificationBell() {
  const { list, unreadCount, markRead, markAllRead, remove } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="btn btn-ghost" onClick={() => setOpen(o => !o)} style={{ position: 'relative', padding: '8px 10px' }} aria-label="Notifications">
        <span style={{ fontSize: 16 }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2, background: 'var(--danger)', color: 'white',
            fontSize: 10, fontWeight: 700, borderRadius: 999, minWidth: 16, height: 16, padding: '0 4px',
            display: 'grid', placeItems: 'center',
          }}>{unreadCount}</span>
        )}
      </button>
      {open && (
        <div className="card" style={{
          position: 'absolute', top: '110%', right: 0, width: 360, padding: 0, zIndex: 50,
          boxShadow: 'var(--shadow-md)', maxHeight: 480, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Notifications</div>
            <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={markAllRead}>Mark all read</button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {list.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>You're all caught up.</div>}
            {list.map(n => (
              <div key={n.id} style={{
                padding: '10px 14px', borderBottom: '1px solid var(--border-color)',
                background: n.unread ? 'var(--brand-soft)' : 'transparent',
                display: 'flex', gap: 10,
              }}>
                <div style={{ fontSize: 18 }}>{icons[n.kind] || '•'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={n.link || '#'} onClick={() => { markRead(n.id); setOpen(false) }}
                    style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{n.title}</Link>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{n.body}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{timeAgo(n.at)}</div>
                </div>
                <button className="btn btn-ghost" style={{ padding: 4, fontSize: 12, color: 'var(--text-muted)' }} onClick={() => remove(n.id)} aria-label="Dismiss">×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
