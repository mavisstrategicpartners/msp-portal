import { useMemo, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedVacancies, seedApplicants, VACANCY_TYPES, HOST_COMPANY } from '../../data/mockData.js'
import { useLocalStorage, uid } from '../../lib/useLocalStorage.js'
import { useNotifications } from '../../context/NotificationContext.jsx'

const empty = { title: '', department: '', type: 'Full-time', location: '', posted: '', closes: '', applicants: 0, status: 'Open', salary: '', description: '', requirements: [], tags: [] }

const typeColor = (t) => t === 'Leanership' ? 'var(--purple)' : t === 'Intern' ? 'var(--warning)' : t === 'Contract' ? 'var(--brand)' : 'var(--success)'

export default function Recruitment() {
  const [tab, setTab] = useState('vacancies')
  const [vacancies, setVacancies] = useLocalStorage('host.hr.vacancies', seedVacancies)
  const [applicants, setApplicants] = useLocalStorage('host.hr.applicants', seedApplicants)
  const [q, setQ] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [viewing, setViewing] = useState(null)
  const [form, setForm] = useState(null)
  const [applicantForm, setApplicantForm] = useState(null)
  const { push } = useNotifications()

  const filtered = useMemo(() => vacancies.filter(v =>
    (typeFilter === 'All' || v.type === typeFilter) &&
    (v.title.toLowerCase().includes(q.toLowerCase()) || (v.department || '').toLowerCase().includes(q.toLowerCase()) || (v.tags || []).some(t => t.toLowerCase().includes(q.toLowerCase())))
  ), [vacancies, q, typeFilter])

  const openAdd = () => setForm({ ...empty, posted: new Date().toISOString().slice(0, 10) })
  const openEdit = (v) => setForm({ ...empty, ...v })
  const submitVacancy = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return alert('Title is required')
    const clean = { ...form, requirements: typeof form.requirements === 'string' ? form.requirements.split('\n').filter(Boolean) : form.requirements, tags: typeof form.tags === 'string' ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : form.tags }
    if (form.id) setVacancies(prev => prev.map(x => x.id === form.id ? clean : x))
    else { setVacancies(prev => [{ id: uid('V'), ...clean }, ...prev]); push({ title: 'New vacancy posted', body: form.title, link: '/hr/recruitment', kind: 'recruit' }) }
    setForm(null)
  }
  const remove = (v) => { if (window.confirm('Delete vacancy?')) setVacancies(prev => prev.filter(x => x.id !== v.id)) }

  const submitApplicant = (e) => {
    e.preventDefault()
    if (applicantForm.id) setApplicants(prev => prev.map(x => x.id === applicantForm.id ? applicantForm : x))
    else setApplicants(prev => [{ id: uid('A'), ...applicantForm }, ...prev])
    setApplicantForm(null)
  }

  return (
    <DashboardLayout title="Recruitment & Selection">
      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className={'btn ' + (tab === 'vacancies' ? 'btn-primary' : 'btn-ghost')} onClick={() => setTab('vacancies')}>Vacancies ({vacancies.length})</button>
        <button className={'btn ' + (tab === 'applicants' ? 'btn-primary' : 'btn-ghost')} onClick={() => setTab('applicants')}>Applicants ({applicants.length})</button>
        {tab === 'vacancies' && <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={openAdd}>+ Post Vacancy</button>}
        {tab === 'applicants' && <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setApplicantForm({ name: '', vacancy: vacancies[0]?.title || '', stage: 'Screening', score: 0, applied: new Date().toISOString().slice(0, 10) })}>+ Add Applicant</button>}
      </div>

      {tab === 'vacancies' && (
        <>
          <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search jobs, tags, department…"
              style={{ flex: 1, minWidth: 240, padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }} />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              style={{ padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }}>
              {['All', ...VACANCY_TYPES].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Job cards — SA Youth / PNet style */}
          <div style={{ display: 'grid', gap: 12 }}>
            {filtered.map(v => (
              <div key={v.id} className="card" style={{ padding: 18, borderLeft: `4px solid ${typeColor(v.type)}` }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--purple-soft)', color: 'var(--purple)', display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 700 }}>{HOST_COMPANY[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800 }}>{v.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{HOST_COMPANY} · {v.department}</div>
                      </div>
                      <span className={'badge ' + (v.status === 'Open' ? 'badge-success' : v.status === 'Closed' ? 'badge-danger' : 'badge-warning')}>{v.status}</span>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span className="chip" style={{ color: typeColor(v.type), borderColor: typeColor(v.type) }}>{v.type}</span>
                      <span className="chip">📍 {v.location}</span>
                      {v.salary && <span className="chip">💰 {v.salary}</span>}
                      <span className="chip">{v.applicants} applicants</span>
                      {v.closes && <span className="chip">⏰ Closes {v.closes}</span>}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '10px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{v.description}</p>
                    <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(v.tags || []).map(t => <span key={t} className="badge badge-info">{t}</span>)}
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary" onClick={() => setViewing(v)}>View job</button>
                      <button className="btn btn-ghost" onClick={() => openEdit(v)}>Edit</button>
                      <button className="btn btn-ghost" style={{ color: 'var(--danger)', marginLeft: 'auto' }} onClick={() => remove(v)}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'applicants' && (
        <div className="card">
          <table>
            <thead><tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 0' }}>Name</th><th>Vacancy</th><th>Stage</th><th>Score</th><th>Applied</th><th></th></tr></thead>
            <tbody>
              {applicants.map(a => (
                <tr key={a.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                  <td style={{ padding: '10px 0', fontWeight: 600 }}>{a.name}</td>
                  <td>{a.vacancy}</td>
                  <td><span className="badge badge-info">{a.stage}</span></td>
                  <td>{a.score}</td>
                  <td>{a.applied}</td>
                  <td>
                    <button className="btn btn-ghost" onClick={() => setApplicantForm(a)}>Edit</button>
                    <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setApplicants(prev => prev.filter(x => x.id !== a.id))}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <Modal open onClose={() => setViewing(null)} title={viewing.title} subtitle={`${HOST_COMPANY} · ${viewing.department} · ${viewing.location}`} width={720}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setViewing(null)}>Close</button>
            <button className="btn btn-primary" onClick={() => alert('Applicants can apply from the public careers portal.')}>Share job link</button>
          </>}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            <span className="chip" style={{ color: typeColor(viewing.type), borderColor: typeColor(viewing.type) }}>{viewing.type}</span>
            <span className="chip">💰 {viewing.salary}</span>
            <span className="chip">⏰ Closes {viewing.closes}</span>
            <span className="chip">{viewing.applicants} applicants</span>
          </div>
          <div style={{ fontSize: 13, marginBottom: 14 }}><b>About the role</b><p style={{ marginTop: 4, color: 'var(--text-secondary)' }}>{viewing.description}</p></div>
          <div style={{ fontSize: 13 }}><b>Requirements</b>
            <ul style={{ marginTop: 4, paddingLeft: 18, color: 'var(--text-secondary)' }}>{(viewing.requirements || []).map(r => <li key={r}>{r}</li>)}</ul>
          </div>
          <div style={{ marginTop: 12 }}>{(viewing.tags || []).map(t => <span key={t} className="badge badge-info" style={{ marginRight: 4 }}>{t}</span>)}</div>
        </Modal>
      )}

      {form && (
        <Modal open onClose={() => setForm(null)} title={form.id ? 'Edit vacancy' : 'Post vacancy'} width={720}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button>
            <button className="btn btn-primary" type="submit" form="vac-form">Save</button>
          </>}>
          <form id="vac-form" onSubmit={submitVacancy} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Job title *</label><input required style={field} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><label style={labelStyle}>Department</label><input style={field} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
            <div><label style={labelStyle}>Type</label>
              <select style={field} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>{VACANCY_TYPES.map(t => <option key={t}>{t}</option>)}</select>
            </div>
            <div><label style={labelStyle}>Location</label><input style={field} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
            <div><label style={labelStyle}>Salary</label><input style={field} value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} /></div>
            <div><label style={labelStyle}>Posted</label><input type="date" style={field} value={form.posted} onChange={e => setForm({ ...form, posted: e.target.value })} /></div>
            <div><label style={labelStyle}>Closes</label><input type="date" style={field} value={form.closes} onChange={e => setForm({ ...form, closes: e.target.value })} /></div>
            <div><label style={labelStyle}>Status</label><select style={field} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option>Open</option><option>Interviewing</option><option>Closed</option></select></div>
            <div><label style={labelStyle}>Applicants</label><input type="number" style={field} value={form.applicants} onChange={e => setForm({ ...form, applicants: Number(e.target.value) })} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Description</label><textarea rows={3} style={field} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Requirements (one per line)</label><textarea rows={3} style={field} value={Array.isArray(form.requirements) ? form.requirements.join('\n') : form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Tags (comma-separated)</label><input style={field} value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
          </form>
        </Modal>
      )}

      {applicantForm && (
        <Modal open onClose={() => setApplicantForm(null)} title={applicantForm.id ? 'Edit applicant' : 'Add applicant'} width={520}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setApplicantForm(null)}>Cancel</button>
            <button className="btn btn-primary" type="submit" form="app-form">Save</button>
          </>}>
          <form id="app-form" onSubmit={submitApplicant} style={{ display: 'grid', gap: 12 }}>
            <input placeholder="Full name" style={field} value={applicantForm.name} onChange={e => setApplicantForm({ ...applicantForm, name: e.target.value })} required />
            <select style={field} value={applicantForm.vacancy} onChange={e => setApplicantForm({ ...applicantForm, vacancy: e.target.value })}>
              {vacancies.map(v => <option key={v.id}>{v.title}</option>)}
            </select>
            <select style={field} value={applicantForm.stage} onChange={e => setApplicantForm({ ...applicantForm, stage: e.target.value })}>
              <option>Screening</option><option>Interview</option><option>Assessment</option><option>Offer</option><option>Rejected</option>
            </select>
            <input type="number" placeholder="Score" style={field} value={applicantForm.score} onChange={e => setApplicantForm({ ...applicantForm, score: Number(e.target.value) })} />
            <input type="date" style={field} value={applicantForm.applied} onChange={e => setApplicantForm({ ...applicantForm, applied: e.target.value })} />
          </form>
        </Modal>
      )}
    </DashboardLayout>
  )
}
