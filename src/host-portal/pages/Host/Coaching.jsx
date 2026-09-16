import { useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedCoaching, seedLearners } from '../../data/mockData.js'
import { useLocalStorage, uid } from '../../lib/useLocalStorage.js'
import { useConfirm } from '@/components/ui/modal-context'

export default function Coaching() {
  const [notes, setNotes] = useLocalStorage('host.coaching', seedCoaching)
  const [learners] = useLocalStorage('host.learners', seedLearners)
  const [form, setForm] = useState(null)
  const confirm = useConfirm()

  const openAdd = () => setForm({ learner_id: '', date: new Date().toISOString().slice(0, 10), mentor: 'Thandi Mokoena', note: '', mood: 'Positive' })
  const submit = () => {
    if (!form.learner_id || !form.note) {
      toast.warning('Details Required', { description: 'Please pick a learner and add a coaching note.' })
      return
    }
    const l = learners.find(x => x.id === form.learner_id)
    if (form.id) {
      setNotes(prev => prev.map(n => n.id === form.id ? { ...form, learner_name: l?.full_name || '' } : n))
      toast.success('Coaching Note Updated', { description: `Note for ${l?.full_name || ''} updated.` })
    } else {
      setNotes(prev => [{ id: uid('CN'), ...form, learner_name: l?.full_name || '' }, ...prev])
      toast.success('Coaching Note Added', { description: `Note added for ${l?.full_name || ''}.` })
    }
    setForm(null)
  }
  const remove = async (n) => {
    const ok = await confirm({
      title: 'Delete Coaching Note',
      description: `Are you sure you want to delete this coaching note for "${n.learner_name}"?`,
      variant: 'destructive',
      confirmText: 'Delete Note',
    })
    if (!ok) return
    setNotes(prev => prev.filter(x => x.id !== n.id))
    toast.success('Note Deleted', { description: 'Coaching note was removed.' })
  }

  return (
    <DashboardLayout title="Coaching Notes">
      <div className="card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Coaching Note</button>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {notes.map(n => (
          <div key={n.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{n.learner_name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{n.date} · by {n.mentor}</div>
              </div>
              <span className={'badge ' + (n.mood === 'Positive' ? 'badge-success' : n.mood === 'Needs Attention' ? 'badge-warning' : 'badge-info')}>{n.mood}</span>
            </div>
            <div style={{ fontSize: 13, marginTop: 10, color: 'var(--text-secondary)' }}>{n.note}</div>
            <div style={{ marginTop: 10, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setForm(n)}>Edit</button>
              <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => remove(n)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {form && (
        <Modal open onClose={() => setForm(null)} title={form.id ? 'Edit note' : 'New coaching note'} width={520}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={submit}>Save</button>
          </>}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div><label style={labelStyle}>Learner</label>
              <select style={field} value={form.learner_id} onChange={e => setForm({ ...form, learner_id: e.target.value })}>
                <option value="">— pick —</option>
                {learners.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Date</label><input type="date" style={field} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><label style={labelStyle}>Mood</label><select style={field} value={form.mood} onChange={e => setForm({ ...form, mood: e.target.value })}><option>Positive</option><option>Neutral</option><option>Needs Attention</option></select></div>
            </div>
            <div><label style={labelStyle}>Note</label><textarea rows={4} style={field} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
