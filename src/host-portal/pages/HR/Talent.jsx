import { useState, useMemo } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedTalent, seedEmployees } from '../../data/mockData.js'
import { uid } from '../../lib/useLocalStorage.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'
import { toast } from 'sonner'
import {
  Crown,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  Compass,
  CheckCircle,
  GraduationCap
} from 'lucide-react'

const initialTalent = [
  {
    id: 'T-1',
    employee: 'Thandi Mokoena',
    department: 'People Operations',
    role: 'Lead People Operations Partner',
    potential: 'High',
    readiness: 'Ready now',
    successor_for: 'Director of People & Culture',
    idp_progress: 92,
    flight_risk: 'Low',
    mentor: 'Chief Executive Officer',
    strengths: 'Strategic workforce planning, empathy, high-stakes mediation'
  },
  {
    id: 'T-2',
    employee: 'Sipho Dlamini',
    department: 'Engineering & Delivery',
    role: 'Senior Infrastructure Engineer',
    potential: 'High',
    readiness: '1-2 years',
    successor_for: 'Lead Technical Architect',
    idp_progress: 75,
    flight_risk: 'Medium',
    mentor: 'Principal Systems Architect',
    strengths: 'Cloud automation, fault-tolerant infrastructure, rapid debugging'
  },
  {
    id: 'T-3',
    employee: 'Naledi Sithole',
    department: 'Marketing & Partnerships',
    role: 'Growth Marketing Lead',
    potential: 'High',
    readiness: 'Ready now',
    successor_for: 'Head of Growth & Client Acquisition',
    idp_progress: 88,
    flight_risk: 'Low',
    mentor: 'Managing Director',
    strengths: 'Demand generation, conversion funnels, data analytics'
  },
  {
    id: 'T-4',
    employee: 'Bongani Nkosi',
    department: 'Operations',
    role: 'Operations Specialist',
    potential: 'Medium',
    readiness: '2-3 years',
    successor_for: 'Operations Delivery Manager',
    idp_progress: 60,
    flight_risk: 'Low',
    mentor: 'Thandi Mokoena',
    strengths: 'Process documentation, ticketing workflows, SLA tracking'
  },
  {
    id: 'T-5',
    employee: 'Karabo Mthembu',
    department: 'Client Delivery',
    role: 'Junior Associate',
    potential: 'Low',
    readiness: 'Not ready',
    successor_for: '',
    idp_progress: 35,
    flight_risk: 'High',
    mentor: 'Sipho Dlamini',
    strengths: 'Customer service, basic triage'
  }
]

const criticalRoles = [
  {
    title: 'Director of People & Culture',
    department: 'Executive Leadership',
    vacancyRisk: 'High',
    benchCount: 2,
    leadSuccessor: 'Thandi Mokoena',
    readiness: 'Ready now'
  },
  {
    title: 'Lead Technical Architect',
    department: 'Technology',
    vacancyRisk: 'Critical',
    benchCount: 1,
    leadSuccessor: 'Sipho Dlamini',
    readiness: '1-2 years'
  },
  {
    title: 'Head of Growth & Client Acquisition',
    department: 'Commercial',
    vacancyRisk: 'Medium',
    benchCount: 1,
    leadSuccessor: 'Naledi Sithole',
    readiness: 'Ready now'
  },
  {
    title: 'Operations Delivery Manager',
    department: 'Client Operations',
    vacancyRisk: 'Medium',
    benchCount: 2,
    leadSuccessor: 'Bongani Nkosi',
    readiness: '2-3 years'
  }
]

