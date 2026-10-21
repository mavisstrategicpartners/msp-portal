import { useState, useMemo } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedTraining, seedEmployees } from '../../data/mockData.js'
import { uid } from '../../lib/useLocalStorage.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'
import { toast } from 'sonner'
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react'

const initialCourses = [
  {
    id: 'TR-1',
    title: 'MSP Security & POPIA Compliance 2026',
    category: 'Compliance',
    provider: 'MSP Internal Legal',
    mode: 'Online',
    duration: '2h',
    enrolled: 42,
    completed: 39,
    deadline: '2026-11-30',
    mandatory: true
  },
  {
    id: 'TR-2',
    title: 'Cloud Infrastructure & High Availability SRE',
    category: 'Technical',
    provider: 'AWS / Cloud Academy',
    mode: 'Hybrid',
    duration: '16h',
    enrolled: 18,
    completed: 14,
    deadline: '2026-12-15',
    mandatory: false
  },
  {
    id: 'TR-3',
    title: 'Executive Client Communication & Escalations',
    category: 'Leadership',
    provider: 'Dale Carnegie Leadership',
    mode: 'Classroom',
    duration: '8h',
    enrolled: 12,
    completed: 10,
    deadline: '2026-10-25',
    mandatory: false
  },
  {
    id: 'TR-4',
    title: 'Workplace Ethics & BCEA Labor Standards',
    category: 'Compliance',
    provider: 'SA Labour Institute',
    mode: 'Online',
    duration: '3h',
    enrolled: 54,
    completed: 51,
    deadline: '2026-10-31',
    mandatory: true
  },
  {
    id: 'TR-5',
    title: 'Modern Front-End Systems & Design Systems',
    category: 'Technical',
    provider: 'Internal Engineering Team',
    mode: 'Online',
    duration: '10h',
    enrolled: 15,
    completed: 11,
    deadline: '2026-12-01',
    mandatory: false
  }
]

const initialEnrollments = [
  { id: 'EN-1', employee: 'Thandi Mokoena', course: 'MSP Security & POPIA Compliance 2026', progress: 100, score: 96, status: 'Completed', certified: true, date: '2026-09-12' },
  { id: 'EN-2', employee: 'Sipho Dlamini', course: 'Cloud Infrastructure & High Availability SRE', progress: 85, score: 88, status: 'In Progress', certified: false, date: '2026-09-15' },
  { id: 'EN-3', employee: 'Naledi Sithole', course: 'Executive Client Communication & Escalations', progress: 100, score: 94, status: 'Completed', certified: true, date: '2026-09-20' },
  { id: 'EN-4', employee: 'Bongani Nkosi', course: 'Workplace Ethics & BCEA Labor Standards', progress: 100, score: 90, status: 'Completed', certified: true, date: '2026-09-18' },
  { id: 'EN-5', employee: 'Karabo Mthembu', course: 'MSP Security & POPIA Compliance 2026', progress: 40, score: 62, status: 'In Progress', certified: false, date: '2026-09-22' }
]

