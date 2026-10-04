import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import { Link } from 'react-router-dom'
import { BarChart, LineChart, Donut, StatCard } from '../../components/Chart.jsx'
import { seedEmployees, seedVacancies, seedLeave, seedLearnerLeaveRequests, seedTraining, seedAttendance, attendanceTrend, performanceTrend } from '../../data/mockData.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { CheckCircle, XCircle, TrendingUp, TrendingDown, Users, Clock, Star, AlertTriangle, Award, BookOpen, UserCheck, UserX, Activity, ChevronRight, Sparkles } from 'lucide-react'

const MetricCard = ({ label, value, sub, trend, color = 'var(--purple)', icon: Icon, link }) => (
  <div style={{
    background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
    borderRadius: 12, padding: '20px 22px', boxShadow: 'var(--shadow-sm)',
    display: 'flex', flexDirection: 'column', gap: 4, position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 12px 0 80px', background: color, opacity: 0.08 }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-muted)' }}>{label}</span>
      {Icon && <div style={{ width: 32, height: 32, borderRadius: 8, background: color, opacity: 0.15, display: 'grid', placeItems: 'center' }}><Icon size={16} style={{ color }} /></div>}
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>}
    {trend !== undefined && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: trend >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
        {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {Math.abs(trend)}% vs last month
      </div>
    )}
    {link && (
      <Link to={link} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color, fontWeight: 600, marginTop: 4 }}>
        View details <ChevronRight size={12} />
      </Link>
    )}
  </div>
)

