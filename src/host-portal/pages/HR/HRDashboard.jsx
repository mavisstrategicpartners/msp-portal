import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import { Link } from 'react-router-dom'
import { BarChart, LineChart, Donut, StatCard } from '../../components/Chart.jsx'
import { seedEmployees, seedVacancies, seedApplicants, seedLeave, seedLearnerLeaveRequests, seedTraining, seedAttendance, attendanceTrend, performanceTrend } from '../../data/mockData.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { CheckCircle, XCircle } from 'lucide-react'

export default function HRDashboard() {
  const [employees] = useSupabaseTable('hr_employees', seedEmployees)
  const [vacancies] = useSupabaseTable('hr_vacancies', seedVacancies)
  const [applicants] = useSupabaseTable('hr_applicants', seedApplicants)
  const [leave] = useSupabaseTable('hr_leave', seedLeave)
  const [learnerLeave] = useSupabaseTable('hr_learner_leave', seedLearnerLeaveRequests)
  const [training] = useSupabaseTable('hr_training', seedTraining)
  const [attendanceRecords] = useSupabaseTable('hr_attendance', seedAttendance)
  const [portalLeaveRequests, setPortalLeaveRequests] = useState([])

  useEffect(() => {
    async function fetchPortalRequests() {
      const { data } = await supabase
        .from('leave_requests')
        .select('*, profiles:user_id(full_name, email)')
        .order('created_at', { ascending: false })
      if (data) setPortalLeaveRequests(data)
    }
    fetchPortalRequests()
  }, [])

  const handleApprove = async (id, name) => {
    const { error } = await supabase.from('leave_requests').update({ status: 'approved' }).eq('id', id)
    if (!error) {
      setPortalLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r))
      toast.success('Leave Approved', { description: `Approved leave request for ${name}.` })
    }
  }

  const handleDecline = async (id, name) => {
    const { error } = await supabase.from('leave_requests').update({ status: 'declined' }).eq('id', id)
    if (!error) {
      setPortalLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'declined' } : r))
      toast.error('Leave Declined', { description: `Declined leave request for ${name}.` })
    }
  }

  const empByType = ['Permanent','Contract','Temporary'].map((t, i) => ({
    label: t, value: employees.filter(e => e.employment_type === t).length,
    color: ['#2563eb','#d97706','#7c3aed'][i],
  }))
  const empByDept = Array.from(new Set(employees.map(e => e.department))).map(d => ({ label: d, value: employees.filter(e => e.department === d).length }))
  const empByGender = [
    { label: 'Female', value: employees.filter(e => e.gender === 'Female').length, color: '#7c3aed' },
    { label: 'Male', value: employees.filter(e => e.gender === 'Male').length, color: '#2563eb' },
  ]
  const empByAge = ['20-29','30-39','40-49','50+'].map(b => ({ label: b, value: employees.filter(e => e.age_band === b).length }))
  const trainingCompletion = training.map(t => ({ label: t.title.slice(0, 8), value: Math.round((t.completed / t.enrolled) * 100) }))

  return (
    <DashboardLayout title="HR Executive Dashboard">
      {/* Workforce Analytics */}
      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Workforce Analytics</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 22 }}>
        <StatCard label="Total employees" value={employees.length} color="var(--purple)" />
        <StatCard label="New hires (30d)" value={2} sub="+1 vs last month" trend={50} />
        <StatCard label="Terminations (30d)" value={0} sub="No exits" trend={0} />
        <StatCard label="Turnover rate" value="3.2%" sub="Rolling 12 months" color="var(--success)" />
        <StatCard label="Active employees" value={employees.length - 1} sub={`${employees.length - 1} of ${employees.length}`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 22 }}>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>EMPLOYMENT TYPE</div>
          <Donut data={empByType} size={160} thickness={20} />
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>DEPARTMENT HEADCOUNT</div>
          <BarChart data={empByDept} height={180} color="#7c3aed" />
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>DIVERSITY — GENDER</div>
          <Donut data={empByGender} size={160} thickness={20} />
        </div>
      {/* Live Employee Leave Approvals */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Pending Employee Leave Requests ({portalLeaveRequests.filter(r => r.status === 'pending').length})
        </div>
        <Link to="/hr/leave" style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 600 }}>Manage All Leave Requests →</Link>
      </div>
      <div className="card" style={{ marginBottom: 22 }}>
        {portalLeaveRequests.length === 0 ? (
          <div style={{ padding: 16, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>No employee leave requests submitted yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 0' }}>Employee</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {portalLeaveRequests.slice(0, 5).map(r => {
                  const name = r.profiles?.full_name || r.profiles?.email || 'Employee'
                  const isPending = r.status === 'pending'
                  const isApproved = r.status === 'approved'
                  const isDeclined = r.status === 'declined'
                  return (
                    <tr key={r.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 12 }}>
                      <td style={{ padding: '10px 0', fontWeight: 600 }}>
                        {name}
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.profiles?.email || ''}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{r.start_date} → {r.end_date}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason}</td>
                      <td>
                        <span className={'badge ' + (isApproved ? 'badge-success' : isDeclined ? 'badge-danger' : 'badge-warning')}>
                          {isApproved ? 'Approved' : isDeclined ? 'Declined' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '3px 8px', fontSize: 11 }}
                            disabled={isApproved}
                            onClick={() => handleApprove(r.id, name)}
                          >
                            <CheckCircle size={12} style={{ marginRight: 3 }} />
                            Approve
                          </button>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '3px 8px', fontSize: 11, color: 'var(--danger)' }}
                            disabled={isDeclined}
                            onClick={() => handleDecline(r.id, name)}
                          >
                            <XCircle size={12} style={{ marginRight: 3 }} />
                            Decline
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 22 }}>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>AGE DISTRIBUTION</div>
          <BarChart data={empByAge} height={180} />
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>EMPLOYMENT EQUITY OVERVIEW</div>
          <div style={{ display: 'grid', gap: 6, fontSize: 12 }}>
            {[['Black African', 65],['Coloured', 12],['Indian', 8],['White', 15]].map(([g, v]) => (
              <div key={g}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{g}</span><b>{v}%</b></div>
                <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 999 }}><div style={{ width: v + '%', height: '100%', background: 'var(--purple)', borderRadius: 999 }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recruitment */}
      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Recruitment Dashboard</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 14 }}>
        <StatCard label="Open vacancies" value={vacancies.filter(v => v.status === 'Open').length} />
        <StatCard label="Applications received" value={vacancies.reduce((s, v) => s + v.applicants, 0)} />
        <StatCard label="Shortlisted" value={4} />
        <StatCard label="Interviews scheduled" value={6} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 22 }}>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>RECRUITMENT FUNNEL</div>
          <BarChart data={[
            { label: 'Applied', value: 115 }, { label: 'Screen', value: 62 },
            { label: 'Interview', value: 28 }, { label: 'Offer', value: 9 }, { label: 'Hire', value: 5 },
          ]} height={200} />
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>TIME TO HIRE (days)</div>
          <LineChart data={[
            { label: 'Feb', value: 42 }, { label: 'Mar', value: 38 }, { label: 'Apr', value: 32 },
            { label: 'May', value: 30 }, { label: 'Jun', value: 28 },
          ]} height={200} color="#7c3aed" />
        </div>
      </div>

      {/* Real-time Attendance & Presence */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Real-time Attendance & Time Tracking</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <a href="/admin/attendance" style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 600 }}>Live Command Center (Teams View) ↗</a>
          <Link to="/hr/attendance" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Full Register →</Link>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 22 }}>
        <StatCard label="Clocked In" value={attendanceRecords.filter(r => r.status === 'Clocked In' || r.status === 'Present').length} color="var(--success)" sub="Active today" />
        <StatCard label="On Break" value={attendanceRecords.filter(r => r.status === 'On Break').length} color="var(--warning)" sub="Temporary break" />
        <StatCard label="Clocked Out" value={attendanceRecords.filter(r => r.status === 'Clocked Out').length} sub="Shift ended" />
        <StatCard label="On Leave / Absent" value={attendanceRecords.filter(r => r.status === 'On Leave' || r.status === 'Absent').length} color="var(--danger)" sub="Unavailable" />
      </div>

      {/* Leave */}
      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Leave Dashboard</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 14 }}>
        <StatCard label="Currently on leave" value={leave.filter(l => l.status === 'Approved').length + learnerLeave.filter(l => l.status === 'Approved').length} />
        <StatCard label="Pending approvals" value={leave.filter(l => l.status === 'Pending').length + learnerLeave.filter(l => l.status === 'Pending').length} color="var(--warning)" />
        <StatCard label="Leave utilisation" value="42%" sub="YTD" />
        <StatCard label="Sick leave trend" value="↓ 12%" color="var(--success)" sub="vs last quarter" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 22 }}>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>ATTENDANCE — LAST 2 WEEKS</div>
          <LineChart data={attendanceTrend} height={200} />
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>PERFORMANCE TREND</div>
          <BarChart data={performanceTrend} height={200} color="#16a34a" />
        </div>
      </div>

      {/* Learning + Compliance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>LEARNING DASHBOARD</div>
          <BarChart data={trainingCompletion} height={180} />
          <Link to="/hr/training" style={{ display: 'inline-block', marginTop: 8, fontSize: 12, color: 'var(--purple)' }}>View training →</Link>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>COMPLIANCE DASHBOARD</div>
          <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
            {[['Employment Equity report', 'Submitted'],['Skills Development report', 'Draft'],['POPIA compliance', 'On track'],['Expiring contracts', '2 in 30d'],['Expiring certifications', '4 in 60d'],['Policy acceptance', '96%']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid var(--border-color)' }}>
                <span>{k}</span><b>{v}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
