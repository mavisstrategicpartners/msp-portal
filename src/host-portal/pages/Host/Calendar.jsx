import { useMemo, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { seedCalendar } from '../../data/mockData.js'
import { useLocalStorage, uid } from '../../lib/useLocalStorage.js'
import { holidayOn } from '../../lib/holidays.js'
import { formatLongDate, formatShortDate } from '../../lib/dateUtils.js'

const EVENT_TYPES = ['Assessment', 'Induction', 'Class', 'Webinar', 'Submission', 'Review', 'Workshop', 'Meeting', 'Visit']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const toKey = raw => (raw || '').slice(0, 10)

function calendarGrid(year, monthIndex) {
  const pad = new Date(year, monthIndex, 1).getDay()
  const days = new Date(year, monthIndex + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < pad; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push({ day: d })
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

const empty = { title: '', type: 'Class', date: '', time: '', location: '', link: '', mandatory_attendance: false, description: '' }

export default function Calendar() {
  const [events, setEvents] = useLocalStorage('host.calendar', seedCalendar)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(empty)
  const [selectedDate, setSelectedDate] = useState(null)
  const [activeMonth, setActiveMonth] = useState(() => { const t = new Date(); return { year: t.getFullYear(), month: t.getMonth() } })

  const eventsByDate = useMemo(() => {
    const map = {}
    events.forEach(e => { const k = toKey(e.date); (map[k] = map[k] || []).push(e) })
    return map
  }, [events])

  const grid = calendarGrid(activeMonth.year, activeMonth.month)
  const monthLabel = new Date(activeMonth.year, activeMonth.month, 1).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
  const navMonth = (delta) => setActiveMonth(p => { const d = new Date(p.year, p.month + delta, 1); return { year: d.getFullYear(), month: d.getMonth() } })

  const openCreate = (preDate) => { setForm({ ...empty, date: preDate || new Date().toISOString().slice(0, 10) }); setEditingId(null); setShowForm(true) }
  const openEdit = (e) => { setEditingId(e.id); setForm({ ...empty, ...e, date: toKey(e.date) }); setShowForm(true) }
  const del = (e) => { if (!window.confirm(`Delete "${e.title}"?`)) return; setEvents(prev => prev.filter(x => x.id !== e.id)) }

  const submit = (ev) => {
    ev.preventDefault()
    if (!form.title.trim() || !form.date) return alert('Title and date are required.')
    if (editingId) setEvents(prev => prev.map(x => x.id === editingId ? { ...x, ...form } : x))
    else setEvents(prev => [...prev, { ...form, id: uid('E') }])
    setShowForm(false)
  }

  const set = k => e => setForm(f => ({ ...f, [k]: k === 'mandatory_attendance' ? e.target.checked : e.target.value }))

  const dayEvents = selectedDate ? (eventsByDate[selectedDate] || []) : []
  const dayHoliday = selectedDate ? holidayOn(selectedDate) : null

  return (
    <DashboardLayout title="Calendar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Events, milestones and South African public holidays</div>
        <button className="btn btn-primary" onClick={() => openCreate()}>+ Add Event</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 420px', gap: 20, alignItems: 'flex-start' }}>
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
            {selectedDate ? `Events on ${formatLongDate(selectedDate)}` : 'All upcoming events'}
            {selectedDate && <button className="btn btn-ghost" style={{ marginLeft: 10 }} onClick={() => setSelectedDate(null)}>Show all</button>}
          </div>

          {dayHoliday && (
            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', color: '#78350f', padding: '14px 16px', borderRadius: 10, marginBottom: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#78350f' }}>🇿🇦 {dayHoliday.name}</div>
              <div style={{ fontSize: 11, color: '#92400e', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 700 }}>South African Public Holiday</div>
              <div style={{ fontSize: 13, marginTop: 8, color: '#78350f', lineHeight: 1.45 }}>{dayHoliday.description}</div>
              <div style={{ fontSize: 12, marginTop: 8, color: '#92400e' }}>Date: {formatLongDate(selectedDate)}</div>
            </div>
          )}

          <div style={{ display: 'grid', gap: 10 }}>
            {(selectedDate ? dayEvents : events.slice(0, 30)).map(e => (
              <div key={e.id} style={{ border: '1px solid var(--border-color)', borderLeft: '4px solid var(--brand)', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{e.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {e.type} • {formatShortDate(toKey(e.date))}{e.time ? ` • ${e.time}` : ''}
                    </div>
                    {e.location && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>📍 {e.location}</div>}
                    {e.link && <a href={e.link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 6, fontSize: 12, color: 'var(--brand)', fontWeight: 600 }}>Open meeting link →</a>}
                    {e.mandatory_attendance && <span className="badge badge-danger" style={{ marginLeft: e.link ? 8 : 0, marginTop: 6 }}>Mandatory</span>}
                    {e.description && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, marginBottom: 0 }}>{e.description}</p>}
                  </div>
                  <div style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-ghost" onClick={() => openEdit(e)}>Edit</button>
                    <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => del(e)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {selectedDate && dayEvents.length === 0 && !dayHoliday && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>No events on this day.</div>
            )}
            {selectedDate && dayEvents.length === 0 && dayHoliday && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 12 }}>No scheduled events — enjoy the public holiday.</div>
            )}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button className="btn btn-ghost" onClick={() => navMonth(-1)}>‹</button>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{monthLabel}</div>
            <button className="btn btn-ghost" onClick={() => navMonth(1)}>›</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 4, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 6 }}>
            {WEEKDAYS.map(w => <div key={w} style={{ fontWeight: 700 }}>{w}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 4 }}>
            {grid.map((cell, idx) => {
              if (!cell) return <div key={idx} style={{ height: 56 }} />
              const dateKey = `${activeMonth.year}-${String(activeMonth.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`
              const isHoliday = holidayOn(dateKey)
              const dayEv = eventsByDate[dateKey] || []
              const isSelected = selectedDate === dateKey
              const isToday = new Date().toISOString().slice(0, 10) === dateKey
              return (
                <button key={idx}
                  onClick={() => setSelectedDate(dateKey)}
                  onDoubleClick={() => openCreate(dateKey)}
                  title={isHoliday ? `${isHoliday.name} — ${isHoliday.description}` : 'Click to view · Double-click to add event'}
                  style={{
                    height: 56, padding: 4, borderRadius: 8,
                    border: isToday ? '2px solid var(--brand)' : '1px solid var(--border-color)',
                    background: isSelected ? 'var(--brand-soft)' : isHoliday ? 'var(--warning-soft)' : 'var(--bg-primary)',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative',
                  }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isHoliday ? '#92400e' : 'var(--text-primary)' }}>{cell.day}</span>
                  {isHoliday && <span style={{ fontSize: 8, color: '#92400e', fontWeight: 700, textAlign: 'center', lineHeight: 1.1 }}>{isHoliday.name.length > 12 ? isHoliday.name.slice(0, 10) + '…' : isHoliday.name}</span>}
                  {dayEv.length > 0 && <span style={{ width: 6, height: 6, borderRadius: 6, background: 'var(--brand)' }} />}
                </button>
              )
            })}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--warning-soft)', borderRadius: 3, marginRight: 4, verticalAlign: 'middle' }} /> Public holiday</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--brand)', borderRadius: 5, marginRight: 4, verticalAlign: 'middle' }} /> Has events</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, border: '2px solid var(--brand)', borderRadius: 3, marginRight: 4, verticalAlign: 'middle' }} /> Today</span>
          </div>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)}
        title={editingId ? 'Edit event' : 'New event'} width={640}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          <button className="btn btn-primary" type="submit" form="ev-form">{editingId ? 'Save' : 'Create'}</button>
        </>}>
        <form id="ev-form" onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Title *</label><input required style={field} value={form.title} onChange={set('title')} /></div>
          <div><label style={labelStyle}>Type</label><select style={field} value={form.type} onChange={set('type')}>{EVENT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
          <div><label style={labelStyle}>Date *</label><input required type="date" style={field} value={form.date} onChange={set('date')} /></div>
          <div><label style={labelStyle}>Time</label><input type="time" style={field} value={form.time} onChange={set('time')} /></div>
          <div><label style={labelStyle}>Location</label><input style={field} value={form.location} onChange={set('location')} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Meeting link</label><input style={field} value={form.link} onChange={set('link')} placeholder="https://…" /></div>
          <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Description</label><textarea rows={3} style={{ ...field, resize: 'vertical' }} value={form.description} onChange={set('description')} /></div>
          <label style={{ gridColumn: '1 / -1', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input type="checkbox" checked={!!form.mandatory_attendance} onChange={set('mandatory_attendance')} />
            Mandatory attendance
          </label>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
