import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal from '../../components/Modal.jsx'
import { seedLearners, seedIncidents, seedCoaching } from '../../data/mockData.js'
import { useLocalStorage, uid } from '../../lib/useLocalStorage.js'
import { Link } from 'react-router-dom'

export default function Workforce() {
  const [learners] = useLocalStorage('host.learners', seedLearners)
  const [incidents, setIncidents] = useLocalStorage('host.incidents', seedIncidents)
  const [coaching] = useLocalStorage('host.coaching', seedCoaching)
  const [tab, setTab] = useState('assigned')
  const [addingIncident, setAddingIncident] = useState(null)
  const [form, setForm] = useState({ learner: '', category: 'Health & Safety', severity: 'Low', description: '' })

  const submitIncident = () => {
    setIncidents(prev => [{ id: uid('IN'), date: new Date().toISOString().slice(0, 10), status: 'Open', ...form }, ...prev])
    setAddingIncident(null); setForm({ learner: '', category: 'Health & Safety', severity: 'Low', description: '' })
  }

  return (
    <DashboardLayout title="Workforce Management">
      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[['assigned','Assigned Interns'],['attendance','Attendance Monitor'],['performance','Performance'],['incidents','Incidents'],['coaching','Coaching Notes']].map(([k, l]) => (
          <button key={k} className={'btn ' + (tab === k ? 'btn-primary' : 'btn-ghost')} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'assigned' && (
        <div className="card">
          <table>
            <thead><tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 0' }}>Intern</th><th>Program</th><th>Mentor</th><th>Status</th></tr></thead>
            <tbody>
              {learners.map(l => (
                <tr key={l.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                  <td style={{ padding: '10px 0', fontWeight: 600 }}>{l.full_name}</td>
                  <td>{l.program}</td><td>{l.mentor}</td>
                  <td><span className={'badge ' + (l.status === 'Active' ? 'badge-success' : l.status === 'At Risk' ? 'badge-danger' : 'badge-info')}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="card">
          <div style={{ fontSize: 13, marginBottom: 10, color: 'var(--text-secondary)' }}>Attendance is now managed centrally in the HR portal.</div>
          <Link className="btn btn-primary" to="/hr/attendance">Open Attendance Register →</Link>
        </div>
      )}

      {tab === 'performance' && (
        <div className="card">
          <table>
            <thead><tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 0' }}>Intern</th><th>Attendance</th><th>Score</th><th>Progress</th></tr></thead>
            <tbody>
              {learners.map(l => (
                <tr key={l.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                  <td style={{ padding: '10px 0', fontWeight: 600 }}>{l.full_name}</td>
                  <td>{l.attendance_rate}%</td>
                  <td>{l.performance_score}/100</td>
                  <td style={{ width: 260 }}>
                    <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 999 }}>
                      <div style={{ width: `${l.progress}%`, height: '100%', background: 'var(--brand)', borderRadius: 999 }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'incidents' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-primary" onClick={() => setAddingIncident(true)}>+ Log Incident</button>
          </div>
          <table>
            <thead><tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 0' }}>Date</th><th>Intern</th><th>Category</th><th>Severity</th><th>Status</th><th>Details</th></tr></thead>
            <tbody>
              {incidents.map(i => (
                <tr key={i.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                  <td style={{ padding: '10px 0' }}>{i.date}</td>
                  <td style={{ fontWeight: 500 }}>{i.learner}</td>
                  <td>{i.category}</td>
                  <td><span className={'badge ' + (i.severity === 'High' ? 'badge-danger' : i.severity === 'Medium' ? 'badge-warning' : 'badge-info')}>{i.severity}</span></td>
                  <td><span className={'badge ' + (i.status === 'Resolved' ? 'badge-success' : 'badge-warning')}>{i.status}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{i.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'coaching' && (
        <div className="card">
          <div style={{ marginBottom: 12 }}><Link className="btn btn-primary" to="/host/coaching">Open full coaching notes →</Link></div>
          {coaching.map(c => (
            <div key={c.id} style={{ padding: '12px 0', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{c.learner_name} <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>· {c.date} · by {c.mentor}</span></div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{c.note}</div>
            </div>
          ))}
        </div>
      )}

      {addingIncident && (
        <Modal open onClose={() => setAddingIncident(null)} title="Log incident" width={520}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setAddingIncident(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitIncident} disabled={!form.learner || !form.description}>Save</button>
          </>}>
          <div style={{ display: 'grid', gap: 12 }}>
            <select value={form.learner} onChange={e => setForm({ ...form, learner: e.target.value })} style={{ padding: 10, border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }}>
              <option value="">— pick learner —</option>
              {learners.map(l => <option key={l.id}>{l.full_name}</option>)}
            </select>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ padding: 10, border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }}>
              <option>Health & Safety</option><option>Punctuality</option><option>Conduct</option><option>Equipment</option><option>Other</option>
            </select>
            <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} style={{ padding: 10, border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
            <textarea rows={3} placeholder="Description…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ padding: 10, border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }} />
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
