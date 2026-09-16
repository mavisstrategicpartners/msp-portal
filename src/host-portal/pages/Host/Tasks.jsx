import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import KanbanBoard from '../../components/KanbanBoard.jsx'
import { seedTasks, seedProjects, seedLearners, TASK_STATUSES, PROJECT_PRIORITIES } from '../../data/mockData.js'
import { useLocalStorage, uid } from '../../lib/useLocalStorage.js'
import { useConfirm } from '@/components/ui/modal-context'
import { Lightbulb } from 'lucide-react'

const empty = { title: '', project_id: '', assignee_learner_id: '', status: 'To Do', priority: 'Medium', due_date: '', description: '' }
const priorityColor = (p) => p === 'Critical' ? 'var(--danger)' : p === 'High' ? 'var(--warning)' : p === 'Low' ? 'var(--text-muted)' : 'var(--brand)'
const columnAccent = (c) => c === 'Completed' ? 'var(--success)' : c === 'Review' ? 'var(--warning)' : c === 'In Progress' ? 'var(--brand)' : 'var(--text-muted)'

export default function Tasks() {
  const [tasks, setTasks] = useLocalStorage('host.tasks', seedTasks)
  const [projects] = useLocalStorage('host.projects', seedProjects)
  const [learners] = useLocalStorage('host.learners', seedLearners)
  const [q, setQ] = useState('')
  const [projectFilter, setProjectFilter] = useState('All')
  const [view, setView] = useState('board')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const confirm = useConfirm()

  const projectName = (id) => projects.find(p => p.id === id)?.name || '—'
  const learnerName = (id) => learners.find(l => l.id === id)?.full_name || '—'

  const filtered = useMemo(() => tasks.filter(t =>
    (projectFilter === 'All' || t.project_id === projectFilter) &&
    (t.title.toLowerCase().includes(q.toLowerCase()) || (t.description || '').toLowerCase().includes(q.toLowerCase()))
  ), [tasks, q, projectFilter])

  const openAdd = () => { setEditing(null); setForm({ ...empty, project_id: projects[0]?.id || '', assignee_learner_id: learners[0]?.id || '' }); setShowForm(true) }
  const openEdit = (t) => { setEditing(t.id); setForm({ ...empty, ...t }); setShowForm(true) }
  const remove = async (t) => {
    const ok = await confirm({
      title: 'Delete Task',
      description: `Are you sure you want to delete task "${t.title}"? This cannot be undone.`,
      variant: 'destructive',
      confirmText: 'Delete Task',
    })
    if (!ok) return
    setTasks(prev => prev.filter(x => x.id !== t.id))
    toast.success('Task Deleted', { description: `"${t.title}" was removed.` })
  }
  const move = (id, status) => setTasks(prev => prev.map(x => x.id === id ? { ...x, status } : x))
  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.warning('Task Title Required', { description: 'Please enter a name for the task.' })
      return
    }
    if (!form.project_id) {
      toast.warning('Project Required', { description: 'Please select an associated project.' })
      return
    }
    if (editing) {
      setTasks(prev => prev.map(x => x.id === editing ? { ...x, ...form } : x))
      toast.success('Task Updated', { description: `"${form.title}" has been updated.` })
    } else {
      setTasks(prev => [{ id: uid('T'), ...form }, ...prev])
      toast.success('Task Created', { description: `"${form.title}" has been added.` })
    }
    setShowForm(false)
  }
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const stats = [
    { label: 'Total tasks', value: tasks.length, color: 'var(--brand)' },
    { label: 'To do', value: tasks.filter(t => t.status === 'To Do').length, color: 'var(--text-muted)' },
    { label: 'In progress', value: tasks.filter(t => t.status === 'In Progress').length, color: 'var(--warning)' },
    { label: 'Review', value: tasks.filter(t => t.status === 'Review').length, color: 'var(--warning)' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, color: 'var(--success)' },
  ]

  return (
    <DashboardLayout title="Tasks">
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
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search tasks…"
            style={{ flex: 1, minWidth: 220, padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }} />
          <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} style={{ padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }}>
            <option value="All">All projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div style={{ display: 'inline-flex', border: '1px solid var(--input-border)', borderRadius: 8, overflow: 'hidden' }}>
            <button className={'btn ' + (view === 'board' ? 'btn-primary' : 'btn-ghost')} style={{ borderRadius: 0, border: 0 }} onClick={() => setView('board')}>Board</button>
            <button className={'btn ' + (view === 'list' ? 'btn-primary' : 'btn-ghost')} style={{ borderRadius: 0, border: 0 }} onClick={() => setView('list')}>List</button>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ New Task</button>
        </div>

        {view === 'board' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}><Lightbulb size={14} /> Drag any task between columns — in either direction.</div>
            <KanbanBoard columns={TASK_STATUSES} items={filtered} onMove={move} columnAccent={columnAccent}
              renderCard={(t) => (
                <div className="card" style={{ padding: 12, borderLeft: `4px solid ${priorityColor(t.priority)}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{projectName(t.project_id)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>👤 {learnerName(t.assignee_learner_id)}</div>
                  {t.due_date && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>📅 {t.due_date}</div>}
                  <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => openEdit(t)}>Edit</button>
                    <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11, color: 'var(--danger)', marginLeft: 'auto' }} onClick={() => remove(t)}>×</button>
                  </div>
                </div>
              )}
            />
          </>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 0' }}>Task</th><th>Project</th><th>Assignee</th><th>Priority</th><th>Due</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                    <td style={{ padding: '12px 0', fontWeight: 500 }}>{t.title}</td>
                    <td>{projectName(t.project_id)}</td>
                    <td>{learnerName(t.assignee_learner_id)}</td>
                    <td><span style={{ color: priorityColor(t.priority), fontWeight: 600 }}>{t.priority}</span></td>
                    <td>{t.due_date}</td>
                    <td>
                      <select value={t.status} onChange={e => move(t.id, e.target.value)} style={{ padding: '4px 6px', fontSize: 12, borderRadius: 6, border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--input-text)' }}>
                        {TASK_STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn btn-ghost" onClick={() => openEdit(t)}>Edit</button>
                      <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => remove(t)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)}
        title={editing ? 'Edit task' : 'New task'} width={640}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          <button className="btn btn-primary" type="submit" form="task-form">{editing ? 'Save' : 'Create'}</button>
        </>}>
        <form id="task-form" onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Title *</label><input required style={field} value={form.title} onChange={set('title')} /></div>
          <div><label style={labelStyle}>Project</label><select style={field} value={form.project_id} onChange={set('project_id')}>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div><label style={labelStyle}>Assignee</label><select style={field} value={form.assignee_learner_id} onChange={set('assignee_learner_id')}>{learners.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}</select></div>
          <div><label style={labelStyle}>Status</label><select style={field} value={form.status} onChange={set('status')}>{TASK_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div><label style={labelStyle}>Priority</label><select style={field} value={form.priority} onChange={set('priority')}>{PROJECT_PRIORITIES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div><label style={labelStyle}>Due date</label><input type="date" style={field} value={form.due_date} onChange={set('due_date')} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Description</label><textarea rows={3} style={field} value={form.description} onChange={set('description')} /></div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
