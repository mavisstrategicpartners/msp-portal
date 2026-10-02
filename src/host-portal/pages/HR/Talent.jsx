import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedTalent, seedEmployees } from '../../data/mockData.js'
import { uid } from '../../lib/useLocalStorage.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'

export default function Talent() {
  const [talent, setTalent] = useSupabaseTable('hr_talent', seedTalent)
  const [form, setForm] = useState(null)

  const openAdd = () => setForm({ employee: seedEmployees[0]?.full_name || '', role: seedEmployees[0]?.role || '', potential: 'Medium', readiness: '1-2 years', successor_for: '', idp_progress: 0 })
  
  const submit = () => {
    if (form.id) {
      setTalent(prev => prev.map(x => x.id === form.id ? form : x))
    } else {
      setTalent(prev => [{ id: uid('T'), ...form }, ...prev])
    }
    setForm(null)
  }

  return (
    <DashboardLayout title="Talent Management">
      <div className="card" style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Talent Record</button>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 0' }}>Employee</th><th>Current Role</th><th>Potential</th><th>Readiness</th><th>Successor For</th><th>IDP Progress</th><th></th>
            </tr>
          </thead>
          <tbody>
            {talent.map(t => (
              <tr key={t.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                <td style={{ padding: '12px 0', fontWeight: 600 }}>{t.employee}</td>
                <td>{t.role}</td>
                <td><span className={`badge badge-${t.potential === 'High' ? 'success' : 'info'}`}>{t.potential}</span></td>
                <td>{t.readiness}</td>
                <td>{t.successor_for || '—'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${t.idp_progress}%`, height: '100%', background: 'var(--purple)' }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.idp_progress}%</span>
                  </div>
                </td>
                <td>
                  <button className="btn btn-ghost" onClick={() => setForm(t)}>Edit</button>
                  <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setTalent(prev => prev.filter(x => x.id !== t.id))}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal open onClose={() => setForm(null)} title={form.id ? 'Edit Talent Record' : 'New Talent Record'} width={600} footer={<><button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary" onClick={submit}>Save</button></>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Employee</label>
              <select style={field} value={form.employee} onChange={e => {
                const emp = seedEmployees.find(x => x.full_name === e.target.value)
                setForm({ ...form, employee: e.target.value, role: emp?.role || '' })
              }}>
                {seedEmployees.map(e => <option key={e.id} value={e.full_name}>{e.full_name}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Current Role</label><input style={field} value={form.role} readOnly /></div>
            <div><label style={labelStyle}>Potential</label>
              <select style={field} value={form.potential} onChange={e => setForm({ ...form, potential: e.target.value })}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
            <div><label style={labelStyle}>Readiness</label>
              <select style={field} value={form.readiness} onChange={e => setForm({ ...form, readiness: e.target.value })}>
                <option>Ready now</option><option>1-2 years</option><option>2-3 years</option><option>Not ready</option>
              </select>
            </div>
            <div><label style={labelStyle}>Successor For (Role)</label><input style={field} value={form.successor_for} onChange={e => setForm({ ...form, successor_for: e.target.value })} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>IDP Progress (%)</label><input type="number" min="0" max="100" style={field} value={form.idp_progress} onChange={e => setForm({ ...form, idp_progress: Number(e.target.value) })} /></div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
