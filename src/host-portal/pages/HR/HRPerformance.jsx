import { useState, useMemo } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedEmployees } from '../../data/mockData.js'
import { uid } from '../../lib/useLocalStorage.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'
import { BarChart, Donut, StatCard } from '../../components/Chart.jsx'
import { toast } from 'sonner'
import {
  Star,
  Award,
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  Sliders,
  Sparkles,
  Users,
  Target,
  Eye,
  Edit2,
  Trash2,
  Plus
} from 'lucide-react'

const initialReviews = [
  {
    id: 'PR-1',
    employee: 'Thandi Mokoena',
    department: 'People Operations',
    period: 'Q2 2026',
    overall: 4.8,
    technical: 4.8,
    leadership: 4.9,
    teamwork: 4.7,
    values: 4.9,
    goals_met: 5,
    goals_total: 5,
    feedback: 'Outstanding leadership during team expansion. Highly praised in 360° peer reviews for cross-functional collaboration and strategic initiative.',
    pip: false,
    promotion: true,
    status: 'Completed',
    reviewer: 'Chief Executive Officer'
  },
  {
    id: 'PR-2',
    employee: 'Sipho Dlamini',
    department: 'Technical Systems',
    period: 'Q2 2026',
    overall: 4.1,
    technical: 4.6,
    leadership: 3.8,
    teamwork: 3.9,
    values: 4.2,
    goals_met: 4,
    goals_total: 5,
    feedback: 'Strong technical delivery and architecture problem solving. Communication with client stakeholders needs continued coaching.',
    pip: false,
    promotion: false,
    status: 'Completed',
    reviewer: 'Lead Architect'
  },
  {
    id: 'PR-3',
    employee: 'Karabo Mthembu',
    department: 'Client Delivery',
    period: 'Q2 2026',
    overall: 2.6,
    technical: 2.8,
    leadership: 2.4,
    teamwork: 2.9,
    values: 2.5,
    goals_met: 1,
    goals_total: 4,
    feedback: 'Attendance irregularities and missed sprint milestones. Formal PIP established with bi-weekly check-ins to monitor turnaround.',
    pip: true,
    promotion: false,
    status: 'Under Review',
    reviewer: 'Delivery Manager'
  },
  {
    id: 'PR-4',
    employee: 'Naledi Sithole',
    department: 'Sales & Marketing',
    period: 'Q2 2026',
    overall: 4.5,
    technical: 4.4,
    leadership: 4.6,
    teamwork: 4.5,
    values: 4.6,
    goals_met: 5,
    goals_total: 5,
    feedback: 'Exceeded new customer acquisition target by 135%. Strong candidate for Senior Lead Specialist.',
    pip: false,
    promotion: true,
    status: 'Completed',
    reviewer: 'Marketing Director'
  },
  {
    id: 'PR-5',
    employee: 'Bongani Nkosi',
    department: 'Operations',
    period: 'Q2 2026',
    overall: 3.8,
    technical: 3.9,
    leadership: 3.6,
    teamwork: 3.9,
    values: 3.8,
    goals_met: 3,
    goals_total: 4,
    feedback: 'Consistent reliable contributor. Shows good aptitude for automated ticketing systems and workflow enhancements.',
    pip: false,
    promotion: false,
    status: 'Completed',
    reviewer: 'Operations Lead'
  }
]

