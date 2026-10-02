import { useState, Fragment } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedTimesheets, seedProjects, ATTENDANCE_STATUSES } from '../../data/mockData.js'
import { uid } from '../../lib/useLocalStorage.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'
import { useConfirm } from '@/components/ui/modal-context'

const totalHours = (r) => (r.projects || []).reduce((s, p) => s + Number(p.hours || 0), 0)
const emptyEntry = () => ({
  employee: '', date: new Date().toISOString().slice(0, 10),
  clock_in: '08:00', clock_out: '17:00',
  projects: [{ name: '', hours: 0, manager_comment: '' }], status: 'Present', notes: '',
})

const statusBadge = (s) => s === 'Present' ? 'badge-success' : s === 'Clocked In' ? 'badge-info' : s === 'Clocked Out' ? 'badge-purple' : s === 'On Leave' ? 'badge-warning' : 'badge-danger'

export default function Timesheets() {
  const [list, setList] = useSupabaseTable('hr_timesheets', seedTimesheets)
  const [projects] = useLocalStorage('host.projects', seedProjects)
  const [expanded, setExpanded] = useState({})
  const [form, setForm] = useState(null)
  const confirm = useConfirm()

  const openAdd = () => setForm(emptyEntry())
  const openEdit = (r) => setForm({ ...r, projects: (r.projects || []).map(p => ({ manager_comment: '', ...p })) })
  const remove = async (r) => {
    const ok = await confirm({
      title: 'Delete Timesheet',
      description: `Are you sure you want to delete the timesheet for "${r.employee}" on ${r.date}?`,
      variant: 'destructive',
      confirmText: 'Delete Timesheet',
    })
    if (!ok) return
    setList(prev => prev.filter(x => x.id !== r.id))
    toast.success('Timesheet Deleted', { description: `Timesheet for ${r.employee} was removed.` })
  }
  const submit = (e) => {
    e.preventDefault()
    if (!form.employee.trim()) {
      toast.warning('Employee Required', { description: 'Please enter employee name.' })
      return
    }
    const clean = { ...form, projects: form.projects.filter(p => p.name.trim()).map(p => ({ name: p.name, hours: Number(p.hours) || 0, manager_comment: p.manager_comment || '' })) }
    if (form.id) {
      setList(prev => prev.map(x => x.id === form.id ? clean : x))
      toast.success('Timesheet Updated', { description: `Timesheet for ${clean.employee} was updated.` })
    } else {
      setList(prev => [{ ...clean, id: uid('TS') }, ...prev])
      toast.success('Timesheet Created', { description: `Timesheet logged for ${clean.employee}.` })
    }
    setForm(null)
  }
  const setStatus = (r, status) => setList(prev => prev.map(x => x.id === r.id ? { ...x, status } : x))

  const updProj = (i, k, v) => setForm(f => { const ps = [...f.projects]; ps[i] = { ...ps[i], [k]: v }; return { ...f, projects: ps } })
  const addProj = () => setForm(f => ({ ...f, projects: [...f.projects, { name: '', hours: 0, manager_comment: '' }] }))
  const removeProj = (i) => setForm(f => ({ ...f, projects: f.projects.filter((_, j) => j !== i) }))

  const summary = [
    { label: 'Total hours logged', value: list.reduce((s, r) => s + totalHours(r), 0).toFixed(1) },
    ...ATTENDANCE_STATUSES.map(s => ({ label: s, value: list.filter(r => r.status === s).length })),
  ]

  return (
    <DashboardLayout title="Timesheet Management">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 18 }}>
        {summary.map(s => (
          <div key={s.label} className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Timesheet</button>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 0' }}>Employee</th><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Total</th><th>Projects</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {list.map(r => {
                const isOpen = !!expanded[r.id]
                const ps = r.projects || []
                return (
                  <Fragment key={r.id}>
                    <tr style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                      <td style={{ padding: '12px 0', fontWeight: 500 }}>{r.employee}</td>
                      <td>{r.date}</td>
                      <td>{r.clock_in || '—'}</td>
                      <td>{r.clock_out || '—'}</td>
                      <td><b>{totalHours(r).toFixed(2)}h</b></td>
                      <td>
                        <button className="btn btn-ghost" onClick={() => setExpanded(e => ({ ...e, [r.id]: !e[r.id] }))} style={{ padding: '4px 8px' }}>
                          {ps.length} project{ps.length === 1 ? '' : 's'} {isOpen ? '▲' : '▼'}
                        </button>
                      </td>
                      <td>
                        <select value={r.status} onChange={e => setStatus(r, e.target.value)}
                          style={{ padding: '4px 6px', borderRadius: 6, fontSize: 11, border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--input-text)' }}>
                          {ATTENDANCE_STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <div style={{ marginTop: 2 }}><span className={'badge ' + statusBadge(r.status)}>{r.status}</span></div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn btn-ghost" onClick={() => openEdit(r)}>Edit</button>
                        <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => remove(r)}>Delete</button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr style={{ background: 'var(--bg-secondary)' }}>
                        <td colSpan={8} style={{ padding: '10px 12px' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Project breakdown for {r.employee} — {r.date}</div>
                          <table style={{ width: '100%' }}>
                            <thead>
                              <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)' }}>
                                <th style={{ padding: '4px 6px', width: 30 }}>#</th><th>Project</th><th style={{ width: 80 }}>Hours</th><th style={{ width: 220 }}>Share</th><th>Manager comment</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ps.map((p, i) => (
                                <tr key={i} style={{ borderTop: '1px solid var(--border-color)', fontSize: 12, verticalAlign: 'top' }}>
                                  <td style={{ padding: '8px 6px' }}>{i + 1}</td>
                                  <td>{p.name}</td>
                                  <td>{Number(p.hours).toFixed(2)}h</td>
                                  <td>
                                    <div style={{ height: 6, background: 'var(--bg-primary)', borderRadius: 999 }}>
                                      <div style={{ width: `${totalHours(r) ? (p.hours / totalHours(r) * 100) : 0}%`, height: '100%', background: 'var(--purple)', borderRadius: 999 }} />
                                    </div>
                                  </td>
                                  <td style={{ color: p.manager_comment ? 'var(--text-secondary)' : 'var(--text-muted)', fontStyle: p.manager_comment ? 'normal' : 'italic' }}>
                                    {p.manager_comment || 'No comment'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {r.notes && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}><b>Notes:</b> {r.notes}</div>}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <Modal open onClose={() => setForm(null)} title={form.id ? 'Edit timesheet' : 'New timesheet'} width={820}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button>
            <button className="btn btn-primary" type="submit" form="ts-form">{form.id ? 'Save' : 'Create'}</button>
          </>}>
          <form id="ts-form" onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Employee *</label><input required style={field} value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })} /></div>
            <div><label style={labelStyle}>Date</label><input type="date" style={field} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div><label style={labelStyle}>Status</label><select style={field} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{ATTENDANCE_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label style={labelStyle}>Clock in</label><input type="time" style={field} value={form.clock_in} onChange={e => setForm({ ...form, clock_in: e.target.value })} /></div>
            <div><label style={labelStyle}>Clock out</label><input type="time" style={field} value={form.clock_out} onChange={e => setForm({ ...form, clock_out: e.target.value })} /></div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Projects — total {form.projects.reduce((s, p) => s + Number(p.hours || 0), 0).toFixed(2)}h</label>
              <div style={{ display: 'grid', gap: 8 }}>
                {form.projects.map((p, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1.5fr auto', gap: 8 }}>
                    <select style={field} value={p.name} onChange={e => updProj(i, 'name', e.target.value)}>
                      <option value="">— project —</option>
                      {projects.map(pr => <option key={pr.id}>{pr.name}</option>)}
                      {p.name && !projects.some(pr => pr.name === p.name) && <option>{p.name}</option>}
                    </select>
                    <input type="number" step="0.25" style={field} value={p.hours} onChange={e => updProj(i, 'hours', e.target.value)} />
                    <input style={field} placeholder="Manager comment…" value={p.manager_comment || ''} onChange={e => updProj(i, 'manager_comment', e.target.value)} />
                    <button type="button" className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => removeProj(i)}>×</button>
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-ghost" style={{ marginTop: 8 }} onClick={addProj}>+ Add project</button>
            </div>

            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Notes</label><textarea rows={2} style={field} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}
