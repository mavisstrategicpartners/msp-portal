import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedEmployees } from '../../data/mockData.js'
import { uid } from '../../lib/useLocalStorage.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'
import { BarChart } from '../../components/Chart.jsx'

const seedReviews = [
  { id: 'PR-1', employee: 'Thandi Mokoena', period: 'Q2 2026', overall: 4.6, goals_met: 5, goals_total: 5, feedback: '360° feedback: leadership and empathy praised.', pip: false, promotion: true },
  { id: 'PR-2', employee: 'Sipho Dlamini', period: 'Q2 2026', overall: 4.1, goals_met: 4, goals_total: 5, feedback: 'Strong technical delivery. Communication needs coaching.', pip: false, promotion: false },
  { id: 'PR-3', employee: 'Karabo Mthembu', period: 'Q2 2026', overall: 2.6, goals_met: 1, goals_total: 4, feedback: 'Attendance issues affecting delivery. PIP initiated.', pip: true, promotion: false },
]

export default function HRPerformance() {
  const [reviews, setReviews] = useSupabaseTable('hr_reviews', seedReviews)
  const [form, setForm] = useState(null)
  const openAdd = () => setForm({ employee: seedEmployees[0]?.full_name || '', period: 'Q3 2026', overall: 3.5, goals_met: 0, goals_total: 5, feedback: '', pip: false, promotion: false })
  const submit = () => {
    if (form.id) setReviews(prev => prev.map(x => x.id === form.id ? form : x))
    else setReviews(prev => [{ id: uid('PR'), ...form }, ...prev])
    setForm(null)
  }
  const chart = reviews.map(r => ({ label: r.employee, value: Math.round(r.overall * 20) }))
  return (
    <DashboardLayout title="Performance Management">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>OVERALL SCORES (%) — CURRENT PERIOD</div>
          <BarChart data={chart} height={200} color="#7c3aed" />
        </div>
        <div className="card">
          <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>Highlights</h3>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)' }}>
            <li>{reviews.filter(r => r.overall >= 4).length} high performers this cycle</li>
            <li>{reviews.filter(r => r.pip).length} employee(s) on a PIP</li>
            <li>{reviews.filter(r => r.promotion).length} promotion recommendation(s) pending</li>
            <li>360° feedback active for all senior roles</li>
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={openAdd}>+ Add review</button>
      </div>

      <div className="card">
        <table>
          <thead><tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            <th style={{ padding: '10px 0' }}>Employee</th><th>Period</th><th>Overall</th><th>Goals</th><th>PIP</th><th>Promotion</th><th>Feedback</th><th></th></tr></thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                <td style={{ padding: '12px 0', fontWeight: 600 }}>{r.employee}</td>
                <td>{r.period}</td>
                <td><b>{r.overall.toFixed(1)}</b> / 5</td>
                <td>{r.goals_met}/{r.goals_total}</td>
                <td>{r.pip ? <span className="badge badge-danger">Yes</span> : '—'}</td>
                <td>{r.promotion ? <span className="badge badge-success">Recommended</span> : '—'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{r.feedback}</td>
                <td>
                  <button className="btn btn-ghost" onClick={() => setForm(r)}>Edit</button>
                  <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setReviews(prev => prev.filter(x => x.id !== r.id))}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal open onClose={() => setForm(null)} title={form.id ? 'Edit review' : 'New review'} width={600}
          footer={<><button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary" onClick={submit}>Save</button></>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Employee / Learner (search by name or email)</label>
              <input style={field} placeholder="Type a name or email…" value={form.employee}
                onChange={e => setForm({ ...form, employee: e.target.value })} list="hr-employee-suggest" />
              <datalist id="hr-employee-suggest">
                {seedEmployees.filter(x => {
                  const q = (form.employee || '').toLowerCase().trim()
                  if (!q) return true
                  return x.full_name.toLowerCase().includes(q) || (x.email || '').toLowerCase().includes(q)
                }).map(x => <option key={x.id} value={x.full_name}>{x.email}</option>)}
              </datalist>
            </div>
            <div><label style={labelStyle}>Period</label><input style={field} value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} /></div>
            <div><label style={labelStyle}>Overall (0-5)</label><input type="number" step="0.1" min="0" max="5" style={field} value={form.overall} onChange={e => setForm({ ...form, overall: Number(e.target.value) })} /></div>
            <div><label style={labelStyle}>Goals met</label><input type="number" style={field} value={form.goals_met} onChange={e => setForm({ ...form, goals_met: Number(e.target.value) })} /></div>
            <div><label style={labelStyle}>Goals total</label><input type="number" style={field} value={form.goals_total} onChange={e => setForm({ ...form, goals_total: Number(e.target.value) })} /></div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}><input type="checkbox" checked={form.pip} onChange={e => setForm({ ...form, pip: e.target.checked })} /> On PIP</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}><input type="checkbox" checked={form.promotion} onChange={e => setForm({ ...form, promotion: e.target.checked })} /> Promotion recommended</label>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Feedback</label><textarea rows={3} style={field} value={form.feedback} onChange={e => setForm({ ...form, feedback: e.target.value })} /></div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
