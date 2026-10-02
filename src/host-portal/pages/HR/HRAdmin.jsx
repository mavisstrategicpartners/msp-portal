import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedEmployees, seedAnnouncements, seedLetters, seedAudit } from '../../data/mockData.js'
import { uid } from '../../lib/useLocalStorage.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'

export default function HRAdmin() {
  const [tab, setTab] = useState('employees')
  const [employees, setEmployees] = useSupabaseTable('hr_employees', seedEmployees)
  const [announcements, setAnnouncements] = useSupabaseTable('hr_announcements', seedAnnouncements)
  const [letters, setLetters] = useSupabaseTable('hr_letters', seedLetters)
  const [audit] = useSupabaseTable('hr_audit', seedAudit)
  const [form, setForm] = useState(null)
  const [annForm, setAnnForm] = useState(null)

  const submitEmployee = () => {
    if (!form.full_name) return alert('Name required')
    if (form.id.startsWith('NEW')) setEmployees(prev => [{ ...form, id: uid('E') }, ...prev])
    else setEmployees(prev => prev.map(x => x.id === form.id ? form : x))
    setForm(null)
  }
  const generateLetter = () => {
    const emp = window.prompt('Employee full name?'); const type = window.prompt('Letter type? (e.g. Employment Verification)')
    if (!emp || !type) return
    setLetters(prev => [{ id: uid('HL'), employee: emp, type, generated: new Date().toISOString().slice(0, 10) }, ...prev])
  }

  return (
    <DashboardLayout title="HR Administration">
      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[['employees','Employees'],['announcements','Announcements'],['letters','HR Letters'],['audit','Audit Log'],['popia','POPIA & Compliance']].map(([k, l]) => (
          <button key={k} className={'btn ' + (tab === k ? 'btn-primary' : 'btn-ghost')} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'employees' && (
        <>
          <div className="card" style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => setForm({ id: 'NEW', full_name: '', role: '', department: '', email: '', phone: '', employment_type: 'Permanent', join_date: '', manager: '', gender: 'Female', age_band: '30-39' })}>+ Add Employee</button>
          </div>
          <div className="card">
            <table>
              <thead><tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 0' }}>Name</th><th>Role</th><th>Department</th><th>Type</th><th>Manager</th><th>Joined</th><th></th></tr></thead>
              <tbody>
                {employees.map(e => (
                  <tr key={e.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                    <td style={{ padding: '10px 0', fontWeight: 600 }}>{e.full_name}</td>
                    <td>{e.role}</td><td>{e.department}</td>
                    <td><span className="badge badge-info">{e.employment_type}</span></td>
                    <td>{e.manager}</td><td>{e.join_date}</td>
                    <td>
                      <button className="btn btn-ghost" onClick={() => setForm(e)}>Edit</button>
                      <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setEmployees(prev => prev.filter(x => x.id !== e.id))}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'announcements' && (
        <>
          <div className="card" style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => setAnnForm({ title: '', body: '', author: 'HR Department' })}>+ Post Announcement</button>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {announcements.map(a => (
              <div key={a.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.posted} · {a.author}</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{a.body}</div>
                <div style={{ marginTop: 8, textAlign: 'right' }}>
                  <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setAnnouncements(prev => prev.filter(x => x.id !== a.id))}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'letters' && (
        <>
          <div className="card" style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={generateLetter}>+ Generate HR Letter</button>
          </div>
          <div className="card">
            <table>
              <thead><tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 0' }}>Employee</th><th>Type</th><th>Generated</th></tr></thead>
              <tbody>
                {letters.map(l => (
                  <tr key={l.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                    <td style={{ padding: '10px 0', fontWeight: 500 }}>{l.employee}</td>
                    <td>{l.type}</td><td>{l.generated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'audit' && (
        <div className="card">
          <table>
            <thead><tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 0' }}>When</th><th>Actor</th><th>Action</th><th>Target</th></tr></thead>
            <tbody>
              {audit.map(a => (
                <tr key={a.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                  <td style={{ padding: '10px 0', fontFamily: 'monospace', fontSize: 12 }}>{a.at}</td>
                  <td>{a.actor}</td><td>{a.action}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{a.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'popia' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            ['POPIA compliance status','96%','var(--success)'],
            ['Employees who acknowledged latest privacy policy','54 / 56','var(--brand)'],
            ['Data retention audits (last 12 months)','3 completed','var(--purple)'],
            ['Data subject access requests','1 open','var(--warning)'],
          ].map(([k, v, c]) => (
            <div key={k} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13 }}>{k}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {form && (
        <Modal open onClose={() => setForm(null)} title={form.id.startsWith('NEW') ? 'Add employee' : 'Edit employee'} width={600}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitEmployee}>Save</button>
          </>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['Full name','full_name'],['Role','role'],['Department','department'],['Email','email'],['Phone','phone'],['Manager','manager']].map(([label, k]) => (
              <div key={k}><label style={labelStyle}>{label}</label><input style={field} value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} /></div>
            ))}
            <div><label style={labelStyle}>Employment type</label><select style={field} value={form.employment_type} onChange={e => setForm({ ...form, employment_type: e.target.value })}><option>Permanent</option><option>Contract</option><option>Temporary</option></select></div>
            <div><label style={labelStyle}>Join date</label><input type="date" style={field} value={form.join_date || ''} onChange={e => setForm({ ...form, join_date: e.target.value })} /></div>
            <div><label style={labelStyle}>Gender</label><select style={field} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}><option>Female</option><option>Male</option><option>Other</option></select></div>
            <div><label style={labelStyle}>Age band</label><select style={field} value={form.age_band} onChange={e => setForm({ ...form, age_band: e.target.value })}><option>20-29</option><option>30-39</option><option>40-49</option><option>50+</option></select></div>
          </div>
        </Modal>
      )}

      {annForm && (
        <Modal open onClose={() => setAnnForm(null)} title="Post announcement" width={520}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setAnnForm(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { setAnnouncements(prev => [{ id: uid('AN'), posted: new Date().toISOString().slice(0, 10), ...annForm }, ...prev]); setAnnForm(null) }}>Post</button>
          </>}>
          <div style={{ display: 'grid', gap: 10 }}>
            <input placeholder="Title" style={field} value={annForm.title} onChange={e => setAnnForm({ ...annForm, title: e.target.value })} />
            <textarea rows={4} placeholder="Body" style={field} value={annForm.body} onChange={e => setAnnForm({ ...annForm, body: e.target.value })} />
            <input placeholder="Author" style={field} value={annForm.author} onChange={e => setAnnForm({ ...annForm, author: e.target.value })} />
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
