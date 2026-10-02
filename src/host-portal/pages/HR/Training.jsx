import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedTraining } from '../../data/mockData.js'
import { useLocalStorage, uid } from '../../lib/useLocalStorage.js'

export default function Training() {
  const [training, setTraining] = useLocalStorage('hr.training', seedTraining)
  const [form, setForm] = useState(null)

  const openAdd = () => setForm({ title: '', type: 'Technical', mode: 'Online', duration: '1h', enrolled: 0, completed: 0, deadline: new Date().toISOString().slice(0, 10) })
  
  const submit = () => {
    if (form.id) {
      setTraining(prev => prev.map(x => x.id === form.id ? form : x))
    } else {
      setTraining(prev => [{ id: uid('TR'), ...form }, ...prev])
    }
    setForm(null)
  }

  return (
    <DashboardLayout title="Training & Development">
      <div className="card" style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Course</button>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 0' }}>Title</th><th>Type</th><th>Mode</th><th>Duration</th><th>Enrolled</th><th>Completed</th><th>Completion Rate</th><th>Deadline</th><th></th>
            </tr>
          </thead>
          <tbody>
            {training.map(t => {
              const rate = t.enrolled ? Math.round((t.completed / t.enrolled) * 100) : 0
              return (
              <tr key={t.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                <td style={{ padding: '12px 0', fontWeight: 600 }}>{t.title}</td>
                <td>{t.type}</td>
                <td>{t.mode}</td>
                <td>{t.duration}</td>
                <td>{t.enrolled}</td>
                <td>{t.completed}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${rate}%`, height: '100%', background: 'var(--success)' }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{rate}%</span>
                  </div>
                </td>
                <td>{t.deadline}</td>
                <td>
                  <button className="btn btn-ghost" onClick={() => setForm(t)}>Edit</button>
                  <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setTraining(prev => prev.filter(x => x.id !== t.id))}>Delete</button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal open onClose={() => setForm(null)} title={form.id ? 'Edit Course' : 'New Course'} width={600} footer={<><button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary" onClick={submit}>Save</button></>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Course Title</label><input style={field} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><label style={labelStyle}>Type</label>
              <select style={field} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option>Technical</option><option>Compliance</option><option>Soft Skills</option><option>Leadership</option>
              </select>
            </div>
            <div><label style={labelStyle}>Mode</label>
              <select style={field} value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}>
                <option>Online</option><option>Classroom</option><option>Hybrid</option>
              </select>
            </div>
            <div><label style={labelStyle}>Duration (e.g., 2h)</label><input style={field} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></div>
            <div><label style={labelStyle}>Deadline</label><input type="date" style={field} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
            <div><label style={labelStyle}>Enrolled</label><input type="number" min="0" style={field} value={form.enrolled} onChange={e => setForm({ ...form, enrolled: Number(e.target.value) })} /></div>
            <div><label style={labelStyle}>Completed</label><input type="number" min="0" style={field} value={form.completed} onChange={e => setForm({ ...form, completed: Number(e.target.value) })} /></div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
