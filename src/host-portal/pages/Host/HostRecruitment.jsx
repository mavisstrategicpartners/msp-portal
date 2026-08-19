import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal from '../../components/Modal.jsx'
import { seedAvailableLearners } from '../../data/mockData.js'
import { useLocalStorage, uid } from '../../lib/useLocalStorage.js'
import { useNotifications } from '../../context/NotificationContext.jsx'

export default function HostRecruitment() {
  const [available] = useLocalStorage('host.hr.available_learners', seedAvailableLearners)
  const [shortlist, setShortlist] = useLocalStorage('host.hr.shortlist', [])
  const [interviews, setInterviews] = useLocalStorage('host.hr.interviews', [
    { id: 'INT-1', learner_id: 'AL-2', learner: 'Ayanda Pillay', date: '2026-07-05', time: '10:00', mode: 'MS Teams', status: 'Scheduled' },
  ])
  const [decisions, setDecisions] = useLocalStorage('host.hr.decisions', {})
  const [scheduling, setScheduling] = useState(null)
  const [form, setForm] = useState({ date: '', time: '10:00', mode: 'MS Teams' })
  const { push } = useNotifications()

  const recommended = available.filter(a => a.match_score >= 80)
  const shortlisted = available.filter(l => shortlist.includes(l.id))
  const decide = (id, decision, name) => { setDecisions(d => ({ ...d, [id]: decision })); push({ title: `Learner ${decision.toLowerCase()}`, body: `${name} was ${decision.toLowerCase()}.`, link: '/host/recruitment', kind: 'recruit' }) }

  const submitInterview = () => {
    setInterviews(prev => [{ id: uid('INT'), learner_id: scheduling.id, learner: scheduling.full_name, ...form, status: 'Scheduled' }, ...prev])
    push({ title: 'Interview scheduled', body: `${scheduling.full_name} — ${form.date} @ ${form.time} (${form.mode})`, link: '/host/recruitment', kind: 'recruit' })
    setScheduling(null)
  }

  return (
    <DashboardLayout title="Recruitment">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 18 }}>
        {[
          { label: 'Recommended (AI)', value: recommended.length, color: 'var(--brand)' },
          { label: 'Shortlisted', value: shortlisted.length, color: 'var(--warning)' },
          { label: 'Interviews', value: interviews.length, color: 'var(--purple)' },
          { label: 'Accepted', value: Object.values(decisions).filter(d => d === 'Accepted').length, color: 'var(--success)' },
        ].map(s => (
          <div key={s.label} className="card">
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🤖 Recommended learners</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14 }}>
          {recommended.map(l => (
            <div key={l.id} className="card" style={{ padding: 14, background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{l.full_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.program}</div>
                </div>
                <span className="badge badge-success">{l.match_score}%</span>
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <button className="btn btn-ghost" onClick={() => setShortlist(prev => prev.includes(l.id) ? prev.filter(x => x !== l.id) : [...prev, l.id])}>
                  {shortlist.includes(l.id) ? '★ Shortlisted' : '☆ Shortlist'}
                </button>
                <button className="btn btn-ghost" onClick={() => { setScheduling(l); setForm({ date: '', time: '10:00', mode: 'MS Teams' }) }}>📅 Interview</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>Shortlisted candidates</h3>
        {shortlisted.length === 0 ? <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Shortlist recommended learners to see them here.</div> :
          <table>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 0' }}>Learner</th><th>Program</th><th>Match</th><th>Decision</th><th></th>
              </tr>
            </thead>
            <tbody>
              {shortlisted.map(l => (
                <tr key={l.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                  <td style={{ padding: '10px 0', fontWeight: 600 }}>{l.full_name}</td>
                  <td>{l.program}</td>
                  <td>{l.match_score}%</td>
                  <td>{decisions[l.id]
                    ? <span className={'badge ' + (decisions[l.id] === 'Accepted' ? 'badge-success' : 'badge-danger')}>{decisions[l.id]}</span>
                    : <span className="badge badge-warning">Pending</span>}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-success" onClick={() => decide(l.id, 'Accepted', l.full_name)}>✓ Accept</button>
                    <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => decide(l.id, 'Rejected', l.full_name)}>✕ Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      <div className="card">
        <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>Scheduled interviews</h3>
        {interviews.length === 0 ? <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No interviews scheduled yet.</div> :
          <table>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 0' }}>Learner</th><th>Date</th><th>Time</th><th>Mode</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {interviews.map(i => (
                <tr key={i.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                  <td style={{ padding: '10px 0', fontWeight: 500 }}>{i.learner}</td>
                  <td>{i.date}</td><td>{i.time}</td><td>{i.mode}</td>
                  <td><span className="badge badge-info">{i.status}</span></td>
                  <td><button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setInterviews(prev => prev.filter(x => x.id !== i.id))}>Cancel</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      {scheduling && (
        <Modal open onClose={() => setScheduling(null)} title={`Schedule interview — ${scheduling.full_name}`} width={480}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setScheduling(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitInterview} disabled={!form.date}>Schedule</button>
          </>}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Date</div><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--input-text)' }} /></div>
            <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Time</div><input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--input-text)' }} /></div>
            <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mode</div><select value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--input-text)' }}><option>MS Teams</option><option>Google Meet</option><option>In person</option><option>Phone</option></select></div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
