import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedLearners, HOST_COMPANY } from '../../data/mockData.js'
import { useLocalStorage, uid } from '../../lib/useLocalStorage.js'
import { useConfirm } from '@/components/ui/modal-context'

const PROGRAMS = ['Software Development NQF5','Data Analytics NQF5','Cloud Engineering NQF6','Cybersecurity NQF5','UX/UI Design NQF5']
const STATUSES = ['Active','On Leave','Completed','At Risk']

const empty = {
  full_name: '', email: '', phone: '', program: PROGRAMS[0],
  company: HOST_COMPANY, mentor: '', start_date: '', end_date: '',
  status: 'Active', attendance_rate: 100, performance_score: 80, progress: 0,
}

export default function PlacedLearners() {
  const [list, setList] = useLocalStorage('host.learners', seedLearners)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('All')
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const confirm = useConfirm()

  const filtered = useMemo(() => list.filter(l =>
    (status === 'All' || l.status === status) &&
    (l.full_name.toLowerCase().includes(q.toLowerCase()) ||
     l.program.toLowerCase().includes(q.toLowerCase()) ||
     (l.company || '').toLowerCase().includes(q.toLowerCase()))
  ), [list, q, status])

  const openAdd = () => { setEditing(null); setForm({ ...empty, start_date: new Date().toISOString().slice(0, 10) }); setShowForm(true) }
  const openEdit = (l) => { setEditing(l.id); setForm({ ...empty, ...l }); setShowForm(true); setSelected(null) }
  const remove = async (l) => {
    const ok = await confirm({
      title: 'Remove Intern',
      description: `Are you sure you want to remove ${l.full_name} from placed interns?`,
      variant: 'destructive',
      confirmText: 'Remove Intern',
    })
    if (!ok) return
    setList(prev => prev.filter(x => x.id !== l.id))
    setSelected(null)
    toast.success('Intern Removed', { description: `${l.full_name} has been removed.` })
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.full_name.trim()) {
      toast.warning('Name Required', { description: 'Please enter learner full name.' })
      return
    }
    const isComplete = form.status === 'Completed'
    const clean = {
      ...form,
      attendance_rate: Number(form.attendance_rate) || 0,
      performance_score: Number(form.performance_score) || 0,
      progress: isComplete ? 100 : (Number(form.progress) || 0),
      company: form.company || HOST_COMPANY,
    }
    if (editing) {
      setList(prev => prev.map(x => x.id === editing ? { ...x, ...clean } : x))
      toast.success('Intern Updated', { description: `${clean.full_name}'s record was updated.` })
    } else {
      setList(prev => [{ ...clean, id: uid('L') }, ...prev])
      toast.success('Intern Added', { description: `${clean.full_name} has been placed.` })
    }
    setShowForm(false)
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <DashboardLayout title="Placed Interns">
      <div className="card">
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, program, company…"
            style={{ flex: 1, minWidth: 240, padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }} />
          <select value={status} onChange={e => setStatus(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }}>
            {['All', ...STATUSES].map(s => <option key={s}>{s}</option>)}
          </select>
          {/* Add Intern moved to Onboarding — new learners must complete onboarding before placement. */}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 0' }}>Intern</th><th>Program</th><th>Company</th><th>Start</th><th>Status</th><th>Performance</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                  <td style={{ padding: '12px 0' }}>
                    <div style={{ fontWeight: 600 }}>{l.full_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.email}</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{l.program}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{l.company || HOST_COMPANY}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{l.start_date}</td>
                  <td><span className={'badge ' + (l.status === 'Active' ? 'badge-success' : l.status === 'At Risk' ? 'badge-danger' : 'badge-info')}>{l.status}</span></td>
                  <td>{l.performance_score}%</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-ghost" onClick={() => setSelected(l)}>View</button>
                    <button className="btn btn-ghost" onClick={() => openEdit(l)}>Edit</button>
                    <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => remove(l)}>Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="7" style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>No learners match.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <Modal open onClose={() => setSelected(null)} title={selected.full_name} subtitle={`${selected.email} · ${selected.phone || ''}`} width={720}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
            <button className="btn btn-primary" onClick={() => openEdit(selected)}>Edit</button>
          </>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, fontSize: 13 }}>
            <div><div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Program</div>{selected.program}</div>
            <div><div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Company</div>{selected.company || HOST_COMPANY}</div>
            <div><div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Mentor</div>{selected.mentor}</div>
            <div><div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Status</div>{selected.status}</div>
            <div><div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Start</div>{selected.start_date}</div>
            <div><div style={{ color: 'var(--text-muted)', fontSize: 11 }}>End</div>{selected.end_date}</div>
            <div><div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Attendance</div>{selected.attendance_rate}%</div>
            <div><div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Performance</div>{selected.performance_score}%</div>
            <div><div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Phone</div>{selected.phone || '—'}</div>
          </div>
          {selected.bio && <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text-secondary)' }}><div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>Bio</div>{selected.bio}</div>}
          {selected.skills && selected.skills.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selected.skills.map(s => <span key={s} className="badge badge-info">{s}</span>)}
              </div>
            </div>
          )}
          {(() => {
            const effProgress = selected.status === 'Completed' ? 100 : (selected.progress || 0)
            return (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>Program Progress</span><span>{effProgress}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 999 }}>
                  <div style={{ width: effProgress + '%', height: '100%', background: effProgress === 100 ? 'var(--success)' : 'var(--brand)', borderRadius: 999 }} />
                </div>
              </div>
            )
          })()}
        </Modal>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)}
        title={editing ? 'Edit Intern' : 'Add Intern'}
        subtitle={`Host company: ${HOST_COMPANY}`}
        width={720}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          <button className="btn btn-primary" type="submit" form="intern-form">{editing ? 'Save Changes' : 'Create Intern'}</button>
        </>}>
        <form id="intern-form" onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Full Name *</label><input required style={field} value={form.full_name} onChange={set('full_name')} /></div>
          <div><label style={labelStyle}>Email</label><input type="email" style={field} value={form.email} onChange={set('email')} /></div>
          <div><label style={labelStyle}>Phone</label><input style={field} value={form.phone} onChange={set('phone')} /></div>
          <div><label style={labelStyle}>Program</label>
            <select style={field} value={form.program} onChange={set('program')}>{PROGRAMS.map(p => <option key={p}>{p}</option>)}</select>
          </div>
          <div><label style={labelStyle}>Company</label><input style={field} value={form.company} onChange={set('company')} /></div>
          <div><label style={labelStyle}>Mentor</label><input style={field} value={form.mentor} onChange={set('mentor')} /></div>
          <div><label style={labelStyle}>Status</label>
            <select style={field} value={form.status} onChange={set('status')}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
          </div>
          <div><label style={labelStyle}>Start Date</label><input type="date" style={field} value={form.start_date} onChange={set('start_date')} /></div>
          <div><label style={labelStyle}>End Date</label><input type="date" style={field} value={form.end_date} onChange={set('end_date')} /></div>
          <div><label style={labelStyle}>Attendance %</label><input type="number" min="0" max="100" style={field} value={form.attendance_rate} onChange={set('attendance_rate')} /></div>
          <div><label style={labelStyle}>Performance /100</label><input type="number" min="0" max="100" style={field} value={form.performance_score} onChange={set('performance_score')} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Progress %</label><input type="range" min="0" max="100" style={{ width: '100%' }} value={form.progress} onChange={set('progress')} /><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{form.progress}%</div></div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