export default function HRPerformance() {
  const [reviews, setReviews] = useSupabaseTable('hr_reviews', initialReviews)
  const [cycle, setCycle] = useState('Q2 2026')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [tab, setTab] = useState('reviews') // 'reviews' | 'matrix' | 'goals'
  const [form, setForm] = useState(null)
  const [viewModal, setViewModal] = useState(null)

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchSearch =
        r.employee.toLowerCase().includes(search.toLowerCase()) ||
        (r.department || '').toLowerCase().includes(search.toLowerCase())
      if (!matchSearch) return false

      if (filterType === 'Top Performers') return r.overall >= 4.0
      if (filterType === 'On PIP') return r.pip
      if (filterType === 'Promotions') return r.promotion
      return true
    })
  }, [reviews, search, filterType])

  const avgScore = (
    reviews.reduce((acc, r) => acc + Number(r.overall || 0), 0) / (reviews.length || 1)
  ).toFixed(1)

  const topPerformers = reviews.filter(r => r.overall >= 4.0).length
  const pips = reviews.filter(r => r.pip).length
  const promotions = reviews.filter(r => r.promotion).length

  const chartData = reviews.map(r => ({
    label: r.employee.split(' ')[0],
    value: Math.round(r.overall * 20),
  }))

  const openAdd = () => {
    setForm({
      employee: seedEmployees[0]?.full_name || '',
      department: seedEmployees[0]?.department || 'Operations',
      period: cycle,
      technical: 4.0,
      leadership: 4.0,
      teamwork: 4.0,
      values: 4.0,
      overall: 4.0,
      goals_met: 4,
      goals_total: 5,
      feedback: '',
      pip: false,
      promotion: false,
      status: 'Completed',
      reviewer: 'HR Director'
    })
  }

  const openEdit = (r) => {
    setForm({ ...r })
  }

  const handleScoreChange = (key, val) => {
    if (!form) return
    const num = Math.max(1, Math.min(5, Number(val) || 1))
    const updated = { ...form, [key]: num }
    const calcOverall = (
      (Number(updated.technical || 4) +
        Number(updated.leadership || 4) +
        Number(updated.teamwork || 4) +
        Number(updated.values || 4)) / 4
    )
    setForm({ ...updated, overall: Number(calcOverall.toFixed(1)) })
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.employee.trim()) {
      toast.warning('Employee name required')
      return
    }

    if (form.id) {
      setReviews(prev => prev.map(x => (x.id === form.id ? form : x)))
      toast.success('Performance Review Updated', {
        description: `Review for ${form.employee} saved successfully.`
      })
    } else {
      const newRev = { ...form, id: uid('PR') }
      setReviews(prev => [newRev, ...prev])
      toast.success('Performance Review Logged', {
        description: `Review for ${form.employee} recorded.`
      })
    }
    setForm(null)
  }

  const remove = (r) => {
    if (window.confirm(`Are you sure you want to delete the performance review for ${r.employee}?`)) {
      setReviews(prev => prev.filter(x => x.id !== r.id))
      toast.info('Review Deleted', { description: `Removed evaluation for ${r.employee}.` })
    }
  }

  return (
    <DashboardLayout title="Performance Management">
      {/* Top Controls & Metrics */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Avg Company Score</span>
              <Award className="h-4 w-4 text-purple-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{avgScore} <span className="text-sm font-normal text-muted-foreground">/ 5.0</span></div>
            <div className="mt-1 text-xs text-emerald-600 font-medium">+0.3 vs last cycle</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Top Performers</span>
              <Star className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{topPerformers}</div>
            <div className="mt-1 text-xs text-muted-foreground">Rating 4.0 and above</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Promotions Queued</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{promotions}</div>
            <div className="mt-1 text-xs text-muted-foreground">Recommended for advancement</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Active PIPs</span>
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{pips}</div>
            <div className="mt-1 text-xs text-muted-foreground">Improvement plan in progress</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Review Cycle</span>
              <Target className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2">
              <select
                value={cycle}
                onChange={e => setCycle(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option>Q3 2026</option>
                <option>Q2 2026</option>
                <option>Q1 2026</option>
                <option>Annual 2025</option>
              </select>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Active evaluation period</div>
          </div>
        </div>

        {/* View Switcher and Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-lg border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setTab('reviews')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                tab === 'reviews' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Evaluations Register ({reviews.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('matrix')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                tab === 'matrix' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              9-Box Grid Analysis
            </button>
            <button
              type="button"
              onClick={() => setTab('goals')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                tab === 'goals' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              OKR & Goal Attainment
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openAdd}
              className="btn btn-primary inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Log Performance Review</span>
            </button>
          </div>
        </div>

        {/* TAB 1: REVIEWS REGISTER */}
        {tab === 'reviews' && (
          <div className="space-y-4">
            <div className="card p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by employee name or department…"
                    className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    {['All', 'Top Performers', 'Promotions', 'On PIP'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFilterType(t)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                          filterType === t
                            ? 'bg-secondary text-secondary-foreground font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                    <tr>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Criteria Breakdown</th>
                      <th className="py-3 px-4">Goals</th>
                      <th className="py-3 px-4">Flags</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredReviews.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          No performance evaluations match your search filter.
                        </td>
                      </tr>
                    ) : (
                      filteredReviews.map(r => (
                        <tr key={r.id} className="transition-colors hover:bg-muted/20">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-foreground">{r.employee}</div>
                            <div className="text-xs text-muted-foreground">Reviewed by {r.reviewer}</div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{r.department}</td>
                          <td className="py-3 px-4">
                            <div className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-bold bg-primary/10 text-primary">
                              <Star className="h-3 w-3 fill-current" />
                              <span>{Number(r.overall).toFixed(1)} / 5</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Tech: <b>{r.technical || 4}</b></span>
                              <span>•</span>
                              <span>Lead: <b>{r.leadership || 4}</b></span>
                              <span>•</span>
                              <span>Team: <b>{r.teamwork || 4}</b></span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-foreground">{r.goals_met}</span>
                            <span className="text-muted-foreground"> / {r.goals_total} met</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {r.pip && (
                                <span className="badge badge-danger">PIP Active</span>
                              )}
                              {r.promotion && (
                                <span className="badge badge-success">Promotion</span>
                              )}
                              {!r.pip && !r.promotion && (
                                <span className="badge badge-info">Standard</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setViewModal(r)}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEdit(r)}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => remove(r)}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-rose-600"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 9-BOX MATRIX */}
        {tab === 'matrix' && (
          <div className="space-y-4">
            <div className="card p-5">
              <div className="mb-4">
                <h3 className="text-base font-bold text-foreground">9-Box Performance vs Potential Grid</h3>
                <p className="text-xs text-muted-foreground">Evaluate workforce talent placement, succession readiness, and retention priorities.</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Row 1: High Potential */}
                <div className="rounded-lg border border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 p-3 min-h-[110px]">
                  <div className="text-xs font-bold text-purple-700 dark:text-purple-300">Enigma / Rough Diamond</div>
                  <div className="text-[10px] text-muted-foreground">Low Perf, High Potential</div>
                  <div className="mt-2 text-xs text-foreground">1 candidate identified</div>
                </div>
                <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 min-h-[110px]">
                  <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Future Leader / Growth Star</div>
                  <div className="text-[10px] text-muted-foreground">Med Perf, High Potential</div>
                  <div className="mt-2 space-y-1">
                    <span className="inline-block rounded bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.5 text-[11px] font-medium text-indigo-800 dark:text-indigo-200">Sipho Dlamini</span>
                  </div>
                </div>
                <div className="rounded-lg border border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 min-h-[110px]">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Consistent Star (HiPo)</div>
                  <div className="text-[10px] text-muted-foreground">High Perf, High Potential</div>
                  <div className="mt-2 space-y-1">
                    <span className="inline-block rounded bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-200">Thandi Mokoena</span>
                    <span className="inline-block rounded bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-200 ml-1">Naledi Sithole</span>
                  </div>
                </div>

                {/* Row 2: Medium Potential */}
                <div className="rounded-lg border border-border bg-muted/20 p-3 min-h-[110px]">
                  <div className="text-xs font-bold text-foreground">Inconsistent Contributor</div>
                  <div className="text-[10px] text-muted-foreground">Low Perf, Med Potential</div>
                  <div className="mt-2 text-xs text-muted-foreground">Needs regular check-ins</div>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 p-3 min-h-[110px]">
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-300">Core Contributor / Backbone</div>
                  <div className="text-[10px] text-muted-foreground">Med Perf, Med Potential</div>
                  <div className="mt-2">
                    <span className="inline-block rounded bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 text-[11px] font-medium text-blue-800 dark:text-blue-200">Bongani Nkosi</span>
                  </div>
                </div>
                <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 dark:bg-indigo-950/20 p-3 min-h-[110px]">
                  <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">High Impact Specialist</div>
                  <div className="text-[10px] text-muted-foreground">High Perf, Med Potential</div>
                  <div className="mt-2 text-xs text-muted-foreground">Deep domain mastery</div>
                </div>

                {/* Row 3: Low Potential */}
                <div className="rounded-lg border border-rose-300 bg-rose-50/50 dark:bg-rose-950/20 p-3 min-h-[110px]">
                  <div className="text-xs font-bold text-rose-700 dark:text-rose-300">Underperformer / PIP</div>
                  <div className="text-[10px] text-muted-foreground">Low Perf, Low Potential</div>
                  <div className="mt-2">
                    <span className="inline-block rounded bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5 text-[11px] font-medium text-rose-800 dark:text-rose-200">Karabo Mthembu</span>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3 min-h-[110px]">
                  <div className="text-xs font-bold text-foreground">Solid Professional</div>
                  <div className="text-[10px] text-muted-foreground">Med Perf, Low Potential</div>
                  <div className="mt-2 text-xs text-muted-foreground">Predictable execution</div>
                </div>
                <div className="rounded-lg border border-teal-200 bg-teal-50/40 dark:bg-teal-950/20 p-3 min-h-[110px]">
                  <div className="text-xs font-bold text-teal-700 dark:text-teal-300">Trusted Expert</div>
                  <div className="text-[10px] text-muted-foreground">High Perf, Low Potential</div>
                  <div className="mt-2 text-xs text-muted-foreground">SME role ideal</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OKR & GOALS */}
        {tab === 'goals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5 space-y-4">
              <h3 className="text-base font-bold text-foreground">Departmental OKR Progress</h3>
              <div className="space-y-3">
                {[
                  { dept: 'People & Culture', progress: 92, target: 'Roll out automated biometric clock-in' },
                  { dept: 'Technical Delivery', progress: 85, target: '99.9% uptime across managed host instances' },
                  { dept: 'Client Operations', progress: 78, target: 'Sub-4-hour SLA response on tickets' },
                  { dept: 'Sales & Growth', progress: 104, target: 'Achieve Q2 expansion MRR targets' }
                ].map(o => (
                  <div key={o.dept} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{o.dept}</span>
                      <span className={o.progress >= 100 ? 'text-emerald-600 font-bold' : 'text-foreground'}>{o.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, o.progress)}%` }} />
                    </div>
                    <div className="text-[11px] text-muted-foreground">{o.target}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-base font-bold text-foreground mb-3">Company Score Distribution</h3>
              <BarChart data={chartData} height={200} color="var(--brand)" />
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT PERFORMANCE REVIEW */}
      {form && (
        <Modal
          open
          onClose={() => setForm(null)}
          title={form.id ? `Edit Review — ${form.employee}` : 'New Performance Evaluation'}
          subtitle={`Review Period: ${form.period}`}
          width={700}
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={submit}>
                Save Evaluation
              </button>
            </>
          }
        >
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Employee Name *</label>
                <input
                  required
                  list="perf-emp-list"
                  value={form.employee}
                  onChange={e => setForm({ ...form, employee: e.target.value })}
                  placeholder="Select or enter employee name…"
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <datalist id="perf-emp-list">
                  {seedEmployees.map(e => (
                    <option key={e.id} value={e.full_name}>{e.department} - {e.role}</option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Department</label>
                <input
                  value={form.department || ''}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Review Period</label>
                <select
                  value={form.period}
                  onChange={e => setForm({ ...form, period: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Q3 2026</option>
                  <option>Q2 2026</option>
                  <option>Q1 2026</option>
                  <option>Annual 2025</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Evaluator / Lead</label>
                <input
                  value={form.reviewer || ''}
                  onChange={e => setForm({ ...form, reviewer: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Criteria Sliders */}
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Core Evaluation Criteria</span>
                <span className="text-xs font-bold text-foreground">Calculated Overall: {form.overall} / 5</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-medium">
                    <span>Technical & Delivery</span>
                    <span>{form.technical || 4}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={form.technical || 4}
                    onChange={e => handleScoreChange('technical', e.target.value)}
                    className="w-full mt-1 accent-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium">
                    <span>Leadership & Initiative</span>
                    <span>{form.leadership || 4}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={form.leadership || 4}
                    onChange={e => handleScoreChange('leadership', e.target.value)}
                    className="w-full mt-1 accent-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium">
                    <span>Teamwork & Communication</span>
                    <span>{form.teamwork || 4}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={form.teamwork || 4}
                    onChange={e => handleScoreChange('teamwork', e.target.value)}
                    className="w-full mt-1 accent-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium">
                    <span>Values & MSP Culture</span>
                    <span>{form.values || 4}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={form.values || 4}
                    onChange={e => handleScoreChange('values', e.target.value)}
                    className="w-full mt-1 accent-primary"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Goals Met</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={form.goals_met}
                  onChange={e => setForm({ ...form, goals_met: Number(e.target.value) })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Goals Total</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.goals_total}
                  onChange={e => setForm({ ...form, goals_total: Number(e.target.value) })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.pip}
                  onChange={e => setForm({ ...form, pip: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <span className={form.pip ? 'text-rose-600 font-bold' : 'text-foreground'}>Assign to Performance Improvement Plan (PIP)</span>
              </label>

              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.promotion}
                  onChange={e => setForm({ ...form, promotion: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <span className={form.promotion ? 'text-emerald-600 font-bold' : 'text-foreground'}>Recommend for Promotion</span>
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">360° Feedback & Performance Notes</label>
              <textarea
                rows={3}
                value={form.feedback || ''}
                onChange={e => setForm({ ...form, feedback: e.target.value })}
                placeholder="Key strengths, achievement highlights, areas for growth..."
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: VIEW REVIEW DETAILS */}
      {viewModal && (
        <Modal
          open
          onClose={() => setViewModal(null)}
          title={`Evaluation Report: ${viewModal.employee}`}
          subtitle={`${viewModal.department} · ${viewModal.period}`}
          width={600}
          footer={
            <button type="button" className="btn btn-primary" onClick={() => setViewModal(null)}>
              Close Report
            </button>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase">Overall Performance</div>
                <div className="text-3xl font-extrabold text-foreground">{viewModal.overall} <span className="text-sm font-normal text-muted-foreground">/ 5.0</span></div>
              </div>
              <div className="space-y-1 text-right">
                <div className="text-xs text-muted-foreground">Goals Attainment: <b>{viewModal.goals_met} of {viewModal.goals_total}</b></div>
                <div className="flex justify-end gap-1">
                  {viewModal.promotion && <span className="badge badge-success">Promotion Ready</span>}
                  {viewModal.pip && <span className="badge badge-danger">PIP Active</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded border border-border p-2.5">
                <span className="text-muted-foreground">Technical Mastery:</span>
                <span className="float-right font-bold text-foreground">{viewModal.technical || 4}/5</span>
              </div>
              <div className="rounded border border-border p-2.5">
                <span className="text-muted-foreground">Leadership:</span>
                <span className="float-right font-bold text-foreground">{viewModal.leadership || 4}/5</span>
              </div>
              <div className="rounded border border-border p-2.5">
                <span className="text-muted-foreground">Team Collaboration:</span>
                <span className="float-right font-bold text-foreground">{viewModal.teamwork || 4}/5</span>
              </div>
              <div className="rounded border border-border p-2.5">
                <span className="text-muted-foreground">Culture & Values:</span>
                <span className="float-right font-bold text-foreground">{viewModal.values || 4}/5</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Appraisal Commentary & Feedback</div>
              <p className="mt-1 rounded-lg border border-border bg-muted/20 p-3 text-sm text-foreground leading-relaxed">
                {viewModal.feedback || 'No written feedback logged for this appraisal.'}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