export default function Talent() {
  const [talent, setTalent] = useSupabaseTable('hr_talent', initialTalent)
  const [tab, setTab] = useState('pipeline') // 'pipeline' | 'directory' | 'hipo'
  const [search, setSearch] = useState('')
  const [potentialFilter, setPotentialFilter] = useState('All')
  const [form, setForm] = useState(null)

  const filteredTalent = useMemo(() => {
    return talent.filter(t => {
      const matchSearch =
        t.employee.toLowerCase().includes(search.toLowerCase()) ||
        (t.role || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.successor_for || '').toLowerCase().includes(search.toLowerCase())
      if (!matchSearch) return false

      if (potentialFilter !== 'All' && t.potential !== potentialFilter) return false
      return true
    })
  }, [talent, search, potentialFilter])

  const hipoList = talent.filter(t => t.potential === 'High')
  const avgIdp = Math.round(
    talent.reduce((s, t) => s + Number(t.idp_progress || 0), 0) / (talent.length || 1)
  )
  const readyNowCount = talent.filter(t => t.readiness === 'Ready now').length
  const highRiskCount = talent.filter(t => t.flight_risk === 'High').length

  const openAdd = () => {
    setForm({
      employee: seedEmployees[0]?.full_name || '',
      department: seedEmployees[0]?.department || 'Operations',
      role: seedEmployees[0]?.role || '',
      potential: 'High',
      readiness: '1-2 years',
      successor_for: '',
      idp_progress: 50,
      flight_risk: 'Low',
      mentor: 'Executive Team',
      strengths: ''
    })
  }

  const openEdit = (t) => {
    setForm({ ...t })
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.employee.trim()) {
      toast.warning('Employee name required')
      return
    }

    if (form.id) {
      setTalent(prev => prev.map(x => (x.id === form.id ? form : x)))
      toast.success('Talent Profile Updated', { description: `Profile for ${form.employee} saved.` })
    } else {
      const newRec = { ...form, id: uid('T') }
      setTalent(prev => [newRec, ...prev])
      toast.success('Talent Profile Created', { description: `Added ${form.employee} to talent pipeline.` })
    }
    setForm(null)
  }

  const remove = (t) => {
    if (window.confirm(`Remove ${t.employee} from the talent pipeline?`)) {
      setTalent(prev => prev.filter(x => x.id !== t.id))
      toast.info('Record Removed', { description: `${t.employee} was removed from talent tracking.` })
    }
  }

  return (
    <DashboardLayout title="Talent Management">
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">High-Potential (HiPo)</span>
              <Crown className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{hipoList.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">Top tier future leaders</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Ready-Now Successors</span>
              <UserCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{readyNowCount}</div>
            <div className="mt-1 text-xs text-muted-foreground">Prepared for immediate promotion</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Avg IDP Completion</span>
              <GraduationCap className="h-4 w-4 text-purple-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{avgIdp}%</div>
            <div className="mt-1 text-xs text-muted-foreground">Personal development milestones</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Retention Alerts</span>
              <AlertCircle className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{highRiskCount}</div>
            <div className="mt-1 text-xs text-muted-foreground">High flight-risk talent flagged</div>
          </div>
        </div>

        {/* Tab Switcher & Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-lg border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setTab('pipeline')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                tab === 'pipeline' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Succession Pipeline
            </button>
            <button
              type="button"
              onClick={() => setTab('directory')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                tab === 'directory' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Talent Directory ({talent.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('hipo')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                tab === 'hipo' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              HiPo Spotlight ({hipoList.length})
            </button>
          </div>

          <button
            onClick={openAdd}
            className="btn btn-primary inline-flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Talent Record</span>
          </button>
        </div>

        {/* TAB 1: SUCCESSION PIPELINE */}
        {tab === 'pipeline' && (
          <div className="space-y-4">
            <div className="card p-4">
              <div className="mb-3">
                <h3 className="text-base font-bold text-foreground">Critical Leadership Succession Bench</h3>
                <p className="text-xs text-muted-foreground">Identified successors for core operational roles to mitigate key-person dependency.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {criticalRoles.map((role) => (
                  <div key={role.title} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-foreground text-sm">{role.title}</div>
                        <div className="text-xs text-muted-foreground">{role.department}</div>
                      </div>
                      <span className={`badge ${role.vacancyRisk === 'Critical' ? 'badge-danger' : role.vacancyRisk === 'High' ? 'badge-warning' : 'badge-info'}`}>
                        {role.vacancyRisk} Risk
                      </span>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Primary Successor:</span>
                        <span className="font-semibold text-foreground">{role.leadSuccessor}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Succession Readiness:</span>
                        <span className="badge badge-success">{role.readiness}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Bench Depth:</span>
                        <span className="text-foreground font-medium">{role.benchCount} successor candidates mapped</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TALENT DIRECTORY */}
        {tab === 'directory' && (
          <div className="space-y-4">
            <div className="card p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search candidate name, role, successor target…"
                    className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    {['All', 'High', 'Medium', 'Low'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPotentialFilter(p)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                          potentialFilter === p
                            ? 'bg-secondary text-secondary-foreground font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {p} Potential
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
                      <th className="py-3 px-4">Current Role</th>
                      <th className="py-3 px-4">Potential</th>
                      <th className="py-3 px-4">Readiness</th>
                      <th className="py-3 px-4">Successor For</th>
                      <th className="py-3 px-4">IDP Progress</th>
                      <th className="py-3 px-4">Flight Risk</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredTalent.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-muted-foreground">
                          No talent profiles match your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredTalent.map(t => (
                        <tr key={t.id} className="transition-colors hover:bg-muted/20">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-foreground">{t.employee}</div>
                            <div className="text-xs text-muted-foreground">Mentor: {t.mentor || 'None'}</div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{t.role}</td>
                          <td className="py-3 px-4">
                            <span className={`badge ${t.potential === 'High' ? 'badge-success' : t.potential === 'Medium' ? 'badge-info' : 'badge-warning'}`}>
                              {t.potential}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs font-medium text-foreground">{t.readiness}</span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {t.successor_for || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${t.idp_progress}%` }} />
                              </div>
                              <span className="text-xs font-medium">{t.idp_progress}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`badge ${t.flight_risk === 'High' ? 'badge-danger' : t.flight_risk === 'Medium' ? 'badge-warning' : 'badge-success'}`}>
                              {t.flight_risk || 'Low'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEdit(t)}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => remove(t)}
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

        {/* TAB 3: HIPO SPOTLIGHT */}
        {tab === 'hipo' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hipoList.map(h => (
              <div key={h.id} className="card p-5 space-y-4 border-l-4 border-l-primary">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-base text-foreground">{h.employee}</h4>
                    <p className="text-xs text-muted-foreground">{h.role}</p>
                  </div>
                  <span className="badge badge-success">HiPo</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Role:</span>
                    <span className="font-semibold text-foreground">{h.successor_for || 'Executive Track'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Promotion Readiness:</span>
                    <span className="text-primary font-semibold">{h.readiness}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Executive Mentor:</span>
                    <span className="text-foreground">{h.mentor}</span>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/30 p-2.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Core Competencies: </span>
                  {h.strengths || 'Analytical rigor, proactive cross-functional leadership.'}
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Individual Development Plan (IDP)</span>
                    <span className="font-bold">{h.idp_progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${h.idp_progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT TALENT RECORD */}
      {form && (
        <Modal
          open
          onClose={() => setForm(null)}
          title={form.id ? `Edit Talent Profile — ${form.employee}` : 'New Talent Profile'}
          width={650}
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={submit}>
                Save Profile
              </button>
            </>
          }
        >
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Employee Name *</label>
                <input
                  required
                  list="talent-emp-list"
                  value={form.employee}
                  onChange={e => {
                    const emp = seedEmployees.find(x => x.full_name === e.target.value)
                    setForm({
                      ...form,
                      employee: e.target.value,
                      role: emp?.role || form.role,
                      department: emp?.department || form.department
                    })
                  }}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <datalist id="talent-emp-list">
                  {seedEmployees.map(e => (
                    <option key={e.id} value={e.full_name}>{e.role} ({e.department})</option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Current Role</label>
                <input
                  value={form.role || ''}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
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
                <label className="text-xs font-semibold text-muted-foreground uppercase">Potential Rating</label>
                <select
                  value={form.potential}
                  onChange={e => setForm({ ...form, potential: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Readiness Timeline</label>
                <select
                  value={form.readiness}
                  onChange={e => setForm({ ...form, readiness: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Ready now</option>
                  <option>1-2 years</option>
                  <option>2-3 years</option>
                  <option>Not ready</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Successor For (Role)</label>
                <input
                  value={form.successor_for || ''}
                  onChange={e => setForm({ ...form, successor_for: e.target.value })}
                  placeholder="e.g. Operations Delivery Manager"
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Flight Risk</label>
                <select
                  value={form.flight_risk || 'Low'}
                  onChange={e => setForm({ ...form, flight_risk: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">IDP Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.idp_progress}
                  onChange={e => setForm({ ...form, idp_progress: Number(e.target.value) })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Assigned Mentor</label>
                <input
                  value={form.mentor || ''}
                  onChange={e => setForm({ ...form, mentor: e.target.value })}
                  placeholder="e.g. CEO, Senior Partner"
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Key Strengths & Development Focus</label>
                <textarea
                  rows={2}
                  value={form.strengths || ''}
                  onChange={e => setForm({ ...form, strengths: e.target.value })}
                  placeholder="Strategic execution, technical certifications to attain..."
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}
