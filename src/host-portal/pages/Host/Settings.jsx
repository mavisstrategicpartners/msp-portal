import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import { hostProfile, seedLearners } from '../../data/mockData.js'
import { useLocalStorage } from '../../lib/useLocalStorage.js'

const field = { display: 'block', width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)', fontSize: 13 }
const label = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }

export default function Settings() {
  const [profile, setProfile] = useLocalStorage('host.company_profile', hostProfile)
  const [learners] = useLocalStorage('host.learners', seedLearners)
  const [draft, setDraft] = useState(profile)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  const placed = learners.length
  const set = k => e => setDraft({ ...draft, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    setErr('')
    const capacity = Number(draft.learner_capacity) || 0
    if (capacity < placed) {
      setErr(`Learner capacity cannot be less than the current number of placed learners (${placed}). Please enter ${placed} or more.`)
      return
    }
    // Force current_placements to reflect live count
    const next = { ...draft, learner_capacity: capacity, current_placements: placed }
    setProfile(next); setDraft(next)
    setSaved(true); setTimeout(() => setSaved(false), 2200)
  }

  return (
    <DashboardLayout title="Host Settings">
      <form onSubmit={submit} className="card" style={{ maxWidth: 820 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>Company Profile</h3>
        <p style={{ margin: '0 0 18px', fontSize: 12, color: 'var(--text-muted)' }}>These settings are stored in your browser and used across the whole app.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <div><label style={label}>Company Name</label><input style={field} value={draft.company_name || ''} onChange={set('company_name')} /></div>
          <div><label style={label}>Industry</label><input style={field} value={draft.industry || ''} onChange={set('industry')} /></div>
          <div><label style={label}>Contact Person</label><input style={field} value={draft.contact_person || ''} onChange={set('contact_person')} /></div>
          <div><label style={label}>Email</label><input style={field} value={draft.email || ''} onChange={set('email')} /></div>
          <div><label style={label}>Phone</label><input style={field} value={draft.phone || ''} onChange={set('phone')} /></div>
          <div><label style={label}>B-BBEE Level</label><input style={field} value={draft.bbbee_level || ''} onChange={set('bbbee_level')} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={label}>Physical Address</label><input style={field} value={draft.address || ''} onChange={set('address')} /></div>
          <div>
            <label style={label}>Learner Capacity</label>
            <input style={field} type="number" min={placed} value={draft.learner_capacity || 0} onChange={set('learner_capacity')} />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Minimum {placed} (current placements).</div>
          </div>
          <div>
            <label style={label}>Current Placements</label>
            <input style={{ ...field, opacity: 0.7, cursor: 'not-allowed' }} type="number" value={placed} readOnly />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Auto-pulled from Placed Learners.</div>
          </div>
        </div>
        {err && <div style={{ marginTop: 14, padding: '10px 12px', borderLeft: '4px solid var(--danger)', background: 'var(--danger-soft, #fee2e2)', color: 'var(--danger)', fontSize: 13, borderRadius: 6 }}>{err}</div>}
        <div style={{ marginTop: 22, display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="submit" className="btn btn-primary">Save changes</button>
          <button type="button" className="btn btn-ghost" onClick={() => setDraft(profile)}>Reset</button>
          {saved && <span style={{ color: 'var(--success)', fontSize: 13 }}>✓ Settings saved locally</span>}
        </div>
      </form>
    </DashboardLayout>
  )
}
