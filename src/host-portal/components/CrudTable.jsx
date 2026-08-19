import { useMemo, useState } from 'react'
import DashboardLayout from './DashboardLayout.jsx'
import Modal, { field, labelStyle } from './Modal.jsx'
import { useLocalStorage, uid } from '../lib/useLocalStorage.js'

/**
 * Generic CRUD table used by HR pages.
 * fields: [{ key, label, type: 'text'|'number'|'date'|'textarea'|'select', options?, required? }]
 * summary(list) => optional array of { label, value, color }
 */
export default function CrudTable({
  title, storageKey, seed, fields, columns, prefix = 'row',
  emptyValues, summary, statusColors = {}, extraActions,
}) {
  const [list, setList] = useLocalStorage(storageKey, seed)
  const [q, setQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyValues)

  const filtered = useMemo(() => {
    const s = q.toLowerCase()
    return list.filter(row => Object.values(row).join(' ').toLowerCase().includes(s))
  }, [list, q])

  const openAdd = () => { setEditing(null); setForm(emptyValues); setShowForm(true) }
  const openEdit = (r) => { setEditing(r.id); setForm({ ...emptyValues, ...r }); setShowForm(true) }
  const remove = (r) => { if (window.confirm('Delete this record?')) setList(prev => prev.filter(x => x.id !== r.id)) }

  const submit = (e) => {
    e.preventDefault()
    const missing = fields.find(f => f.required && !String(form[f.key] ?? '').trim())
    if (missing) return alert(`${missing.label} is required`)
    if (editing) setList(prev => prev.map(x => x.id === editing ? { ...x, ...form } : x))
    else setList(prev => [{ id: uid(prefix), ...form }, ...prev])
    setShowForm(false)
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))

  const sums = summary ? summary(list) : null

  return (
    <DashboardLayout title={title}>
      {sums && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 18 }}>
          {sums.map((s, i) => (
            <div key={i} className="card">
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color || 'var(--text-primary)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
            style={{ flex: 1, minWidth: 240, padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }} />
          {extraActions}
          <button className="btn btn-primary" onClick={openAdd}>+ Add</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {columns.map(c => <th key={c.key} style={{ padding: '10px 12px 10px 0' }}>{c.label}</th>)}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                  {columns.map(c => (
                    <td key={c.key} style={{ padding: '12px 12px 12px 0', color: 'var(--text-secondary)' }}>
                      {c.key === 'status' && statusColors[r[c.key]]
                        ? <span className={'badge ' + statusColors[r[c.key]]}>{r[c.key]}</span>
                        : (c.render ? c.render(r) : (r[c.key] ?? '—'))}
                    </td>
                  ))}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-ghost" onClick={() => openEdit(r)}>Edit</button>
                    <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => remove(r)}>Delete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={columns.length + 1} style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>No records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)}
        title={editing ? 'Edit record' : 'Add record'} width={640}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          <button className="btn btn-primary" type="submit" form="crud-form">{editing ? 'Save' : 'Create'}</button>
        </>}>
        <form id="crud-form" onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {fields.map(f => (
            <div key={f.key} style={{ gridColumn: f.full ? '1 / -1' : 'auto' }}>
              <label style={labelStyle}>{f.label}{f.required ? ' *' : ''}</label>
              {f.type === 'select' ? (
                <select style={field} value={form[f.key] ?? ''} onChange={set(f.key)}>
                  {(f.options || []).map(o => <option key={o}>{o}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea rows={3} style={{ ...field, resize: 'vertical' }} value={form[f.key] ?? ''} onChange={set(f.key)} />
              ) : (
                <input type={f.type || 'text'} style={field} value={form[f.key] ?? ''} onChange={set(f.key)} />
              )}
            </div>
          ))}
        </form>
      </Modal>
    </DashboardLayout>
  )
}
