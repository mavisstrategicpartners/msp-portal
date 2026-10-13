import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart, LineChart, Donut, StatCard } from '../../components/Chart.jsx'
import {
  seedEmployees,
  seedVacancies,
  seedApplicants,
  seedLeave,
  seedLearnerLeaveRequests,
  seedTraining,
  seedAttendance,
  attendanceTrend,
  performanceTrend
} from '../../data/mockData.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import {
  CheckCircle,
  XCircle,
  CalendarDays,
  ClipboardList,
  Users,
  Briefcase,
  BarChart3,
  Crown,
  BookOpen,
  Settings,
  Wrench,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react'

export default function HRDashboard() {
  const navigate = useNavigate()
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
      try {
        const { data } = await supabase
          .from('leave_requests')
          .select('*, profiles:user_id(full_name, email)')
          .order('created_at', { ascending: false })
        if (data) setPortalLeaveRequests(data)
      } catch (err) {
        console.warn('Could not fetch portal leave requests:', err)
      }
    }
    fetchPortalRequests()
  }, [])

  const handleApprove = async (id, name) => {
    const { error } = await supabase.from('leave_requests').update({ status: 'approved' }).eq('id', id)
    if (!error) {
      setPortalLeaveRequests(prev => prev.map(r => (r.id === id ? { ...r, status: 'approved' } : r)))
      toast.success('Leave Approved', { description: `Approved leave request for ${name}.` })
    }
  }

  const handleDecline = async (id, name) => {
    const { error } = await supabase.from('leave_requests').update({ status: 'declined' }).eq('id', id)
    if (!error) {
      setPortalLeaveRequests(prev => prev.map(r => (r.id === id ? { ...r, status: 'declined' } : r)))
      toast.error('Leave Declined', { description: `Declined leave request for ${name}.` })
    }
  }

  const empByType = ['Permanent', 'Contract', 'Temporary'].map((t, i) => ({
    label: t,
    value: employees.filter(e => e.employment_type === t).length,
    color: ['#2563eb', '#d97706', '#7c3aed'][i]
  }))

  const empByDept = Array.from(new Set(employees.map(e => e.department))).map(d => ({
    label: d,
    value: employees.filter(e => e.department === d).length
  }))

  const empByGender = [
    { label: 'Female', value: employees.filter(e => e.gender === 'Female').length, color: '#7c3aed' },
    { label: 'Male', value: employees.filter(e => e.gender === 'Male').length, color: '#2563eb' }
  ]

  const empByAge = ['20-29', '30-39', '40-49', '50+'].map(b => ({
    label: b,
    value: employees.filter(e => e.age_band === b).length
  }))

  const trainingCompletion = training.map(t => ({
    label: t.title.slice(0, 8),
    value: t.enrolled ? Math.round((t.completed / t.enrolled) * 100) : 0
  }))

  const pendingLeaveCount = portalLeaveRequests.filter(r => r.status === 'pending').length

  const quickNavCards = [
    { title: 'Leave Management', path: '/host/hr/leave', icon: CalendarDays, meta: `${pendingLeaveCount} pending review`, color: 'text-amber-500' },
    { title: 'Timesheets', path: '/host/hr/timesheets', icon: ClipboardList, meta: 'Weekly project hours', color: 'text-blue-500' },
    { title: 'Employee Recruitment', path: '/host/hr/recruitment', icon: Briefcase, meta: `${vacancies.length} open positions`, color: 'text-emerald-500' },
    { title: 'HR Performance', path: '/host/hr/performance', icon: BarChart3, meta: 'Q2 appraisals active', color: 'text-purple-500' },
    { title: 'Talent Management', path: '/host/hr/talent', icon: Crown, meta: 'Succession & HiPo bench', color: 'text-indigo-500' },
    { title: 'Training & Development', path: '/host/hr/training', icon: BookOpen, meta: `${training.length} active programs`, color: 'text-pink-500' },
    { title: 'HR Administration', path: '/host/hr/admin', icon: Settings, meta: 'Directory & documentation', color: 'text-slate-500' },
    { title: 'Integrations', path: '/host/hr/integrations', icon: Wrench, meta: 'Payroll & biometric APIs', color: 'text-teal-500' },
  ]

  return (
    <DashboardLayout title="HR Executive Dashboard">
      <div className="space-y-6">
        {/* Quick Module Navigation Hub */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              HR Functional Modules
            </h2>
            <span className="text-xs text-primary font-medium flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> All systems online
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {quickNavCards.map(item => {
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="card p-3.5 text-left transition-all hover:border-primary/50 hover:shadow-md group flex items-start gap-3"
                >
                  <div className={`rounded-lg p-2 bg-muted/40 group-hover:bg-primary/10 transition-colors ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {item.meta}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Workforce Analytics Stats */}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Workforce Analytics
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Total employees" value={employees.length} color="var(--purple)" />
            <StatCard label="New hires (30d)" value={2} sub="+1 vs last month" trend={50} />
            <StatCard label="Terminations (30d)" value={0} sub="Zero exits" trend={0} />
            <StatCard label="Turnover rate" value="3.2%" sub="Rolling 12 months" color="var(--success)" />
            <StatCard label="Active employees" value={employees.length - 1} sub={`${employees.length - 1} of ${employees.length}`} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="card p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Employment Type</div>
            <Donut data={empByType} size={160} thickness={20} />
          </div>
          <div className="card p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Department Headcount</div>
            <BarChart data={empByDept} height={180} color="#7c3aed" />
          </div>
          <div className="card p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Diversity — Gender</div>
            <Donut data={empByGender} size={160} thickness={20} />
          </div>
        </div>

        {/* Pending Employee Leave Approvals */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Pending Employee Leave Requests ({pendingLeaveCount})
            </div>
            <Link to="/host/hr/leave" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              Manage All Leave Requests <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="card overflow-hidden">
            {portalLeaveRequests.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No employee leave requests submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-4">Employee</th>
                      <th className="py-2.5 px-4">Dates</th>
                      <th className="py-2.5 px-4">Reason</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {portalLeaveRequests.slice(0, 5).map(r => {
                      const name = r.profiles?.full_name || r.profiles?.email || 'Employee'
                      const isPending = r.status === 'pending'
                      const isApproved = r.status === 'approved'
                      const isDeclined = r.status === 'declined'
                      return (
                        <tr key={r.id} className="text-xs hover:bg-muted/20">
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-foreground">{name}</div>
                            <div className="text-[10px] text-muted-foreground">{r.profiles?.email || ''}</div>
                          </td>
                          <td className="py-2.5 px-4 text-muted-foreground">{r.start_date} → {r.end_date}</td>
                          <td className="py-2.5 px-4 max-w-[200px] truncate text-muted-foreground">{r.reason}</td>
                          <td className="py-2.5 px-4">
                            <span className={'badge ' + (isApproved ? 'badge-success' : isDeclined ? 'badge-danger' : 'badge-warning')}>
                              {isApproved ? 'Approved' : isDeclined ? 'Declined' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <div className="inline-flex gap-1.5">
                              <button
                                className="btn btn-primary py-1 px-2 text-xs"
                                disabled={isApproved}
                                onClick={() => handleApprove(r.id, name)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </button>
                              <button
                                className="btn btn-ghost py-1 px-2 text-xs text-rose-600"
                                disabled={isDeclined}
                                onClick={() => handleDecline(r.id, name)}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
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
        </div>

        

{/* Real-time Attendance & Time Tracking */}
<div>
  <div className="flex items-center justify-between mb-2">
    <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      Live Workforce Attendance & Time Tracking
    </div>
    <div className="flex items-center gap-3">
<Link to="/host/hr/attendance" className="text-xs text-primary font-semibold hover:underline">
  Live Command Center (Teams View) ↗
</Link>
      <Link to="/host/hr/timesheets" className="text-xs text-muted-foreground hover:underline">
        Timesheets Register →
      </Link>
    </div>
  </div>
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <StatCard label="Clocked In" value={attendanceRecords.filter(r => r.status === 'Clocked In' || r.status === 'Present').length} color="var(--success)" sub="Active right now" />
    <StatCard label="On Break" value={attendanceRecords.filter(r => r.status === 'On Break').length} color="var(--warning)" sub="Temporary pause" />
    <StatCard label="Clocked Out" value={attendanceRecords.filter(r => r.status === 'Clocked Out').length} sub="Shift completed" />
    <StatCard label="On Leave / Absent" value={attendanceRecords.filter(r => r.status === 'On Leave' || r.status === 'Absent').length} color="var(--danger)" sub="Unavailable" />
  </div>
</div>

{/* Recruitment & Learning Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase text-muted-foreground">Recruitment Funnel</div>
              <Link to="/host/hr/recruitment" className="text-xs text-primary font-semibold hover:underline">
                View Jobs →
              </Link>
            </div>
            <BarChart data={[
              { label: 'Applied', value: 115 },
              { label: 'Screen', value: 62 },
              { label: 'Interview', value: 28 },
              { label: 'Offer', value: 9 },
              { label: 'Hire', value: 5 }
            ]} height={180} />
          </div>

          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase text-muted-foreground">Learning & Development</div>
              <Link to="/host/hr/training" className="text-xs text-primary font-semibold hover:underline">
                Course Catalog →
              </Link>
            </div>
            <BarChart data={trainingCompletion} height={180} color="#16a34a" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
