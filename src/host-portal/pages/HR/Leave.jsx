import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout.jsx';
import Modal, { field, labelStyle } from '../../components/Modal.jsx';
import FilePreview from '../../components/FilePreview.jsx';
import { seedLeave, seedLearnerLeaveRequests, seedLeaveBalances, LEAVE_TYPES, ZA_PUBLIC_HOLIDAYS } from '../../data/mockData.js';
import { uid } from '../../lib/useLocalStorage.js';
import { useSupabaseTable } from '@/lib/useSupabaseTable.js';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lightbulb, Paperclip, XCircle, CheckCircle } from 'lucide-react'

const badgeFor = (v) => v === 'Verified' ? 'badge-success' : v === 'Needs Review' ? 'badge-warning' : 'badge-danger'

export default function Leave() {
  const [tab, setTab] = useState('user_requests')
  const [learnerLeave, setLearnerLeave] = useSupabaseTable('hr_learner_leave', seedLearnerLeaveRequests)
  const [staffLeave, setStaffLeave] = useSupabaseTable('hr_leave', seedLeave)
  const [portalLeaveRequests, setPortalLeaveRequests] = useState([])
  const [loadingPortal, setLoadingPortal] = useState(true)
  const [reviewing, setReviewing] = useState(null)
  const [staffForm, setStaffForm] = useState(null)
  // Rejection reason modal state
  const [rejectModal, setRejectModal] = useState(null) // { id, learnerName, isPortal }
  const [rejectNote, setRejectNote] = useState('')
  const { push } = useNotifications()

  const fetchPortalRequests = async () => {
    try {
      setLoadingPortal(true)
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*, profiles:user_id(full_name, email)')
        .order('created_at', { ascending: false })
      if (!error && data) {
        setPortalLeaveRequests(data)
      }
    } catch (e) {
      console.error('Failed to fetch portal leave requests:', e)
    } finally {
      setLoadingPortal(false)
    }
  }

  useEffect(() => {
    fetchPortalRequests()
  }, [])

  // Approve a leave request directly
  const decideApprove = async (id, learnerName, isPortal = false) => {
    if (isPortal) {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'approved' })
        .eq('id', id)
      if (error) {
        toast.error('Failed to approve leave', { description: error.message })
        return
      }
      setPortalLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r))
      toast.success('Leave Approved', { description: `Leave request for ${learnerName} was approved.` })
    } else {
      setLearnerLeave(prev => prev.map(r => r.id === id ? {
        ...r, status: 'Approved',
        decided_by: 'Thandi Mokoena', decided_at: new Date().toISOString().slice(0, 10),
      } : r))
      toast.success('Leave Approved', { description: `${learnerName}'s leave request was approved.` })
    }
    push({ title: 'Leave approved', body: `${learnerName}'s request has been approved.`, link: '/hr/leave', kind: 'leave' })
    setReviewing(null)
  }

  // Open the rejection-reason modal
  const openRejectModal = (id, learnerName, isPortal = false) => {
    setRejectNote('')
    setRejectModal({ id, learnerName, isPortal })
  }

  // Confirm rejection with the typed note
  const confirmReject = async () => {
    const { id, learnerName, isPortal } = rejectModal
    if (isPortal) {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: 'declined' })
        .eq('id', id)
      if (error) {
        toast.error('Failed to decline leave', { description: error.message })
        return
      }
      setPortalLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'declined' } : r))
      toast.error('Leave Declined', { description: `Leave request for ${learnerName} was declined.` })
    } else {
      setLearnerLeave(prev => prev.map(r => r.id === id ? {
        ...r, status: 'Rejected',
        decided_by: 'Thandi Mokoena', decided_at: new Date().toISOString().slice(0, 10),
        decision_note: rejectNote.trim() || undefined,
      } : r))
      toast.error('Leave Rejected', { description: `${learnerName}'s leave request was rejected.` })
    }
    push({ title: 'Leave declined', body: `${learnerName}'s request has been declined.`, link: '/hr/leave', kind: 'leave' })
    setRejectModal(null)
    setRejectNote('')
    setReviewing(null)
  }

  const submitStaff = (e) => {
    e.preventDefault()
    if (!staffForm.employee.trim()) {
      toast.warning('Employee Required', { description: 'Please enter the employee name before saving.' })
      return
    }
    if (staffForm.id) setStaffLeave(prev => prev.map(x => x.id === staffForm.id ? staffForm : x))
    else setStaffLeave(prev => [{ ...staffForm, id: uid('LV') }, ...prev])
    toast.success(staffForm.id ? 'Leave Updated' : 'Leave Added', { description: `Staff leave record saved for ${staffForm.employee}.` })
    setStaffForm(null)
  }

  const allPendingCount = portalLeaveRequests.filter(r => r.status === 'pending').length + learnerLeave.filter(r => r.status === 'Pending').length
  const internLeaveLabel = 'Intern Requests'
  const summary = [
    { label: 'Portal Employee Requests', value: portalLeaveRequests.length, color: 'var(--purple)' },
    { label: 'Pending Approvals', value: allPendingCount, color: 'var(--warning)' },
    { label: 'Approved Requests', value: portalLeaveRequests.filter(r => r.status === 'approved').length + learnerLeave.filter(r => r.status === 'Approved').length, color: 'var(--success)' },
    { label: 'Declined Requests', value: portalLeaveRequests.filter(r => r.status === 'declined').length + learnerLeave.filter(r => r.status === 'Rejected').length, color: 'var(--danger)' },
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
        {[
          ['user_requests', 'Employee Portal Requests', portalLeaveRequests.length],
          ['learner', 'Intern Requests', learnerLeave.length],
          ['staff', 'Staff Leave', staffLeave.length],
          ['balances', 'Leave Balances', seedLeaveBalances.length],
          ['calendar', 'Calendar & Holidays', ZA_PUBLIC_HOLIDAYS.length]
        ].map(([k, l, n]) => (
          <button key={k} className={'btn ' + (tab === k ? 'btn-primary' : 'btn-ghost')} onClick={() => setTab(k)}>{l} ({n})</button>
        ))}
        {tab === 'staff' && <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setStaffForm({ employee: '', type: 'Annual', from: '', to: '', days: 1, status: 'Pending', reason: '' })}>+ Add Staff Leave</button>}
      </div>

      {tab === 'user_requests' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
            <Lightbulb size={14} /> Live leave requests submitted by staff and employees via the portal (/me/leave). Approve or decline requests to update attendance records.
          </div>
          {loadingPortal ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Loading employee leave requests…</div>
          ) : portalLeaveRequests.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No employee leave requests submitted yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 0' }}>Employee</th>
                    <th>Leave Dates</th>
                    <th>Reason</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portalLeaveRequests.map(r => {
                    const empName = r.profiles?.full_name || r.profiles?.email || 'Employee'
                    const isPending = r.status === 'pending'
                    const isApproved = r.status === 'approved'
                    const isDeclined = r.status === 'declined'
                    return (
                      <tr key={r.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                        <td style={{ padding: '12px 0' }}>
                          <div style={{ fontWeight: 600 }}>{empName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.profiles?.email || ''}</div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{r.start_date} → {r.end_date}</td>
                        <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason}</td>
                        <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                        <td>
                          <span className={'badge ' + (isApproved ? 'badge-success' : isDeclined ? 'badge-danger' : 'badge-warning')}>
                            {isApproved ? 'Approved' : isDeclined ? 'Declined' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '4px 10px', fontSize: 12 }}
                              disabled={isApproved}
                              onClick={() => decideApprove(r.id, empName, true)}
                            >
                              <CheckCircle size={13} style={{ marginRight: 4 }} />
                              {isApproved ? 'Approved' : 'Approve'}
                            </button>
                            <button
                              className="btn btn-ghost"
                              style={{ padding: '4px 10px', fontSize: 12, color: 'var(--danger)' }}
                              disabled={isDeclined}
                              onClick={() => openRejectModal(r.id, empName, true)}
                            >
                              <XCircle size={13} style={{ marginRight: 4 }} />
                              {isDeclined ? 'Declined' : 'Decline'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'learner' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}><Lightbulb size={14} /> HR cannot delete an intern's request — only the intern who submitted it can withdraw it.</div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 0' }}>Intern</th><th>Type</th><th>From → To</th><th>Days</th><th>Document</th><th>Authenticity</th><th>Status</th><th></th>
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
          title={`Leave request — ${reviewing.learner_name || reviewing.employee_name || 'Intern'}`}
          subtitle={`${reviewing.type} · ${reviewing.days} day(s) · ${reviewing.from} → ${reviewing.to}`}
          width={780}
          footer={reviewing.status === 'Pending' ? <>
            <button className="btn btn-ghost" onClick={() => setReviewing(null)}>Close</button>
            <button className="btn btn-danger" onClick={() => openRejectModal(reviewing.id, reviewing.learner_name)}>Reject</button>
            <button className="btn btn-primary" onClick={() => decideApprove(reviewing.id, reviewing.learner_name)}>Approve</button>
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
              mockBody={`Mock rendering of the ${reviewing.type.toLowerCase()} supporting document uploaded by the intern.`} height={280} />
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

      {/* ── Rejection reason modal ───────────────────────────────────────── */}
      {rejectModal && (
        <Modal
          open
          onClose={() => { setRejectModal(null); setRejectNote('') }}
          title="Reject leave request"
          subtitle={`Provide a reason for rejecting ${rejectModal.learnerName}'s request. This will be visible to the intern.`}

          width={480}
          footer={<>
            <button className="btn btn-ghost" onClick={() => { setRejectModal(null); setRejectNote('') }}>Cancel</button>
            <button className="btn btn-danger" onClick={confirmReject}>
              <XCircle size={15} style={{ marginRight: 6 }} />
              Confirm Rejection
            </button>
          </>}>
          <div>
            <label style={labelStyle}>Reason for rejection <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              autoFocus
              rows={4}
              style={{ ...field, resize: 'vertical', marginTop: 6 }}
              placeholder="e.g. Insufficient supporting documentation. Please re-apply with a medical certificate."
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              Leave blank to reject without a note. The intern will still be notified.
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
