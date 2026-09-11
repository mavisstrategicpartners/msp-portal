import { useMemo, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal from '../../components/Modal.jsx'
import { seedAvailableLearners, HOST_COMPANY } from '../../data/mockData.js'
import { useLocalStorage } from '../../lib/useLocalStorage.js'
import { useNotifications } from '../../context/NotificationContext.jsx'

const CRITERIA = [
  { key: 'skills', label: 'Skills Matching', icon: '🧠' },
  { key: 'qualification', label: 'Qualification Matching', icon: '◆' },
  { key: 'geo', label: 'Geographic Matching', icon: '📍' },
  { key: 'disability', label: 'Disability Inclusion', icon: '♿' },
  { key: 'industry', label: 'Industry Matching', icon: '🏭' },
]

export default function Marketplace() {
  const [available] = useLocalStorage('host.hr.available_learners', seedAvailableLearners)
  const [shortlist, setShortlist] = useLocalStorage('host.hr.shortlist', [])
  const [enabled, setEnabled] = useLocalStorage('host.marketplace.criteria', { skills: true, qualification: true, geo: true, disability: true, industry: true })
  const [q, setQ] = useState('')
  const [viewing, setViewing] = useState(null)
  const { push } = useNotifications()

  const scored = useMemo(() => {
    return available.map(l => {
      let base = l.match_score
      // Adjust score based on enabled criteria — mock model
      const off = Object.entries(enabled).filter(([, v]) => !v).length
      const adj = Math.max(50, base - off * 6)
      return { ...l, adjusted: adj }
    }).filter(l => l.full_name.toLowerCase().includes(q.toLowerCase()) || l.program.toLowerCase().includes(q.toLowerCase()) || l.skills.some(s => s.toLowerCase().includes(q.toLowerCase())))
      .sort((a, b) => b.adjusted - a.adjusted)
  }, [available, enabled, q])

  const toggleShortlist = (id, name) => {
    setShortlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    if (!shortlist.includes(id)) push({ title: 'Learner shortlisted', body: `${name} was added to your shortlist.`, link: '/host/marketplace', kind: 'recruit' })
  }
  const requestPlacement = (l) => {
    push({ title: 'Placement request sent', body: `${l.full_name}'s provider has been notified of your interest.`, link: '/host/marketplace', kind: 'recruit' })
    alert(`Placement request sent for ${l.full_name}. (Local demo — no email actually sent.)`)
  }

  const scoreColor = (s) => s >= 90 ? 'var(--success)' : s >= 75 ? 'var(--warning)' : 'var(--text-muted)'

  return (
    <DashboardLayout title="Learner Marketplace">
      <div className="card" style={{ marginBottom: 16, background: 'var(--bg-primary)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 34 }}>🤖</div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Advanced AI Matching Engine</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Toggle criteria to re-score every available learner against your host profile.</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {CRITERIA.map(c => (
            <button key={c.key} onClick={() => setEnabled(en => ({ ...en, [c.key]: !en[c.key] }))}
              style={{
                padding: '8px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: enabled[c.key] ? 'var(--brand)' : 'var(--bg-primary)',
                color: enabled[c.key] ? 'white' : 'var(--text-secondary)',
                border: '1px solid ' + (enabled[c.key] ? 'var(--brand)' : 'var(--border-color)'),
                cursor: 'pointer',
              }}>
              {c.icon} {c.label} {enabled[c.key] ? '✓' : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, program, or skill…"
          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 14 }}>
        {scored.map(l => (
          <div key={l.id} className="card" style={{ borderTop: `3px solid ${scoreColor(l.adjusted)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{l.full_name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.program}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor(l.adjusted) }}>{l.adjusted}%</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>match</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>{l.bio}</div>
            <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="chip">📍 {l.location}</span>
              <span className="chip">Availability: {l.availability}</span>
              {l.disability && <span className="chip" style={{ color: 'var(--purple)', borderColor: 'var(--purple)' }}>♿ {l.disability}</span>}
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {l.skills.map(s => <span key={s} className="badge badge-info">{s}</span>)}
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
              <button className="btn btn-primary" onClick={() => setViewing(l)}>View match</button>
              <button className="btn btn-ghost" onClick={() => toggleShortlist(l.id, l.full_name)}>{shortlist.includes(l.id) ? '★ Shortlisted' : '☆ Shortlist'}</button>
              <button className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => requestPlacement(l)}>Request →</button>
            </div>
          </div>
        ))}
      </div>

      {viewing && (
        <Modal open onClose={() => setViewing(null)} title={viewing.full_name} subtitle={`Match score: ${viewing.adjusted}% · ${viewing.program}`} width={640}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setViewing(null)}>Close</button>
            <button className="btn btn-primary" onClick={() => { requestPlacement(viewing); setViewing(null) }}>Request placement</button>
          </>}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>{viewing.bio}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, marginBottom: 14 }}>
            <div><b>Provider:</b> {viewing.provider}</div>
            <div><b>Location:</b> {viewing.location}</div>
            <div><b>Availability:</b> {viewing.availability}</div>
            <div><b>Experience:</b> {viewing.years_experience} yr(s)</div>
            <div><b>Industry:</b> {viewing.industry}</div>
            <div><b>Disability:</b> {viewing.disability || '—'}</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Why the AI matched this learner to {HOST_COMPANY}:</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--text-secondary)' }}>
            {viewing.match_reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </Modal>
      )}
    </DashboardLayout>
  )
}
