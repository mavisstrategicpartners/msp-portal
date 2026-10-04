import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedOnboarding, seedLearners, hostProfile, HOST_COMPANY } from '../../data/mockData.js'
import { useLocalStorage, uid } from '../../lib/useLocalStorage.js'
import { useNotifications } from '../../context/NotificationContext.jsx'

const DEFAULT_TASKS = [
  'Site Induction',
  'Health & Safety Briefing',
  'IT Equipment Issued',
  'Email & Slack Access',
  'Mentor Assigned',
  'First Project Brief',
  'Probation Review',
]

const emptyForm = {
  full_name: '', email: '', phone: '', alternate_phone: '',
  citizenship: 'SA Citizen', id_number: '', passport_number: '',
  address: '',
  qualification: '', year_completed: '', institution: '',
  disability: false, disability_nature: '',
  program: '', start_date: '', end_date: '',
  mentor: '', bio: '',
}

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i))

// Little red asterisk for required labels
const Req = () => <span style={{ color: 'var(--danger, #dc2626)', marginLeft: 3 }}>*</span>

export default function Onboarding() {
  const [data, setData] = useLocalStorage('host.onboarding', seedOnboarding)
  const [placed, setPlaced] = useLocalStorage('host.learners', seedLearners)
  const [profile] = useLocalStorage('host.company_profile', hostProfile)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [flash, setFlash] = useState(null)
  const [programQuery, setProgramQuery] = useState('')
  const { push } = useNotifications()

  const availablePrograms = Array.isArray(profile.programs) && profile.programs.length
    ? profile.programs
    : ['Software Development NQF5','Data Analytics NQF5','Cloud Engineering NQF6','Cybersecurity NQF5','UX/UI Design NQF5']

  const capacity = Number(profile.learner_capacity) || 25
  const atCapacity = placed.length >= capacity

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const matchingPrograms = useMemo(() => {
    const q = programQuery.trim().toLowerCase()
    if (!q) return availablePrograms
    return availablePrograms.filter(p => p.toLowerCase().includes(q))
  }, [programQuery, availablePrograms])

  const openAdd = () => {
    if (atCapacity) {
      setFlash({ tone: 'error', msg: `Learner capacity reached (${placed.length}/${capacity}). Can't onboard a learner right now — increase capacity in Settings first.` })
      return
    }
    setForm({ ...emptyForm, program: availablePrograms[0] || '', start_date: new Date().toISOString().slice(0, 10) })
    setProgramQuery('')
    setShowForm(true)
  }

  const submit = (e) => {
    e.preventDefault()
    if (atCapacity) {
      toast.error('Capacity Limit Reached', { description: `Learner capacity reached (${placed.length}/${capacity}). Cannot onboard right now.` })
      return
    }
    // Required-field validation
    const requiredMsg = (label) => {
      toast.warning(`${label} Required`, { description: `Please provide a valid ${label.toLowerCase()}.` })
    }
    if (!form.full_name.trim()) return requiredMsg('Full name')
    if (!form.email.trim()) return requiredMsg('Email')
    if (!form.phone.trim()) return requiredMsg('Phone')
    if (form.citizenship === 'SA Citizen' && !form.id_number.trim()) return requiredMsg('SA ID number')
    if (form.citizenship === 'Foreign' && !form.passport_number.trim()) return requiredMsg('Passport number')
    if (!form.address.trim()) return requiredMsg('Address')
    if (!form.qualification.trim()) return requiredMsg('Qualification')
    if (!form.program || !availablePrograms.includes(form.program)) {
      toast.warning('Program Required', { description: 'Please choose a program from the available list.' })
      return
    }
    if (!form.start_date) return requiredMsg('Start date')
    if (!form.end_date) return requiredMsg('End date')
    if (form.end_date < form.start_date) {
      toast.warning('Invalid Date Range', { description: 'End date must be on or after the start date.' })
      return
    }
    if (form.disability && !form.disability_nature.trim()) return requiredMsg('Nature of disability')

    const tasks = DEFAULT_TASKS.map(name => ({ name, done: false }))
    const newRow = {
      learner_id: uid('OB'),
      learner_name: form.full_name.trim(),
      program: form.program,
      started: form.start_date,
      tasks, progress: 0,
      _meta: {
        email: form.email, phone: form.phone, alternate_phone: form.alternate_phone,
        citizenship: form.citizenship, id_number: form.id_number, passport_number: form.passport_number,
        address: form.address,
        qualification: form.qualification, year_completed: form.year_completed, institution: form.institution,
        disability: form.disability, disability_nature: form.disability_nature,
        mentor: form.mentor, bio: form.bio,
        end_date: form.end_date,
        company: HOST_COMPANY,
      },
    }
    setData(d => [newRow, ...d])
    setShowForm(false)
    toast.success('Intern Added to Onboarding', { description: `${newRow.learner_name} has been enrolled.` })
    setFlash({ tone: 'success', msg: `${newRow.learner_name} added to onboarding.` })
    push({ title: 'New onboarding started', body: `${newRow.learner_name} was added to the onboarding queue.`, link: '/host/onboarding', kind: 'reminder' })
  }

  const toggle = (li, ti) => {
    setData(d => {
      let migrate = null
      const next = d.map((row, i) => {
        if (i !== li) return row
        const tasks = row.tasks.map((t, j) => j === ti ? { ...t, done: !t.done } : t)
        const done = tasks.filter(t => t.done).length
        const progress = Math.round((done / tasks.length) * 100)
        if (progress === 100) migrate = { ...row, tasks, progress }
        return { ...row, tasks, progress }
      })
      if (migrate) {
        const meta = migrate._meta || {}
        const placedRow = {
          id: uid('L'),
          full_name: migrate.learner_name,
          email: meta.email || '',
          phone: meta.phone || '',
          alternate_phone: meta.alternate_phone || '',
          program: migrate.program,
          company: meta.company || HOST_COMPANY,
          mentor: meta.mentor || '',
          start_date: migrate.started,
          end_date: meta.end_date || '',
          status: 'Active',
          attendance_rate: 100,
          performance_score: 0,
          progress: 100,
          bio: meta.bio || '',
          skills: [],
          qualifications: meta.qualification ? [`${meta.qualification}${meta.year_completed ? ' (' + meta.year_completed + ')' : ''}${meta.institution ? ' — ' + meta.institution : ''}`] : [],
          citizenship: meta.citizenship,
          id_number: meta.id_number,
          passport_number: meta.passport_number,
          address: meta.address,
          disability: meta.disability ? (meta.disability_nature || 'Yes') : null,
          onboarded: true,
        }
        setPlaced(prev => [placedRow, ...prev])
        push({ title: 'Onboarding complete', body: `${migrate.learner_name} moved to placed interns.`, link: '/host/learners', kind: 'reminder' })
        return next.filter(r => r.learner_id !== migrate.learner_id)
      }
      return next
    })
  }

  return (
    <DashboardLayout title="Onboarding Progress">
      <div className="card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {data.length} learner(s) currently being onboarded. Complete all onboarding tasks (100%) to automatically move a learner to <b>placed interns</b>.
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Placement capacity: <b>{placed.length}</b> / {capacity}
          </div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Intern</button>
      </div>

      {flash && (
        <div className="card" style={{
          marginBottom: 16,
          borderLeft: `4px solid ${flash.tone === 'error' ? 'var(--danger)' : 'var(--success)'}`,
          background: flash.tone === 'error' ? 'var(--danger-soft, #fee2e2)' : 'var(--success-soft, #dcfce7)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13 }}>{flash.msg}</span>
            <button className="btn btn-ghost" onClick={() => setFlash(null)}>✕</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 14 }}>
        {data.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
            No learners are being onboarded right now. Click <b>+ Add Intern</b> to start.
          </div>
        )}
        {data.map((row, li) => (
          <div key={row.learner_id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{row.learner_name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.program} · Started {row.started}</div>
              </div>
              <div style={{ minWidth: 200 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textAlign: 'right' }}>{row.progress}% complete</div>
                <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 999 }}>
                  <div style={{ width: row.progress + '%', height: '100%', background: row.progress === 100 ? 'var(--success)' : 'var(--brand)', borderRadius: 999, transition: 'width .25s' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 8 }}>
              {row.tasks.map((t, ti) => (
                <label key={ti} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  border: '1px solid var(--border-color)', borderRadius: 8,
                  background: t.done ? 'var(--success-soft)' : 'var(--bg-secondary)',
                  cursor: 'pointer', fontSize: 13, color: t.done ? 'var(--success)' : 'var(--text-primary)',
                }}>
                  <input type="checkbox" checked={t.done} onChange={() => toggle(li, ti)} />
                  <span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.name}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)}
        title="Onboard new learner"
        subtitle={`Host company: ${HOST_COMPANY} — fields marked with a red star are required.`}
        width={760}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          <button className="btn btn-primary" type="submit" form="onboard-form">Start Onboarding</button>
        </>}>
        <form id="onboard-form" onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

          <div style={{ gridColumn: '1 / -1', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>Personal details</div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Full Name<Req /></label>
            <input required style={field} value={form.full_name} onChange={set('full_name')} />
          </div>
          <div>
            <label style={labelStyle}>Email<Req /></label>
            <input required type="email" style={field} value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label style={labelStyle}>Phone<Req /></label>
            <input required style={field} value={form.phone} onChange={set('phone')} placeholder="+27 ..." />
          </div>
          <div>
            <label style={labelStyle}>Alternate phone <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(if we can't reach you)</span></label>
            <input style={field} value={form.alternate_phone} onChange={set('alternate_phone')} placeholder="Optional" />
          </div>
          <div>
            <label style={labelStyle}>Address<Req /></label>
            <input required style={field} value={form.address} onChange={set('address')} placeholder="Street, suburb, city" />
          </div>

          <div style={{ gridColumn: '1 / -1', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 }}>Citizenship</div>

          <div>
            <label style={labelStyle}>Citizenship<Req /></label>
            <select style={field} value={form.citizenship} onChange={set('citizenship')}>
              <option>SA Citizen</option>
              <option>Foreign</option>
            </select>
          </div>
          {form.citizenship === 'SA Citizen' ? (
            <div>
              <label style={labelStyle}>SA ID number<Req /></label>
              <input required style={field} value={form.id_number} onChange={set('id_number')} placeholder="13-digit ID" maxLength={13} />
            </div>
          ) : (
            <div>
              <label style={labelStyle}>Passport number<Req /></label>
              <input required style={field} value={form.passport_number} onChange={set('passport_number')} />
            </div>
          )}

          <div style={{ gridColumn: '1 / -1', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 }}>Education</div>

          <div>
            <label style={labelStyle}>Qualification<Req /></label>
            <input required style={field} value={form.qualification} onChange={set('qualification')} placeholder="e.g. Matric, Diploma in IT" />
          </div>
          <div>
            <label style={labelStyle}>Year completed</label>
            <select style={field} value={form.year_completed} onChange={set('year_completed')}>
              <option value="">Select year…</option>
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Institution</label>
            <input style={field} value={form.institution} onChange={set('institution')} placeholder="e.g. University of Johannesburg" />
          </div>

          <div style={{ gridColumn: '1 / -1', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 }}>Placement</div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Program<Req /> <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 11 }}>(only programs your company offers)</span></label>
            <input
              list="program-options"
              required
              style={field}
              value={form.program}
              onChange={(e) => { setForm(f => ({ ...f, program: e.target.value })); setProgramQuery(e.target.value) }}
              placeholder="Start typing to search…"
            />
            <datalist id="program-options">
              {matchingPrograms.map(p => <option key={p} value={p} />)}
            </datalist>
            {form.program && !availablePrograms.includes(form.program) && (
              <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>
                Not an available program. Pick one from the list — or add it in Company Profile → Programs.
              </div>
            )}
          </div>
          <div>
            <label style={labelStyle}>Start date<Req /></label>
            <input required type="date" style={field} value={form.start_date} onChange={set('start_date')} />
          </div>
          <div>
            <label style={labelStyle}>End date<Req /></label>
            <input required type="date" style={field} value={form.end_date} onChange={set('end_date')} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Mentor</label>
            <input style={field} value={form.mentor} onChange={set('mentor')} placeholder="Optional" />
          </div>

          <div style={{ gridColumn: '1 / -1', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 }}>Accessibility</div>

          <label style={{ gridColumn: '1 / -1', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input type="checkbox" checked={!!form.disability} onChange={set('disability')} />
            Learner has a disability
          </label>
          {form.disability && (
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Nature of disability<Req /></label>
              <input required style={field} value={form.disability_nature} onChange={set('disability_nature')} placeholder="e.g. Hearing impairment, mobility, visual" />
            </div>
          )}

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Short bio <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea rows={3} style={{ ...field, resize: 'vertical' }} value={form.bio} onChange={set('bio')} />
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
