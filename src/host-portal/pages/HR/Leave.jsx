import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import FilePreview from '../../components/FilePreview.jsx'
import { seedLeave, seedLearnerLeaveRequests, seedLeaveBalances, LEAVE_TYPES, ZA_PUBLIC_HOLIDAYS } from '../../data/mockData.js'
import { useLocalStorage, uid } from '../../lib/useLocalStorage.js'
import { useNotifications } from '../../context/NotificationContext.jsx'
import { Lightbulb, Paperclip } from 'lucide-react'

const badgeFor = (v) => v === 'Verified' ? 'badge-success' : v === 'Needs Review' ? 'badge-warning' : 'badge-danger'

export default function Leave() {
  const [tab, setTab] = useState('learner')
  const [learnerLeave, setLearnerLeave] = useLocalStorage('host.hr.learner_leave', seedLearnerLeaveRequests)
  const [staffLeave, setStaffLeave] = useLocalStorage('host.hr.leave', seedLeave)
  const [reviewing, setReviewing] = useState(null)
  const [staffForm, setStaffForm] = useState(null)
  const { push } = useNotifications()

  const decide = (id, decision) => {
    const note = decision === 'Rejected' ? window.prompt('Reason for rejection (visible to learner)?', '') : ''
    if (decision === 'Rejected' && note === null) return
    setLearnerLeave(prev => prev.map(r => r.id === id ? {
      ...r, status: decision === 'Approved' ? 'Approved' : 'Rejected',
      decided_by: 'Thandi Mokoena', decided_at: new Date().toISOString().slice(0, 10),
      decision_note: note || undefined,
    } : r))
    push({ title: `Leave ${decision.toLowerCase()}`, body: `Request has been ${decision.toLowerCase()}.`, link: '/hr/leave', kind: 'leave' })
    setReviewing(null)
  }

  const submitStaff = (e) => {
    e.preventDefault()
    if (!staffForm.employee.trim()) return alert('Employee is required')
    if (staffForm.id) setStaffLeave(prev => prev.map(x => x.id === staffForm.id ? staffForm : x))
    else setStaffLeave(prev => [{ ...staffForm, id: uid('LV') }, ...prev])
    setStaffForm(null)
  }

  const summary = [
    { label: 'Learner requests', value: learnerLeave.length, color: 'var(--purple)' },
    { label: 'Pending review', value: learnerLeave.filter(r => r.status === 'Pending').length, color: 'var(--warning)' },
    { label: 'Approved', value: learnerLeave.filter(r => r.status === 'Approved').length, color: 'var(--success)' },
    { label: 'Rejected', value: learnerLeave.filter(r => r.status === 'Rejected').length, color: 'var(--danger)' },
  ]

  return (
    <DashboardLayout title="Leave Management">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 18 }}>
        {summary.map(s => (
          <div key={s.label} className="card">
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[['learner','Learner Requests', learnerLeave.length],['staff','Staff Leave', staffLeave.length],['balances','Leave Balances', seedLeaveBalances.length],['calendar','Calendar & Holidays', ZA_PUBLIC_HOLIDAYS.length]].map(([k, l, n]) => (
          <button key={k} className={'btn ' + (tab === k ? 'btn-primary' : 'btn-ghost')} onClick={() => setTab(k)}>{l} ({n})</button>
        ))}
        {tab === 'staff' && <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setStaffForm({ employee: '', type: 'Annual', from: '', to: '', days: 1, status: 'Pending', reason: '' })}>+ Add Staff Leave</button>}
      </div>

      {tab === 'learner' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}><Lightbulb size={14} /> HR cannot delete a learner's request — only the learner who submitted it can withdraw it.</div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 0' }}>Learner</th><th>Type</th><th>From → To</th><th>Days</th><th>Document</th><th>Authenticity</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {learnerLeave.map(r => (
                  <tr key={r.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                    <td style={{ padding: '12px 0' }}>
                      <div style={{ fontWeight: 600 }}>{r.learner_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.program} · Submitted {r.submitted_at}</div>
                    </td>
                    <td>{r.type}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.from} → {r.to}</td>
                    <td>{r.days}</td>
                    <td>{r.document_name ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12 }}><Paperclip size={13} /> {r.document_name}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>{r.doc_verification ? <span className={'badge ' + badgeFor(r.doc_verification.status)} title={r.doc_verification.reasons?.join(', ')}>{r.doc_verification.status}</span> : '—'}</td>
                    <td><span className={'badge ' + (r.status === 'Approved' ? 'badge-success' : r.status === 'Rejected' ? 'badge-danger' : 'badge-warning')}>{r.status}</span></td>
                    <td><button className="btn btn-primary" onClick={() => setReviewing(r)}>Review</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'staff' && (
        <div className="card">
          <table>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 0' }}>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Reason</th><th></th>
              </tr>
            </thead>
            <tbody>
              {staffLeave.map(r => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>{r.employee}</td>
                  <td>{r.type}</td><td>{r.from}</td><td>{r.to}</td><td>{r.days}</td>
                  <td><span className={'badge ' + (r.status === 'Approved' ? 'badge-success' : r.status === 'Declined' ? 'badge-danger' : 'badge-warning')}>{r.status}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.reason}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-ghost" onClick={() => setStaffForm(r)}>Edit</button>
                    <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setStaffLeave(prev => prev.filter(x => x.id !== r.id))}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'balances' && (
        <div className="card">
          <table>
            <thead><tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 0' }}>Employee</th>
              {LEAVE_TYPES.filter(t => !['Maternity','Paternity'].includes(t)).map(t => <th key={t}>{t}</th>)}
            </tr></thead>
            <tbody>
              {seedLeaveBalances.map(b => (
                <tr key={b.employee_id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                  <td style={{ padding: '10px 0', fontWeight: 500 }}>{b.employee}</td>
                  {LEAVE_TYPES.filter(t => !['Maternity','Paternity'].includes(t)).map(t => <td key={t}>{b[t] ?? '—'}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'calendar' && (
        <div className="card">
          <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>South African public holidays</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 10 }}>
            {ZA_PUBLIC_HOLIDAYS.map(h => (
              <div key={h.date} className="card" style={{ padding: 12, background: 'var(--bg-secondary)' }}>
                <div style={{ fontSize: 12, color: 'var(--brand)', fontWeight: 700 }}>{h.date}</div>
                <div style={{ fontWeight: 600 }}>{h.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{h.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviewing && (
        <Modal open onClose={() => setReviewing(null)}
          title={`Leave request — ${reviewing.learner_name}`}
          subtitle={`${reviewing.type} · ${reviewing.days} day(s) · ${reviewing.from} → ${reviewing.to}`}
          width={780}
          footer={reviewing.status === 'Pending' ? <>
            <button className="btn btn-ghost" onClick={() => setReviewing(null)}>Close</button>
            <button className="btn btn-danger" onClick={() => decide(reviewing.id, 'Rejected')}>Reject</button>
            <button className="btn btn-primary" onClick={() => decide(reviewing.id, 'Approved')}>Approve</button>
          </> : <button className="btn btn-primary" onClick={() => setReviewing(null)}>Close</button>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, fontSize: 13, marginBottom: 14 }}>
            <div><div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Program</div>{reviewing.program}</div>
            <div><div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Status</div><span className={'badge ' + (reviewing.status === 'Approved' ? 'badge-success' : reviewing.status === 'Rejected' ? 'badge-danger' : 'badge-warning')}>{reviewing.status}</span></div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Reason</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{reviewing.reason}</div>
          </div>
          {reviewing.doc_verification && (
            <div className="card" style={{ padding: 12, background: 'var(--bg-secondary)', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ fontSize: 12 }}>Document authenticity check</b>
                <span className={'badge ' + badgeFor(reviewing.doc_verification.status)}>{reviewing.doc_verification.status} · {reviewing.doc_verification.score}/100</span>
              </div>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12, color: 'var(--text-secondary)' }}>
                {reviewing.doc_verification.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
          {reviewing.document_name && (
            <FilePreview url={reviewing.document_url} mime={reviewing.document_type} name={reviewing.document_name}
              mockTitle={reviewing.document_name.replace(/\.[^.]+$/, '')}
              mockBody={`Mock rendering of the ${reviewing.type.toLowerCase()} supporting document uploaded by the learner.`} height={280} />
          )}
        </Modal>
      )}

      {staffForm && (
        <Modal open onClose={() => setStaffForm(null)} title={staffForm.id ? 'Edit leave' : 'Add staff leave'} width={520}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setStaffForm(null)}>Cancel</button>
            <button className="btn btn-primary" type="submit" form="stf">Save</button>
          </>}>
          <form id="stf" onSubmit={submitStaff} style={{ display: 'grid', gap: 12 }}>
            <div><label style={labelStyle}>Employee</label><input style={field} value={staffForm.employee} onChange={e => setStaffForm({ ...staffForm, employee: e.target.value })} required /></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              <div><label style={labelStyle}>Type</label><select style={field} value={staffForm.type} onChange={e => setStaffForm({ ...staffForm, type: e.target.value })}>{LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label style={labelStyle}>Status</label><select style={field} value={staffForm.status} onChange={e => setStaffForm({ ...staffForm, status: e.target.value })}><option>Pending</option><option>Approved</option><option>Declined</option></select></div>
              <div><label style={labelStyle}>From</label><input type="date" style={field} value={staffForm.from} onChange={e => setStaffForm({ ...staffForm, from: e.target.value })} /></div>
              <div><label style={labelStyle}>To</label><input type="date" style={field} value={staffForm.to} onChange={e => setStaffForm({ ...staffForm, to: e.target.value })} /></div>
              <div><label style={labelStyle}>Days</label><input type="number" style={field} value={staffForm.days} onChange={e => setStaffForm({ ...staffForm, days: Number(e.target.value) })} /></div>
            </div>
            <div><label style={labelStyle}>Reason</label><textarea rows={3} style={field} value={staffForm.reason} onChange={e => setStaffForm({ ...staffForm, reason: e.target.value })} /></div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}