export default function Training() {
  const [courses, setCourses] = useSupabaseTable('hr_training', initialCourses)
  const [enrollments, setEnrollments] = useState(initialEnrollments)
  const [tab, setTab] = useState('courses') // 'courses' | 'enrollments'
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [courseModal, setCourseModal] = useState(null)
  const [enrollModal, setEnrollModal] = useState(null)

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.provider || '').toLowerCase().includes(search.toLowerCase())
      if (!matchSearch) return false

      if (catFilter !== 'All' && c.category !== catFilter) return false
      return true
    })
  }, [courses, search, catFilter])

  const totalEnrolled = courses.reduce((s, c) => s + Number(c.enrolled || 0), 0)
  const totalCompleted = courses.reduce((s, c) => s + Number(c.completed || 0), 0)
  const overallRate = totalEnrolled ? Math.round((totalCompleted / totalEnrolled) * 100) : 0
  const mandatoryCount = courses.filter(c => c.mandatory).length

  const openAddCourse = () => {
    setCourseModal({
      title: '',
      category: 'Technical',
      provider: 'Internal MSP Academy',
      mode: 'Online',
      duration: '4h',
      enrolled: 0,
      completed: 0,
      deadline: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      mandatory: false
    })
  }

  const openEditCourse = (c) => {
    setCourseModal({ ...c })
  }

  const submitCourse = (e) => {
    e.preventDefault()
    if (!courseModal.title.trim()) {
      toast.warning('Course title is required')
      return
    }

    if (courseModal.id) {
      setCourses(prev => prev.map(x => (x.id === courseModal.id ? courseModal : x)))
      toast.success('Course Updated', { description: `${courseModal.title} saved successfully.` })
    } else {
      const newCourse = { ...courseModal, id: uid('TR') }
      setCourses(prev => [newCourse, ...prev])
      toast.success('Course Published', { description: `${courseModal.title} is now available in catalog.` })
    }
    setCourseModal(null)
  }

  const removeCourse = (c) => {
    if (window.confirm(`Delete course "${c.title}"?`)) {
      setCourses(prev => prev.filter(x => x.id !== c.id))
      toast.info('Course Deleted', { description: `Removed ${c.title}.` })
    }
  }

  const submitEnrollment = (e) => {
    e.preventDefault()
    if (!enrollModal.employee.trim() || !enrollModal.course.trim()) {
      toast.warning('Please select employee and course')
      return
    }

    const newEn = {
      id: uid('EN'),
      employee: enrollModal.employee,
      course: enrollModal.course,
      progress: 0,
      score: 0,
      status: 'In Progress',
      certified: false,
      date: new Date().toISOString().slice(0, 10)
    }

    setEnrollments(prev => [newEn, ...prev])
    setCourses(prev => prev.map(c => c.title === enrollModal.course ? { ...c, enrolled: Number(c.enrolled || 0) + 1 } : c))
    toast.success('Enrollment Confirmed', { description: `${enrollModal.employee} enrolled in ${enrollModal.course}.` })
    setEnrollModal(null)
  }

  const markCompleted = (en) => {
    setEnrollments(prev => prev.map(x => x.id === en.id ? { ...x, progress: 100, score: Math.max(85, x.score || 85), status: 'Completed', certified: true } : x))
    setCourses(prev => prev.map(c => c.title === en.course ? { ...c, completed: Number(c.completed || 0) + 1 } : c))
    toast.success('Certification Awarded', { description: `${en.employee} has completed ${en.course}.` })
  }

  return (
    <DashboardLayout title="Training & Development">
      <div className="space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Active Programs</span>
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{courses.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">{mandatoryCount} mandatory compliance modules</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Enrollments</span>
              <GraduationCap className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{totalEnrolled}</div>
            <div className="mt-1 text-xs text-muted-foreground">Active learner & employee seats</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Certifications Awarded</span>
              <Award className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalCompleted}</div>
            <div className="mt-1 text-xs text-muted-foreground">Successfully verified passes</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Completion Rate</span>
              <CheckCircle2 className="h-4 w-4 text-purple-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{overallRate}%</div>
            <div className="mt-1 text-xs text-emerald-600 font-medium">Above enterprise benchmark (75%)</div>
          </div>
        </div>

        {/* Tab Switcher & Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-lg border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setTab('courses')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                tab === 'courses' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Course Catalog & Modules ({courses.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('enrollments')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                tab === 'enrollments' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Staff Progress & Certifications ({enrollments.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEnrollModal({ employee: seedEmployees[0]?.full_name || '', course: courses[0]?.title || '' })}
              className="btn btn-ghost inline-flex items-center gap-1.5"
            >
              <UserCheck className="h-4 w-4" />
              <span>Enroll Staff</span>
            </button>
            <button
              onClick={openAddCourse}
              className="btn btn-primary inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Course</span>
            </button>
          </div>
        </div>

        {/* TAB 1: COURSE CATALOG */}
        {tab === 'courses' && (
          <div className="space-y-4">
            <div className="card p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by course title or provider…"
                    className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    {['All', 'Technical', 'Compliance', 'Leadership'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCatFilter(c)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                          catFilter === c
                            ? 'bg-secondary text-secondary-foreground font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map(c => {
                const completionRate = c.enrolled ? Math.round((c.completed / c.enrolled) * 100) : 0
                return (
                  <div key={c.id} className="card p-5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`badge ${c.category === 'Compliance' ? 'badge-warning' : c.category === 'Technical' ? 'badge-purple' : 'badge-info'}`}>
                          {c.category}
                        </span>
                        {c.mandatory && (
                          <span className="badge badge-danger text-[9px]">Mandatory</span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-foreground leading-snug line-clamp-2">
                        {c.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">Provider: {c.provider}</p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-border/60">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Mode:</span>{' '}
                          <span className="font-semibold text-foreground">{c.mode}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>{' '}
                          <span className="font-semibold text-foreground">{c.duration}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Deadline:</span>{' '}
                          <span className="font-semibold text-foreground">{c.deadline}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Completion ({c.completed}/{c.enrolled})</span>
                          <span className="font-bold text-foreground">{completionRate}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${completionRate}%` }} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setEnrollModal({ employee: seedEmployees[0]?.full_name || '', course: c.title })}
                          className="btn btn-ghost text-xs py-1 px-2.5"
                        >
                          Enroll
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditCourse(c)}
                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Edit course"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCourse(c)}
                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-rose-600"
                            title="Delete course"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ENROLLMENTS TRACKER */}
        {tab === 'enrollments' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Course Enrolled</th>
                    <th className="py-3 px-4">Enrolled Date</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {enrollments.map(en => (
                    <tr key={en.id} className="transition-colors hover:bg-muted/20">
                      <td className="py-3 px-4 font-semibold text-foreground">{en.employee}</td>
                      <td className="py-3 px-4 text-muted-foreground">{en.course}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{en.date}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${en.progress}%` }} />
                          </div>
                          <span className="text-xs font-medium">{en.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {en.score ? `${en.score}%` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${en.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                          {en.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {en.status !== 'Completed' ? (
                          <button
                            type="button"
                            onClick={() => markCompleted(en)}
                            className="btn btn-primary text-xs py-1 px-2.5 inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Mark Passed</span>
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                            <Award className="h-3.5 w-3.5" /> Certified
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT COURSE */}
      {courseModal && (
        <Modal
          open
          onClose={() => setCourseModal(null)}
          title={courseModal.id ? 'Edit Training Course' : 'Create Training Course'}
          width={600}
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setCourseModal(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={submitCourse}>
                Save Course
              </button>
            </>
          }
        >
          <form onSubmit={submitCourse} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Course Title *</label>
              <input
                required
                value={courseModal.title}
                onChange={e => setCourseModal({ ...courseModal, title: e.target.value })}
                placeholder="e.g. AWS Cloud Solutions Architect Professional"
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
                <select
                  value={courseModal.category}
                  onChange={e => setCourseModal({ ...courseModal, category: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Technical</option>
                  <option>Compliance</option>
                  <option>Leadership</option>
                  <option>Soft Skills</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Delivery Mode</label>
                <select
                  value={courseModal.mode}
                  onChange={e => setCourseModal({ ...courseModal, mode: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option>Online</option>
                  <option>Classroom</option>
                  <option>Hybrid</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Provider / Institution</label>
                <input
                  value={courseModal.provider || ''}
                  onChange={e => setCourseModal({ ...courseModal, provider: e.target.value })}
                  placeholder="e.g. Coursera, Internal Team"
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Duration (Hours)</label>
                <input
                  value={courseModal.duration || ''}
                  onChange={e => setCourseModal({ ...courseModal, duration: e.target.value })}
                  placeholder="e.g. 6h, 20h"
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Completion Deadline</label>
                <input
                  type="date"
                  value={courseModal.deadline || ''}
                  onChange={e => setCourseModal({ ...courseModal, deadline: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={courseModal.mandatory}
                    onChange={e => setCourseModal({ ...courseModal, mandatory: e.target.checked })}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <span>Mandatory Compliance Requirement</span>
                </label>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: ENROLL EMPLOYEE */}
      {enrollModal && (
        <Modal
          open
          onClose={() => setEnrollModal(null)}
          title="Enroll Team Member in Course"
          width={500}
          footer={
            <>
              <button type="button" className="btn btn-ghost" onClick={() => setEnrollModal(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={submitEnrollment}>
                Confirm Enrollment
              </button>
            </>
          }
        >
          <form onSubmit={submitEnrollment} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Select Employee</label>
              <select
                value={enrollModal.employee}
                onChange={e => setEnrollModal({ ...enrollModal, employee: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {seedEmployees.map(e => (
                  <option key={e.id} value={e.full_name}>{e.full_name} ({e.department})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Select Course</label>
              <select
                value={enrollModal.course}
                onChange={e => setEnrollModal({ ...enrollModal, course: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.title}>{c.title} ({c.category})</option>
                ))}
              </select>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}
