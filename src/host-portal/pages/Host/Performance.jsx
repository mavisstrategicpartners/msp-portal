import { useMemo, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedPerformance, seedLearners } from '../../data/mockData.js'
import { useLocalStorage, uid } from '../../lib/useLocalStorage.js'

function Stars({ n }) {
  return <span style={{ color: '#f59e0b' }}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
}

const emptyReview = { learner_id: '', learner_name: '', review_date: '', reviewer: 'Thandi Mokoena', technical: 3, communication: 3, teamwork: 3, attitude: 3, notes: '' }

export default function Performance() {
  const [reviews, setReviews] = useLocalStorage('host.performance', seedPerformance)
  const [learners] = useLocalStorage('host.learners', seedLearners)
  const [q, setQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyReview)
  const [learnerSearch, setLearnerSearch] = useState('')

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim()
    if (!t) return reviews
    return reviews.filter(r =>
      (r.learner_name || '').toLowerCase().includes(t) ||
      (r.reviewer || '').toLowerCase().includes(t) ||
      (r.notes || '').toLowerCase().includes(t) ||
      (r.review_date || '').includes(t)
    )
  }, [reviews, q])

  const learnerMatches = useMemo(() => {
    const t = learnerSearch.toLowerCase().trim()
    return learners.filter(l =>
      !t || l.full_name.toLowerCase().includes(t) || (l.email || '').toLowerCase().includes(t)
    ).slice(0, 8)
  }, [learners, learnerSearch])

  const openAdd = () => {
    setForm({ ...emptyReview, review_date: new Date().toISOString().slice(0, 10) })
    setLearnerSearch('')
    setShowForm(true)
  }
  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setNum = k => e => setForm(f => ({ ...f, [k]: Math.max(1, Math.min(5, Number(e.target.value) || 1)) }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.learner_name) return alert('Please pick the learner being reviewed.')
    setReviews(prev => [{ ...form, id: uid('R') }, ...prev])
    setShowForm(false)
  }

  return (
    <DashboardLayout title="Performance Reviews">
      <div className="card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15 }}>Quarterly Performance Reviews</h3>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Rate technical skill, communication, teamwork and attitude on a 5-point scale.</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔎 Search by name, email, reviewer…"
            style={{ padding: '10px 12px', width: 280, border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }} />
          <button className="btn btn-primary" onClick={openAdd}>+ New Review</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16 }}>
        {filtered.map(r => {
          const avg = ((r.technical + r.communication + r.teamwork + r.attitude) / 4).toFixed(1)
          return (
            <div key={r.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{r.learner_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reviewed {r.review_date} by {r.reviewer}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand)' }}>{avg}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avg score</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 6, marginTop: 14, fontSize: 13 }}>
                <span>Technical</span><Stars n={r.technical} />
                <span>Communication</span><Stars n={r.communication} />
                <span>Teamwork</span><Stars n={r.teamwork} />
                <span>Attitude</span><Stars n={r.attitude} />
              </div>
              {r.notes && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 12, marginBottom: 0 }}>{r.notes}</p>}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1', padding: 40 }}>No reviews match your search.</div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New performance review"
        subtitle="Search for the learner and rate each competency out of 5."
        width={640}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          <button className="btn btn-primary" type="submit" form="review-form">Save review</button>
        </>}>
        <form id="review-form" onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={labelStyle}>Learner *</label>
            <input placeholder="Search learner by name or email…" style={field} value={learnerSearch} onChange={e => { setLearnerSearch(e.target.value); setForm(f => ({ ...f, learner_id: '', learner_name: '' })) }} />
            {learnerSearch && !form.learner_id && (
              <div style={{ maxHeight: 180, overflow: 'auto', border: '1px solid var(--border-color)', borderRadius: 8, marginTop: 6, background: 'var(--bg-primary)' }}>
                {learnerMatches.length === 0 && <div style={{ padding: 10, fontSize: 12, color: 'var(--text-muted)' }}>No learners match.</div>}
                {learnerMatches.map(l => (
                  <button type="button" key={l.id} onClick={() => { setForm(f => ({ ...f, learner_id: l.id, learner_name: l.full_name })); setLearnerSearch(l.full_name) }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', background: 'transparent', border: 0, borderTop: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{l.full_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.email} · {l.program}</div>
                  </button>
                ))}
              </div>
            )}
            {form.learner_id && <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 4 }}>✓ Selected: {form.learner_name}</div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            <div><label style={labelStyle}>Review date</label><input type="date" style={field} value={form.review_date} onChange={setF('review_date')} /></div>
            <div><label style={labelStyle}>Reviewer</label><input style={field} value={form.reviewer} onChange={setF('reviewer')} /></div>
            <div><label style={labelStyle}>Technical (1–5)</label><input type="number" min="1" max="5" style={field} value={form.technical} onChange={setNum('technical')} /></div>
            <div><label style={labelStyle}>Communication (1–5)</label><input type="number" min="1" max="5" style={field} value={form.communication} onChange={setNum('communication')} /></div>
            <div><label style={labelStyle}>Teamwork (1–5)</label><input type="number" min="1" max="5" style={field} value={form.teamwork} onChange={setNum('teamwork')} /></div>
            <div><label style={labelStyle}>Attitude (1–5)</label><input type="number" min="1" max="5" style={field} value={form.attitude} onChange={setNum('attitude')} /></div>
          </div>
          <div><label style={labelStyle}>Notes</label><textarea rows={3} style={field} value={form.notes} onChange={setF('notes')} /></div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
