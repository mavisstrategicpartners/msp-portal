import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import { seedMessages } from '../../data/mockData.js'
import { useLocalStorage } from '../../lib/useLocalStorage.js'

export default function Messages() {
  const [msgs] = useLocalStorage('host.messages', seedMessages)
  const [selected, setSelected] = useState(msgs[0])
  const [reply, setReply] = useState('')
  const [thread, setThread] = useLocalStorage('host.messages.thread', [
    { from: 'them', text: 'Please confirm intake numbers for July.' },
    { from: 'me', text: 'Will confirm by end of day. Currently 18 of 25 placements active.' },
  ])

  const send = () => {
    if (!reply.trim()) return
    setThread(t => [...t, { from: 'me', text: reply }])
    setReply('')
  }

  return (
    <DashboardLayout title="Messages">
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: 540, padding: 0, overflow: 'hidden' }}>
        <div style={{ borderRight: '1px solid var(--border-color)', overflow: 'auto' }}>
          {msgs.map(m => (
            <div key={m.id} onClick={() => setSelected(m)} style={{
              padding: 14, borderBottom: '1px solid var(--border-color)', cursor: 'pointer',
              background: selected?.id === m.id ? 'var(--brand-soft)' : 'transparent',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{m.from}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.time}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.preview}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 16, borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 600 }}>{selected?.from}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Conversation</div>
          </div>
          <div style={{ flex: 1, padding: 16, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {thread.map((t, i) => (
              <div key={i} style={{
                alignSelf: t.from === 'me' ? 'flex-end' : 'flex-start',
                background: t.from === 'me' ? 'var(--brand)' : 'var(--bg-secondary)',
                color: t.from === 'me' ? 'white' : 'var(--text-primary)',
                padding: '10px 14px', borderRadius: 12, maxWidth: '72%', fontSize: 13,
              }}>{t.text}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--border-color)' }}>
            <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Write a reply…"
              style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }} />
            <button className="btn btn-primary" onClick={send}>Send</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