const SectionHeader = ({ title, action, actionTo }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{title}</div>
    {action && <Link to={actionTo} style={{ fontSize: 12, color: 'var(--purple)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>{action} <ChevronRight size={12} /></Link>}
  </div>
)

export default function HRDashboard() {
  const [employees] = useSupabaseTable('hr_employees', seedEmployees)
  const [vacancies] = useSupabaseTable('hr_vacancies', seedVacancies)
  const [leave] = useSupabaseTable('hr_leave', seedLeave)
  const [learnerLeave] = useSupabaseTable('hr_learner_leave', seedLearnerLeaveRequests)
  const [training] = useSupabaseTable('hr_training', seedTraining)
  const [attendanceRecords] = useSupabaseTable('hr_attendance', seedAttendance)
  const [portalLeaveRequests, setPortalLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPortalRequests() {
      setLoading(true)
      const { data } = await supabase
        .from('leave_requests')
        .select('*, profiles:user_id(full_name, email)')
        .order('created_at', { ascending: false })
      if (data) setPortalLeaveRequests(data)
      setLoading(false)
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

  const empByType = ['Permanent', 'Contract', 'Temporary'].map((t, i) => ({
    label: t, value: employees.filter(e => e.employment_type === t).length,
    color: ['#7c3aed', '#d97706', '#2563eb'][i],
  }))
  const empByDept = Array.from(new Set(employees.map(e => e.department))).map(d => ({ label: d.split(' ')[0], value: employees.filter(e => e.department === d).length }))
  const empByGender = [
    { label: 'Female', value: employees.filter(e => e.gender === 'Female').length, color: '#7c3aed' },
    { label: 'Male', value: employees.filter(e => e.gender === 'Male').length, color: '#2563eb' },
  ]
  const trainingCompletion = training.slice(0, 5).map(t => ({ label: t.title.slice(0, 10), value: Math.round((t.completed / (t.enrolled || 1)) * 100) }))
  const pendingLeave = portalLeaveRequests.filter(r => r.status === 'pending')
  const clockedIn = attendanceRecords.filter(r => r.status === 'Clocked In' || r.status === 'Present').length
  const totalAtt = attendanceRecords.length || 1
  const attRate = Math.round((clockedIn / totalAtt) * 100)

  const quickStats = [
    { label: 'Total Employees', value: employees.length, icon: Users, color: 'var(--purple)', sub: 'Active headcount', trend: 5 },
    { label: 'Clocked In Today', value: clockedIn, icon: Clock, color: 'var(--success)', sub: `${attRate}% attendance rate`, link: '/hr/attendance' },
    { label: 'Pending Leave', value: pendingLeave.length, icon: AlertTriangle, color: 'var(--warning)', sub: 'Awaiting approval', link: '/hr/leave' },
    { label: 'Open Vacancies', value: vacancies.filter(v => v.status === 'Open').length, icon: UserCheck, color: 'var(--brand)', sub: 'Active job postings', link: '/hr/recruitment' },
    { label: 'Training Courses', value: training.length, icon: BookOpen, color: '#2563eb', sub: 'Active programmes', link: '/hr/training' },
    { label: 'On Leave Today', value: attendanceRecords.filter(r => r.status === 'On Leave').length, icon: UserX, color: 'var(--danger)', sub: 'Out of office', link: '/hr/leave' },
  ]

  return (
    <DashboardLayout title="HR Executive Dashboard">

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--purple) 0%, #4c1d95 100%)',
        borderRadius: 16, padding: '24px 28px', marginBottom: 24, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        boxShadow: '0 8px 32px rgba(109,60,134,.35)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Sparkles size={18} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', opacity: 0.8 }}>HR Command Centre</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Good day, HR Team 👋</h2>
          <p style={{ margin: '6px 0 0', opacity: 0.75, fontSize: 13 }}>
            {pendingLeave.length} leave request{pendingLeave.length !== 1 ? 's' : ''} pending · {employees.length} employees · {vacancies.filter(v => v.status === 'Open').length} open roles
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/hr/leave" style={{ background: 'rgba(255,255,255,.2)', color: 'white', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={14} /> Leave Requests
          </Link>
          <Link to="/hr/recruitment" style={{ background: 'rgba(255,255,255,.15)', color: 'white', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <UserCheck size={14} /> Post Vacancy
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {quickStats.map((s, i) => (
          <MetricCard key={i} {...s} />
        ))}
      </div>

      {/* Workforce Analytics */}
      <SectionHeader title="Workforce Analytics" action="View all employees" actionTo="/hr/admin" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Employment Type</div>
          <Donut data={empByType} size={160} thickness={22} />
        </div>
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Department Headcount</div>
          <BarChart data={empByDept} height={170} color="var(--purple)" />
        </div>
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Diversity — Gender</div>
          <Donut data={empByGender} size={160} thickness={22} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
            {empByGender.map(g => (
              <div key={g.label} style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: g.color }}>{g.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{g.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Leave Requests */}
      <SectionHeader title={`Pending Employee Leave (${pendingLeave.length})`} action="Manage all leave" actionTo="/hr/leave" />
      <div className="card" style={{ marginBottom: 24 }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading leave requests…</div>
        ) : portalLeaveRequests.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <CheckCircle size={36} style={{ color: 'var(--success)', margin: '0 auto 12px', display: 'block' }} />
            <div style={{ fontWeight: 600, fontSize: 14 }}>All caught up!</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>No pending leave requests from staff.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  <th style={{ padding: '8px 12px 8px 0' }}>Employee</th>
                  <th style={{ padding: '8px 12px' }}>Dates</th>
                  <th style={{ padding: '8px 12px' }}>Reason</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                  <th style={{ padding: '8px 0', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {portalLeaveRequests.slice(0, 8).map(r => {
                  const name = r.profiles?.full_name || r.profiles?.email || 'Employee'
                  const isPending = r.status === 'pending'
                  const isApproved = r.status === 'approved'
                  const isDeclined = r.status === 'declined'
                  return (
                    <tr key={r.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 12px 12px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--purple-soft)', color: 'var(--purple)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.profiles?.email || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.start_date} → {r.end_date}</td>
                      <td style={{ padding: '12px', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${isApproved ? 'badge-success' : isDeclined ? 'badge-danger' : 'badge-warning'}`}>
                          {isApproved ? 'Approved' : isDeclined ? 'Declined' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '4px 10px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            disabled={!isPending}
                            onClick={() => handleApprove(r.id, name)}
                          >
                            <CheckCircle size={12} /> Approve
                          </button>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '4px 10px', fontSize: 11, color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            disabled={!isPending}
                            onClick={() => handleDecline(r.id, name)}
                          >
                            <XCircle size={12} /> Decline
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

      {/* Attendance + Performance Trends */}
      <SectionHeader title="Attendance & Performance Trends" action="Full register" actionTo="/hr/attendance" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Attendance — Last 2 Weeks</div>
          <LineChart data={attendanceTrend} height={200} color="var(--success)" />
        </div>
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Performance Scores — Current Cycle</div>
          <BarChart data={performanceTrend} height={200} color="var(--purple)" />
        </div>
      </div>

      {/* Recruitment + Training */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 24 }}>
        {/* Recruitment Funnel */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Recruitment Funnel</div>
            <Link to="/hr/recruitment" style={{ fontSize: 11, color: 'var(--purple)', fontWeight: 600 }}>View →</Link>
          </div>
          <BarChart data={[
            { label: 'Applied', value: 115 }, { label: 'Screen', value: 62 },
            { label: 'Interview', value: 28 }, { label: 'Offer', value: 9 }, { label: 'Hired', value: 5 },
          ]} height={180} />
        </div>

        {/* Training Completion */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Training Completion</div>
            <Link to="/hr/training" style={{ fontSize: 11, color: 'var(--purple)', fontWeight: 600 }}>View →</Link>
          </div>
          <BarChart data={trainingCompletion} height={180} color="var(--brand)" />
        </div>

        {/* Compliance */}
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Compliance Dashboard</div>
          <div style={{ display: 'grid', gap: 0 }}>
            {[
              ['Employment Equity report', 'Submitted', 'var(--success)'],
              ['Skills Development report', 'Draft', 'var(--warning)'],
              ['POPIA compliance', 'On track', 'var(--success)'],
              ['Expiring contracts', '2 in 30d', 'var(--warning)'],
              ['Policy acceptance rate', '96%', 'var(--purple)'],
            ].map(([k, v, c]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 12 }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: c }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employment Equity */}
      <SectionHeader title="Employment Equity Overview" />
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[['Black African', 65, 'var(--purple)'], ['Coloured', 12, 'var(--brand)'], ['Indian', 8, '#2563eb'], ['White', 15, 'var(--warning)']].map(([g, v, c]) => (
            <div key={g}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{g}</span>
                <b style={{ fontSize: 12, color: c }}>{v}%</b>
              </div>
              <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 999 }}>
                <div style={{ width: `${v}%`, height: '100%', background: c, borderRadius: 999, transition: 'width .6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <SectionHeader title="Quick Actions" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 8 }}>
        {[
          { label: 'Post Vacancy', to: '/hr/recruitment', color: 'var(--brand)', icon: UserCheck },
          { label: 'Add Training', to: '/hr/training', color: 'var(--purple)', icon: BookOpen },
          { label: 'Review Leave', to: '/hr/leave', color: 'var(--warning)', icon: AlertTriangle },
          { label: 'Run Timesheets', to: '/hr/timesheets', color: '#2563eb', icon: Clock },
          { label: 'Performance', to: '/hr/performance', color: 'var(--success)', icon: Star },
          { label: 'Talent Pipeline', to: '/hr/talent', color: '#7c3aed', icon: Award },
        ].map(({ label, to, color, icon: Icon }) => (
          <Link key={to} to={to} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '18px 12px',
            background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12,
            textDecoration: 'none', color: 'var(--text-primary)', fontSize: 12, fontWeight: 600,
            transition: 'all .15s', boxShadow: 'var(--shadow-sm)',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = color}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: color, opacity: 1, display: 'grid', placeItems: 'center' }}>
              <Icon size={18} color="white" />
            </div>
            {label}
          </Link>
        ))}
      </div>
    </DashboardLayout>
  )
}
