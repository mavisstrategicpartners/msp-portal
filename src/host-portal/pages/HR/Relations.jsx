import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedRelations, seedEmployees } from '../../data/mockData.js'
import { useLocalStorage, uid } from '../../lib/useLocalStorage.js'

export default function Relations() {
  const [relations, setRelations] = useLocalStorage('hr.relations', seedRelations)
  const [form, setForm] = useState(null)

  const openAdd = () => setForm({ employee: seedEmployees[0]?.full_name || '', type: 'Grievance', severity: 'Low', date: new Date().toISOString().slice(0, 10), status: 'Open', description: '' })
  
  const submit = () => {
    if (form.id) {
      setRelations(prev => prev.map(x => x.id === form.id ? form : x))
    } else {
      setRelations(prev => [{ id: uid('ER'), ...form }, ...prev])
    }
    setForm(null)
  }

  return (
    <DashboardLayout title="Employee Relations">
      <div className="card" style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Case</button>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 0' }}>Employee</th><th>Type</th><th>Severity</th><th>Date</th><th>Status</th><th>Description</th><th></th>
            </tr>
          </thead>
          <tbody>
            {relations.map(r => (
              <tr key={r.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                <td style={{ padding: '12px 0', fontWeight: 600 }}>{r.employee}</td>
                <td>{r.type}</td>
                <td><span className={`badge badge-${r.severity === 'High' ? 'danger' : r.severity === 'Medium' ? 'warning' : 'info'}`}>{r.severity}</span></td>
                <td>{r.date}</td>
                <td><span className={`badge badge-${r.status === 'Closed' ? 'success' : 'warning'}`}>{r.status}</span></td>
                <td style={{ color: 'var(--text-secondary)' }}>{r.description}</td>
                <td>
                  <button className="btn btn-ghost" onClick={() => setForm(r)}>Edit</button>
                  <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setRelations(prev => prev.filter(x => x.id !== r.id))}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal open onClose={() => setForm(null)} title={form.id ? 'Edit Case' : 'New Case'} width={600} footer={<><button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary" onClick={submit}>Save</button></>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Employee</label>
              <select style={field} value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })}>
                {seedEmployees.map(e => <option key={e.id} value={e.full_name}>{e.full_name}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Type</label>
              <select style={field} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option>Grievance</option><option>Warning</option><option>Wellness</option>
              </select>
            </div>
            <div><label style={labelStyle}>Severity</label>
              <select style={field} value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
            <div><label style={labelStyle}>Date</label><input type="date" style={field} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div><label style={labelStyle}>Status</label>
              <select style={field} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option>Open</option><option>Closed</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Description</label><textarea rows={3} style={field} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
