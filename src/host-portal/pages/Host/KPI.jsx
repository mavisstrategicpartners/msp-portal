import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedKPIs, seedLearners } from '../../data/mockData.js'
import { useLocalStorage, uid } from '../../lib/useLocalStorage.js'

const empty = { learner_id: '', learner_name: '', goal: '', kpi: '', quarter: 'Q3 2026', progress: 0, status: 'On Track', development_plan: '' }

export default function KPI() {
  const [kpis, setKpis] = useLocalStorage('host.kpis', seedKPIs)
  const [learners] = useLocalStorage('host.learners', seedLearners)
  const [form, setForm] = useState(null)

  const openAdd = () => setForm({ ...empty })
  const openEdit = (k) => setForm({ ...k })
  const remove = (k) => { if (window.confirm('Delete goal?')) setKpis(prev => prev.filter(x => x.id !== k.id)) }
  const submit = () => {
    if (!form.learner_id || !form.goal) return alert('Learner and goal required')
    const l = learners.find(x => x.id === form.learner_id)
    const payload = { ...form, learner_name: l?.full_name || form.learner_name, progress: Number(form.progress) }
    if (form.id) setKpis(prev => prev.map(x => x.id === form.id ? payload : x))
    else setKpis(prev => [{ id: uid('K'), ...payload }, ...prev])
    setForm(null)
  }
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const stats = [
    { label: 'Goals', value: kpis.length, color: 'var(--brand)' },
    { label: 'On track', value: kpis.filter(k => k.status === 'On Track').length, color: 'var(--success)' },
    { label: 'At risk', value: kpis.filter(k => k.status === 'At Risk').length, color: 'var(--danger)' },
    { label: 'Completed', value: kpis.filter(k => k.status === 'Completed').length, color: 'var(--purple)' },
  ]
  const barColor = (s) => s === 'On Track' ? 'var(--brand)' : s === 'At Risk' ? 'var(--danger)' : s === 'Completed' ? 'var(--success)' : 'var(--warning)'

  return (
    <DashboardLayout title="KPI Management">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 18 }}>
        {stats.map(s => (
          <div key={s.label} className="card">
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={openAdd}>+ Assign Goal</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(360px,1fr))', gap: 14 }}>
        {kpis.map(k => (
          <div key={k.id} className="card" style={{ borderTop: `3px solid ${barColor(k.status)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{k.quarter}</div>
                <div style={{ fontWeight: 700 }}>{k.learner_name}</div>
              </div>
              <span className={'badge ' + (k.status === 'On Track' ? 'badge-info' : k.status === 'At Risk' ? 'badge-danger' : k.status === 'Completed' ? 'badge-success' : 'badge-warning')}>{k.status}</span>
            </div>
            <div style={{ fontSize: 13, marginTop: 8 }}><b>Goal:</b> {k.goal}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}><b>KPI:</b> {k.kpi}</div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}><span>Progress</span><span>{k.progress}%</span></div>
              <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 999, marginTop: 4 }}>
                <div style={{ width: `${k.progress}%`, height: '100%', background: barColor(k.status), borderRadius: 999 }} />
              </div>
            </div>
            <details style={{ marginTop: 10, fontSize: 12 }}>
              <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>Development plan</summary>
              <div style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>{k.development_plan}</div>
            </details>
            <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost" onClick={() => openEdit(k)}>Edit</button>
              <button className="btn btn-ghost" style={{ color: 'var(--danger)', marginLeft: 'auto' }} onClick={() => remove(k)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {form && (
        <Modal open onClose={() => setForm(null)} title={form.id ? 'Edit goal' : 'New goal'} width={600}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={submit}>Save</button>
          </>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Learner</label>
              <select style={field} value={form.learner_id} onChange={set('learner_id')}>
                <option value="">— pick —</option>
                {learners.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Quarter</label><input style={field} value={form.quarter} onChange={set('quarter')} /></div>
            <div><label style={labelStyle}>Status</label><select style={field} value={form.status} onChange={set('status')}><option>On Track</option><option>At Risk</option><option>Off Track</option><option>Completed</option></select></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Goal</label><input style={field} value={form.goal} onChange={set('goal')} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>KPI / measure</label><input style={field} value={form.kpi} onChange={set('kpi')} /></div>
            <div><label style={labelStyle}>Progress %</label><input type="number" min={0} max={100} style={field} value={form.progress} onChange={set('progress')} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Development plan</label><textarea rows={3} style={field} value={form.development_plan} onChange={set('development_plan')} /></div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
