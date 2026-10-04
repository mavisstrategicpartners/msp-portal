import { useMemo, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import { seedAttendance, ATTENDANCE_STATUSES } from '../../data/mockData.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'

const statusBadge = (s) => {
  if (s === 'Present' || s === 'Clocked In') return 'badge-success'
  if (s === 'On Break') return 'badge-warning'
  if (s === 'Clocked Out') return 'badge-purple'
  if (s === 'On Leave') return 'badge-info'
  return 'badge-danger'
}

export default function HRAttendance() {
  const [records, setRecords] = useSupabaseTable('hr_attendance', seedAttendance)
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [date, setDate] = useState('')

  const filtered = useMemo(() => records.filter(r =>
    (statusFilter === 'All' || r.status === statusFilter) &&
    (!date || r.date === date) &&
    (r.learner_name.toLowerCase().includes(q.toLowerCase()) || (r.mentor || '').toLowerCase().includes(q.toLowerCase()))
  ), [records, q, statusFilter, date])

  const setStatus = (id, status) => setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  const toggleFlag = (id, flag) => setRecords(prev => prev.map(r => r.id === id ? { ...r, leave_flags: { ...r.leave_flags, [flag]: !r.leave_flags?.[flag] } } : r))

  const stats = ATTENDANCE_STATUSES.map(s => ({ label: s, value: filtered.filter(r => r.status === s).length }))

  return (
    <DashboardLayout title="Work Attendance Register">
      <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--card-bg)', border: '1px solid var(--purple)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>🟢 Live Workforce Command Center (Teams Presence)</span>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>View real-time check-ins, active hours, and break timers across all company departments and interns.</p>
        </div>
        <a href="/admin/attendance" style={{ padding: '6px 14px', background: 'var(--purple)', color: '#fff', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
          Open Live Presence View ↗
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search learner or mentor…"
          style={{ flex: 1, minWidth: 220, padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }}>
          {['All', ...ATTENDANCE_STATUSES].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 6px' }}>Intern</th>
                <th>Contact</th><th>Sponsor</th><th>Host</th>
                <th>Mentor</th><th>Mentor #</th>
                <th>Date</th><th>Status</th>
                <th title="Sick Leave">SL</th><th title="Public Holiday">PH</th>
                <th title="Annual Leave">AL</th><th title="Compassionate Leave">CL</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map(r => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 12 }}>
                  <td style={{ padding: '10px 6px', fontWeight: 600 }}>{r.learner_name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.contact}</td>
                  <td>{r.sponsor}</td>
                  <td>{r.host}</td>
                  <td>{r.mentor}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.mentor_phone}</td>
                  <td>{r.date}</td>
                  <td>
                    <select value={r.status} onChange={e => setStatus(r.id, e.target.value)}
                      style={{ padding: '4px 6px', borderRadius: 6, fontSize: 11, border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--input-text)' }}>
                      {ATTENDANCE_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <div style={{ marginTop: 2 }}><span className={'badge ' + statusBadge(r.status)}>{r.status}</span></div>
                  </td>
                  {['SL','PH','AL','CL'].map(f => (
                    <td key={f} style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={!!r.leave_flags?.[f]} onChange={() => toggleFlag(r.id, f)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
