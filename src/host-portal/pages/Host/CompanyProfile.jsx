import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import { hostProfile as seed, seedLearners } from '../../data/mockData.js'
import { useLocalStorage } from '../../lib/useLocalStorage.js'
import { Link } from 'react-router-dom'

export default function CompanyProfile() {
  const [profile, setProfile] = useLocalStorage('host.company_profile', seed)
  const [learners] = useLocalStorage('host.learners', seedLearners)
  const [tab, setTab] = useState('overview')
  const [draft, setDraft] = useState(profile)
  const [savedFlash, setSavedFlash] = useState(false)
  // Backfill departments/programs for profiles saved in earlier versions.
  useEffect(() => {
    setProfile(p => {
      const patch = {}
      if (!Array.isArray(p.departments) || p.departments.length === 0) patch.departments = seed.departments
      if (!Array.isArray(p.programs) || p.programs.length === 0) patch.programs = seed.programs
      return Object.keys(patch).length ? { ...p, ...patch } : p
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => { setDraft(profile) }, [profile.company_name, profile.contact_person, profile.email, profile.phone, profile.industry])
  // keep draft in sync when profile changes elsewhere
  const setDraftField = k => e => setDraft(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const saveProfile = () => { setProfile(draft); setSavedFlash(true); setTimeout(() => setSavedFlash(false), 2400) }

  const set = k => e => { setProfile(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })); setDraft(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })) }

  return (
    <DashboardLayout title="My Company Profile">
      <div className="card" style={{ marginBottom: 16, background: 'var(--bg-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{profile.company_name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{profile.industry} · {profile.address}</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
              <span className="badge badge-info">BBBEE {profile.bbbee_level}</span>
              <span className="badge badge-success">{profile.approval_status}</span>
              <span className="badge badge-purple">Reg {profile.registration_number}</span>
            </div>
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 999, border: '1px solid var(--border-color)' }}>
            <input type="checkbox" checked={profile.open_to_host} onChange={set('open_to_host')} />
            <span style={{ fontWeight: 700 }}>Open to Host new learners</span>
            <span className={'badge ' + (profile.open_to_host ? 'badge-success' : 'badge-danger')}>{profile.open_to_host ? 'On' : 'Off'}</span>
          </label>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['overview','contacts','programs','learners','automation'].map(t => (
          <button key={t} className={'btn ' + (tab === t ? 'btn-primary' : 'btn-ghost')} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <div className="card">
            <h3 style={{ margin: '0 0 10px', fontSize: 15 }}>Company bio</h3>
            <textarea rows={5} value={draft.company_bio || ''} onChange={setDraftField('company_bio')}
              style={{ width: '100%', padding: 12, border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)', fontSize: 13 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginTop: 14 }}>
              {[['Address','address'],['Industry','industry'],['Sector','sector'],['Website','website'],['Company size','employees'],['Years operating','years_operating'],['Footprint','footprint']].map(([label, k]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                  <input value={draft[k] || ''} onChange={setDraftField(k)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)', fontSize: 13 }} />
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 style={{ margin: '0 0 10px', fontSize: 15 }}>Learner capacity</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Learners needed this intake</div>
                <input type="number" value={draft.learners_requested || 0} onChange={setDraftField('learners_requested')} style={{ width: 120, padding: '8px 10px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Departments</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {profile.departments.map(d => <span key={d} className="chip">{d}</span>)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Currently placed</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{learners.length} <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>of {profile.learner_capacity}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(tab === 'overview' || tab === 'contacts') && (
        <div className="card" style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
          {savedFlash && <span style={{ color: 'var(--success)', fontSize: 13 }}>✓ Changes saved</span>}
          <button className="btn btn-ghost" onClick={() => setDraft(profile)}>Discard</button>
          <button className="btn btn-primary" onClick={saveProfile}>Save changes</button>
        </div>
      )}

      {tab === 'contacts' && (
        <div className="card">
          <h3 style={{ margin: '0 0 10px', fontSize: 15 }}>Manager details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[['Full name','contact_person'],['Title','contact_title'],['Email','email'],['Alt email','alt_email'],['Phone','phone']].map(([label, k]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                <input value={draft[k] || ''} onChange={setDraftField(k)} style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)', fontSize: 13 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'programs' && (
        <ProgramsAndDepartments profile={profile} setProfile={setProfile} />
      )}

      {tab === 'learners' && (
        <div className="card">
          <h3 style={{ margin: '0 0 10px', fontSize: 15 }}>Learners in your workspace</h3>
          <table>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 0' }}>Name</th><th>Program</th><th>Education</th><th>Experience</th><th></th>
              </tr>
            </thead>
            <tbody>
              {learners.slice(0, 10).map(l => (
                <tr key={l.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                  <td style={{ padding: '10px 0', fontWeight: 600 }}>{l.full_name}</td>
                  <td>{l.program}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{(l.qualifications || [])[0] || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{l.experience || '—'}</td>
                  <td><Link className="btn btn-ghost" to="/host/learners">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'automation' && (
        <div style={{ display: 'grid', gap: 12 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Quarterly manager reports</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Managers will be prompted to submit a report every quarter.</div>
              </div>
              <span className="badge badge-success">Auto-prompt enabled</span>
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Weekly timesheet approvals</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Every Friday managers must confirm timesheet accuracy for each learner (Approve / Not Approved).</div>
              </div>
              <span className="badge badge-success">Auto-prompt enabled</span>
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Task monitoring</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Live dashboard tracks task progress across all assigned learners.</div>
              </div>
              <Link className="btn btn-ghost" to="/host/tasks">Open Tasks →</Link>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}


function ProgramsAndDepartments({ profile, setProfile }) {
  const departments = Array.isArray(profile.departments) ? profile.departments : []
  const programs = Array.isArray(profile.programs) ? profile.programs : []
  const [newDept, setNewDept] = useState('')
  const [newProg, setNewProg] = useState('')

  const addDept = () => {
    const v = newDept.trim(); if (!v) return
    if (departments.includes(v)) return alert('Department already exists')
    setProfile(p => ({ ...p, departments: [...(p.departments || []), v] }))
    setNewDept('')
  }
  const removeDept = (d) => {
    if (!window.confirm(`Remove department "${d}"?`)) return
    setProfile(p => ({ ...p, departments: (p.departments || []).filter(x => x !== d) }))
  }
  const editDept = (d) => {
    const v = window.prompt('Rename department', d)
    if (!v || !v.trim() || v === d) return
    const nv = v.trim()
    if (departments.includes(nv)) return alert('Department already exists')
    setProfile(p => ({ ...p, departments: (p.departments || []).map(x => x === d ? nv : x) }))
  }
  const addProg = () => {
    const v = newProg.trim(); if (!v) return
    if (programs.includes(v)) return alert('Program already exists')
    setProfile(p => ({ ...p, programs: [...(p.programs || []), v] }))
    setNewProg('')
  }
  const removeProg = (pr) => {
    if (!window.confirm(`Remove program "${pr}"?`)) return
    setProfile(p => ({ ...p, programs: (p.programs || []).filter(x => x !== pr) }))
  }
  const editProg = (pr) => {
    const v = window.prompt('Rename program', pr)
    if (!v || !v.trim() || v === pr) return
    const nv = v.trim()
    if (programs.includes(nv)) return alert('Program already exists')
    setProfile(p => ({ ...p, programs: (p.programs || []).map(x => x === pr ? nv : x) }))
  }

  const inputStyle = { flex: 1, padding: '8px 10px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)', fontSize: 13 }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
      <div className="card">
        <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>Departments</h3>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Company departments hosting learners.</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input placeholder="e.g. Marketing" value={newDept} onChange={e => setNewDept(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDept())} style={inputStyle} />
          <button className="btn btn-primary" onClick={addDept}>+ Add</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {departments.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No departments yet.</div>}
          {departments.map(d => (
            <span key={d} className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {d}
              <button onClick={() => editDept(d)} title="Rename" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontSize: 12, padding: 0 }}>✎</button>
              <button onClick={() => removeDept(d)} title="Remove" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontWeight: 700, padding: 0 }}>×</button>
            </span>
          ))}
        </div>
      </div>
      <div className="card">
        <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>Programs offered</h3>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Only these programs will be available when onboarding a learner.</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input placeholder="e.g. Robotics NQF5" value={newProg} onChange={e => setNewProg(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addProg())} style={inputStyle} />
          <button className="btn btn-primary" onClick={addProg}>+ Add</button>
        </div>
        <div style={{ display: 'grid', gap: 6 }}>
          {programs.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No programs yet.</div>}
          {programs.map(pr => (
            <div key={pr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-secondary)', fontSize: 13 }}>
              <span>{pr}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => editProg(pr)} className="btn btn-ghost" style={{ color: 'var(--brand)' }}>Edit</button>
                <button onClick={() => removeProg(pr)} className="btn btn-ghost" style={{ color: 'var(--danger)' }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
