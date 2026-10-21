import { useState, useMemo } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedEmployees, seedAnnouncements, seedLetters, seedAudit } from '../../data/mockData.js'
import { uid } from '../../lib/useLocalStorage.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'
import { toast } from 'sonner'
import {
  Users,
  Bell,
  FileText,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Copy,
  Building2,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'

export default function HRAdmin() {
  const [tab, setTab] = useState('employees') // 'employees' | 'announcements' | 'letters' | 'popia' | 'audit'
  const [employees, setEmployees] = useSupabaseTable('hr_employees', seedEmployees)
  const [announcements, setAnnouncements] = useSupabaseTable('hr_announcements', seedAnnouncements)
  const [letters, setLetters] = useSupabaseTable('hr_letters', seedLetters)
  const [audit] = useSupabaseTable('hr_audit', seedAudit)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [empForm, setEmpForm] = useState(null)
  const [annForm, setAnnForm] = useState(null)
  const [letterModal, setLetterModal] = useState(null)

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchSearch =
        e.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (e.role || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.department || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.email || '').toLowerCase().includes(search.toLowerCase())
      if (!matchSearch) return false

      if (typeFilter !== 'All' && e.employment_type !== typeFilter) return false
      return true
    })
  }, [employees, search, typeFilter])

  const openAddEmployee = () => {
    setEmpForm({
      id: 'NEW',
      full_name: '',
      role: '',
      department: 'Operations',
      email: '',
      phone: '',
      employment_type: 'Permanent',
      join_date: new Date().toISOString().slice(0, 10),
      manager: 'Thandi Mokoena',
      gender: 'Female',
      age_band: '30-39'
    })
  }

  const openEditEmployee = (e) => {
    setEmpForm({ ...e })
  }

  const submitEmployee = (e) => {
    e.preventDefault()
    if (!empForm.full_name.trim()) {
      toast.warning('Employee name is required')
      return
    }

    if (empForm.id === 'NEW') {
      const newEmp = { ...empForm, id: uid('EMP') }
      setEmployees(prev => [newEmp, ...prev])
      toast.success('Employee Added', { description: `${empForm.full_name} has been enrolled in the directory.` })
    } else {
      setEmployees(prev => prev.map(x => (x.id === empForm.id ? empForm : x)))
      toast.success('Employee Profile Updated', { description: `Changes to ${empForm.full_name} saved.` })
    }
    setEmpForm(null)
  }

  const removeEmployee = (e) => {
    if (window.confirm(`Are you sure you want to remove ${e.full_name} from the employee directory?`)) {
      setEmployees(prev => prev.filter(x => x.id !== e.id))
      toast.info('Employee Removed', { description: `${e.full_name} was removed from records.` })
    }
  }

  const openAddAnnouncement = () => {
    setAnnForm({
      title: '',
      priority: 'General',
      body: '',
      author: 'Human Resources'
    })
  }

  const submitAnnouncement = (e) => {
    e.preventDefault()
    if (!annForm.title.trim() || !annForm.body.trim()) {
      toast.warning('Title and announcement content are required')
      return
    }

    const newAnn = {
      id: uid('AN'),
      title: annForm.title,
      body: annForm.body,
      author: annForm.author || 'Human Resources',
      priority: annForm.priority || 'General',
      posted: new Date().toISOString().slice(0, 10)
    }

    setAnnouncements(prev => [newAnn, ...prev])
    toast.success('Announcement Published', { description: 'Staff have been notified via portal bulletin.' })
    setAnnForm(null)
  }

  const openLetterGenerator = () => {
    const selected = employees[0]
    setLetterModal({
      employee: selected?.full_name || '',
      type: 'Employment Verification',
      salary: 'R 38,500.00 / month',
      date: new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }),
      recipient: 'To Whom It May Concern',
      notes: ''
    })
  }

  const generateAndSaveLetter = () => {
    if (!letterModal.employee) {
      toast.warning('Please select an employee')
      return
    }

    const newLetter = {
      id: uid('HL'),
      employee: letterModal.employee,
      type: letterModal.type,
      generated: new Date().toISOString().slice(0, 10)
    }

    setLetters(prev => [newLetter, ...prev])
    toast.success('Document Generated', { description: `${letterModal.type} ready for ${letterModal.employee}.` })
    setLetterModal(null)
  }

  const copyLetterText = () => {
    const selectedEmp = employees.find(x => x.full_name === letterModal?.employee) || employees[0]
    const text = `MAVIS STRATEGIC PARTNERS (PTY) LTD
Date: ${letterModal?.date}
Subject: ${letterModal?.type} — ${letterModal?.employee}

${letterModal?.recipient},

This letter serves to confirm that ${letterModal?.employee} is currently employed on a full-time permanent basis at Mavis Strategic Partners in the capacity of ${selectedEmp?.role || 'Staff Specialist'}, within the ${selectedEmp?.department || 'Operations'} Department.

Employment Start Date: ${selectedEmp?.join_date || '2024-01-15'}
Current Remuneration: ${letterModal?.salary}
Status: Active and in Good Standing

Please do not hesitate to contact the HR Department at hr@mavisstrategic.com should you require any further verification.

Sincerely,
Human Resources Administration
Mavis Strategic Partners`

    navigator.clipboard.writeText(text)
    toast.success('Copied to Clipboard', { description: 'Official letter text copied.' })
  }

  return (
    <DashboardLayout title="HR Administration">
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Staff Headcount</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{employees.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">Active personnel on register</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Announcements</span>
              <Bell className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{announcements.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">Published staff bulletins</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Issued HR Letters</span>
              <FileText className="h-4 w-4 text-purple-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{letters.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">Verification & confirmation docs</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">POPIA Compliance</span>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">96%</div>
            <div className="mt-1 text-xs text-muted-foreground">Audited data protection rating</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Audit Log Events</span>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{audit.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">Recorded compliance events</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-lg border border-border bg-card p-1 overflow-x-auto pb-1">
            {[
              ['employees', 'Employee Directory', employees.length],
              ['announcements', 'Announcements', announcements.length],
              ['letters', 'HR Letters', letters.length],
              ['popia', 'POPIA Compliance', '96%'],
              ['audit', 'Audit Logs', audit.length]
            ].map(([k, label, count]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  tab === k ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {tab === 'employees' && (
              <button onClick={openAddEmployee} className="btn btn-primary inline-flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                <span>Add Employee</span>
              </button>
            )}
            {tab === 'announcements' && (
              <button onClick={openAddAnnouncement} className="btn btn-primary inline-flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                <span>Post Announcement</span>
              </button>
            )}
            {tab === 'letters' && (
              <button onClick={openLetterGenerator} className="btn btn-primary inline-flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                <span>Generate HR Letter</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: EMPLOYEE DIRECTORY */}
        {tab === 'employees' && (
          <div className="space-y-4">
            <div className="card p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by employee name, role, department or email…"
                    className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    {['All', 'Permanent', 'Contract', 'Temporary'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTypeFilter(t)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                          typeFilter === t
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
                      <th className="py-3 px-4">Role & Dept</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Manager</th>
                      <th className="py-3 px-4">Join Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          No employees match your search query.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map(e => (
                        <tr key={e.id} className="transition-colors hover:bg-muted/20">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-foreground">{e.full_name}</div>
                            <div className="text-xs text-muted-foreground">{e.gender} · {e.age_band}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-foreground">{e.role}</div>
                            <div className="text-xs text-muted-foreground">{e.department}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`badge ${e.employment_type === 'Permanent' ? 'badge-info' : 'badge-warning'}`}>
                              {e.employment_type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            <div>{e.email || '—'}</div>
                            <div>{e.phone || '—'}</div>
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground">{e.manager || 'Executive'}</td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">{e.join_date}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditEmployee(e)}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeEmployee(e)}
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

        {/* TAB 2: ANNOUNCEMENTS */}
        {tab === 'announcements' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.map(a => (
                <div key={a.id} className="card p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-info">{a.priority || 'General Notice'}</span>
                      <span className="text-xs text-muted-foreground">{a.posted}</span>
                    </div>
                    <h4 className="font-bold text-base text-foreground">{a.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{a.body}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                    <span className="text-muted-foreground">Posted by: <b>{a.author}</b></span>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Delete announcement?')) {
                          setAnnouncements(prev => prev.filter(x => x.id !== a.id))
                          toast.info('Announcement deleted')
                        }
                      }}
                      className="text-rose-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: HR LETTERS */}
        {tab === 'letters' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Document Type</th>
                    <th className="py-3 px-4">Date Issued</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {letters.map(l => (
                    <tr key={l.id} className="transition-colors hover:bg-muted/20">
                      <td className="py-3 px-4 font-semibold text-foreground">{l.employee}</td>
                      <td className="py-3 px-4 text-muted-foreground">{l.type}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{l.generated}</td>
                      <td className="py-3 px-4">
                        <span className="badge badge-success">Official Issued</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setLetterModal({
                              employee: l.employee,
                              type: l.type,
                              salary: 'R 38,500.00 / month',
                              date: l.generated,
                              recipient: 'To Whom It May Concern'
                            })
                          }}
                          className="btn btn-ghost text-xs py-1 px-2.5 inline-flex items-center gap-1"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>View & Print</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: POPIA & COMPLIANCE */}
        {tab === 'popia' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Protection of Personal Information (POPIA)', status: '96% Compliant', color: 'text-emerald-600', notes: 'Information Officer registered with SA Information Regulator.' },
                { title: 'Basic Conditions of Employment Act (BCEA)', status: 'Fully Compliant', color: 'text-emerald-600', notes: 'Working hours, leave entitlements, and overtime align with statutory guidelines.' },
                { title: 'Employment Equity (EE) Statutory Reporting', status: 'Submitted', color: 'text-blue-600', notes: 'Annual EEA2 & EEA4 submitted to Department of Employment and Labour.' },
                { title: 'Skills Development Levies & WSP/ATR', status: 'Drafting 2026 Submission', color: 'text-amber-600', notes: 'Mandatory grant submission window closes 30 April.' }
              ].map(item => (
                <div key={item.title} className="card p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                    <span className={`text-xs font-bold ${item.color}`}>{item.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT TRAIL */}
        {tab === 'audit' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Record</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {audit.map(a => (
                    <tr key={a.id} className="text-xs">
                      <td className="py-3 px-4 font-mono text-muted-foreground">{a.at}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{a.actor}</td>
                      <td className="py-3 px-4 text-foreground">{a.action}</td>
                      <td className="py-3 px-4 text-muted-foreground">{a.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT EMPLOYEE */}
      {empForm && (
        <Modal
          open
          onClose={() => setEmpForm(null)}
          title={empForm.id === 'NEW' ? 'Add New Employee' : `Edit Profile — ${empForm.full_name}`}
          width={650}
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setEmpForm(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={submitEmployee}>
                Save Employee
              </button>
            </>
          }
        >
          <form onSubmit={submitEmployee} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Full Name *</label>
                <input
                  required
                  value={empForm.full_name}
                  onChange={e => setEmpForm({ ...empForm, full_name: e.target.value })}
                  placeholder="e.g. Nomvula Khumalo"
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Role / Job Title</label>
                <input
                  value={empForm.role}
                  onChange={e => setEmpForm({ ...empForm, role: e.target.value })}
                  placeholder="e.g. Senior Operations Analyst"
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Department</label>
                <input
                  value={empForm.department}
                  onChange={e => setEmpForm({ ...empForm, department: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Work Email</label>
                <input
                  type="email"
                  value={empForm.email}
                  onChange={e => setEmpForm({ ...empForm, email: e.target.value })}
                  placeholder="name@mavisstrategic.com"
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Phone Number</label>
                <input
                  value={empForm.phone}
                  onChange={e => setEmpForm({ ...empForm, phone: e.target.value })}
                  placeholder="+27 (0)82 555 1234"
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Employment Type</label>
                <select
                  value={empForm.employment_type}
                  onChange={e => setEmpForm({ ...empForm, employment_type: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Permanent</option>
                  <option>Contract</option>
                  <option>Temporary</option>
                  <option>Intern / Learner</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Direct Manager</label>
                <input
                  value={empForm.manager}
                  onChange={e => setEmpForm({ ...empForm, manager: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Join Date</label>
                <input
                  type="date"
                  value={empForm.join_date}
                  onChange={e => setEmpForm({ ...empForm, join_date: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Gender</label>
                <select
                  value={empForm.gender}
                  onChange={e => setEmpForm({ ...empForm, gender: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: POST ANNOUNCEMENT */}
      {annForm && (
        <Modal
          open
          onClose={() => setAnnForm(null)}
          title="Publish Company Announcement"
          width={550}
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setAnnForm(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={submitAnnouncement}>
                Publish
              </button>
            </>
          }
        >
          <form onSubmit={submitAnnouncement} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Title *</label>
              <input
                required
                value={annForm.title}
                onChange={e => setAnnForm({ ...annForm, title: e.target.value })}
                placeholder="e.g. Annual Strategic Offsite 2026 Logistics"
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Priority</label>
                <select
                  value={annForm.priority}
                  onChange={e => setAnnForm({ ...annForm, priority: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>General Notice</option>
                  <option>Important</option>
                  <option>Urgent</option>
                  <option>Policy Update</option>
                  <option>Celebration</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Author</label>
                <input
                  value={annForm.author}
                  onChange={e => setAnnForm({ ...annForm, author: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Announcement Body *</label>
              <textarea
                required
                rows={4}
                value={annForm.body}
                onChange={e => setAnnForm({ ...annForm, body: e.target.value })}
                placeholder="Provide clear details and next steps for team members..."
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: HR LETTER GENERATOR & PREVIEW */}
      {letterModal && (
        <Modal
          open
          onClose={() => setLetterModal(null)}
          title={`Generate Letter: ${letterModal.type}`}
          subtitle={`Prepared for: ${letterModal.employee}`}
          width={650}
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={copyLetterText}>
                <Copy className="h-4 w-4 mr-1" /> Copy Text
              </button>
              <button type="button" className="btn btn-primary" onClick={generateAndSaveLetter}>
                <Printer className="h-4 w-4 mr-1" /> Issue & Save Letter
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Employee</label>
                <select
                  value={letterModal.employee}
                  onChange={e => setLetterModal({ ...letterModal, employee: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.full_name}>{e.full_name} ({e.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Letter Type</label>
                <select
                  value={letterModal.type}
                  onChange={e => setLetterModal({ ...letterModal, type: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Employment Verification</option>
                  <option>Salary Confirmation</option>
                  <option>Letter of Good Standing</option>
                  <option>Promotion Confirmation</option>
                  <option>Written Warning Notice</option>
                </select>
              </div>
            </div>

            {/* Official Letterhead Preview */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-4 font-serif text-sm text-foreground leading-relaxed">
              <div className="border-b border-border pb-3 flex justify-between items-end">
                <div>
                  <div className="font-sans font-bold text-base tracking-wider text-primary">MAVIS STRATEGIC PARTNERS</div>
                  <div className="font-sans text-[10px] text-muted-foreground">Internal People & Culture Division</div>
                </div>
                <div className="font-sans text-xs text-muted-foreground">{letterModal.date}</div>
              </div>

              <div className="font-sans text-xs font-bold uppercase text-foreground">
                Subject: {letterModal.type} — {letterModal.employee}
              </div>

              <p>To Whom It May Concern,</p>

              <p>
                This letter serves to confirm that <b>{letterModal.employee}</b> is currently employed on a full-time permanent basis at Mavis Strategic Partners (Pty) Ltd.
              </p>

              <div className="font-sans text-xs bg-muted/30 p-3 rounded space-y-1">
                <div>Position: <b>Staff Member / Specialist</b></div>
                <div>Remuneration: <b>{letterModal.salary}</b></div>
                <div>Standing: <b>Active and in Good Standing</b></div>
              </div>

              <p>
                Please do not hesitate to contact our People Operations team should you require any further validation.
              </p>

              <div className="pt-4 font-sans text-xs text-muted-foreground">
                <div className="font-bold text-foreground">Human Resources Directorate</div>
                <div>Mavis Strategic Partners (Pty) Ltd</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
