import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import KanbanBoard from '../../components/KanbanBoard.jsx'
import { seedProjects, seedLearners, seedTasks, PROJECT_STATUSES, PROJECT_PRIORITIES } from '../../data/mockData.js'
import { useLocalStorage, uid } from '../../lib/useLocalStorage.js'
import { useConfirm } from '@/components/ui/modal-context'
import { Lightbulb } from 'lucide-react'

const empty = { name: '', client: '', description: '', status: 'To Do', priority: 'Medium', start_date: '', end_date: '', lead: '', assigned_learner_ids: [] }

const columnAccent = (c) => c === 'Completed' ? 'var(--success)' : c === 'Review' ? 'var(--warning)' : c === 'In Progress' ? 'var(--brand)' : 'var(--text-muted)'
const priorityColor = (p) => p === 'Critical' ? 'var(--danger)' : p === 'High' ? 'var(--warning)' : p === 'Low' ? 'var(--text-muted)' : 'var(--brand)'

export default function Projects() {
  const [projects, setProjects] = useLocalStorage('host.projects', seedProjects)
  const [learners] = useLocalStorage('host.learners', seedLearners)
  const [tasks] = useLocalStorage('host.tasks', seedTasks)
  const [q, setQ] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const confirm = useConfirm()

  const filtered = useMemo(() => projects.filter(p =>
    (priorityFilter === 'All' || p.priority === priorityFilter) &&
    (p.name.toLowerCase().includes(q.toLowerCase()) || (p.client || '').toLowerCase().includes(q.toLowerCase()))
  ), [projects, q, priorityFilter])

  const learnerName = (id) => learners.find(l => l.id === id)?.full_name || id
  const openAdd = () => { setEditing(null); setForm({ ...empty, start_date: new Date().toISOString().slice(0, 10) }); setShowForm(true) }
  const openEdit = (p) => { setEditing(p.id); setForm({ ...empty, ...p, assigned_learner_ids: p.assigned_learner_ids || [] }); setShowForm(true) }
  const remove = async (p) => {
    const ok = await confirm({
      title: 'Delete Project',
      description: `Are you sure you want to delete project "${p.name}"? This action cannot be undone.`,
      variant: 'destructive',
      confirmText: 'Delete Project',
    })
    if (!ok) return
    setProjects(prev => prev.filter(x => x.id !== p.id))
    toast.success('Project Deleted', { description: `"${p.name}" was removed.` })
  }
  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.warning('Project Name Required', { description: 'Please enter a name for the project.' })
      return
    }
    if (editing) {
      setProjects(prev => prev.map(x => x.id === editing ? { ...x, ...form } : x))
      toast.success('Project Updated', { description: `"${form.name}" has been updated.` })
    } else {
      setProjects(prev => [{ id: uid('P'), ...form }, ...prev])
      toast.success('Project Created', { description: `"${form.name}" has been added.` })
    }
    setShowForm(false)
  }
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const toggleLearner = (id) => setForm(f => ({
    ...f, assigned_learner_ids: (f.assigned_learner_ids || []).includes(id)
      ? f.assigned_learner_ids.filter(x => x !== id)
      : [...(f.assigned_learner_ids || []), id],
  }))

  const move = (id, status) => setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p))

  const stats = [
    { label: 'Total projects', value: projects.length, color: 'var(--brand)' },
    { label: 'In progress', value: projects.filter(p => p.status === 'In Progress').length, color: 'var(--warning)' },
    { label: 'Review', value: projects.filter(p => p.status === 'Review').length, color: 'var(--warning)' },
    { label: 'Completed', value: projects.filter(p => p.status === 'Completed').length, color: 'var(--success)' },
    { label: 'Assigned learners', value: new Set(projects.flatMap(p => p.assigned_learner_ids || [])).size, color: 'var(--text-primary)' },
  ]

  return (
    <DashboardLayout title="Projects">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 18 }}>
        {stats.map(s => (
          <div key={s.label} className="card">
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search projects…"
            style={{ flex: 1, minWidth: 240, padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }} />
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }}>
            {['All', ...PROJECT_PRIORITIES].map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openAdd}>+ New Project</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}><Lightbulb size={14} /> Drag any project card into a different column to change its status — in any direction.</div>

        <KanbanBoard
          columns={PROJECT_STATUSES}
          items={filtered}
          onMove={move}
          columnAccent={columnAccent}
          renderCard={(p) => {
            const projectTasks = tasks.filter(t => t.project_id === p.id)
            return (
              <div className="card" style={{ padding: 14, borderLeft: `4px solid ${priorityColor(p.priority)}` }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.client}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '8px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  <span className="chip">👤 {p.lead}</span>
                  <span className="chip">Priority: {p.priority}</span>
                  <span className="chip">{(p.assigned_learner_ids || []).length} learners</span>
                  <span className="chip">✓ {projectTasks.filter(t => t.status === 'Completed').length}/{projectTasks.length} tasks</span>
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => openEdit(p)}>Edit</button>
                  <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11, color: 'var(--danger)', marginLeft: 'auto' }} onClick={() => remove(p)}>Delete</button>
                </div>
              </div>
            )
          }}
        />
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)}
        title={editing ? 'Edit project' : 'New project'} width={720}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          <button className="btn btn-primary" type="submit" form="proj-form">{editing ? 'Save' : 'Create'}</button>
        </>}>
        <form id="proj-form" onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Project name *</label><input required style={field} value={form.name} onChange={set('name')} /></div>
          <div><label style={labelStyle}>Client</label><input style={field} value={form.client} onChange={set('client')} /></div>
          <div><label style={labelStyle}>Lead</label><input style={field} value={form.lead} onChange={set('lead')} /></div>
          <div><label style={labelStyle}>Status</label><select style={field} value={form.status} onChange={set('status')}>{PROJECT_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div><label style={labelStyle}>Priority</label><select style={field} value={form.priority} onChange={set('priority')}>{PROJECT_PRIORITIES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div><label style={labelStyle}>Start</label><input type="date" style={field} value={form.start_date} onChange={set('start_date')} /></div>
          <div><label style={labelStyle}>End</label><input type="date" style={field} value={form.end_date} onChange={set('end_date')} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Description</label><textarea rows={3} style={field} value={form.description} onChange={set('description')} /></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Assign learners</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 140, overflow: 'auto', padding: 4 }}>
              {learners.map(l => {
                const on = (form.assigned_learner_ids || []).includes(l.id)
                return (
                  <button type="button" key={l.id} onClick={() => toggleLearner(l.id)}
                    className={'chip'} style={{ cursor: 'pointer', border: on ? '1px solid var(--brand)' : '1px solid var(--border-color)', background: on ? 'var(--brand-soft)' : 'var(--bg-secondary)', color: on ? 'var(--brand)' : 'var(--text-secondary)' }}>
                    {on ? '✓ ' : ''}{l.full_name}
                  </button>
                )
              })}
            </div>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
