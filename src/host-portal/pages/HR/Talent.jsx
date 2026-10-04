import { useState, useMemo } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import { BarChart, Donut } from '../../components/Chart.jsx'
import { seedTalent, seedEmployees } from '../../data/mockData.js'
import { uid } from '../../lib/useLocalStorage.js'
import { useSupabaseTable } from '@/lib/useSupabaseTable.js'
import { Star, TrendingUp, Award, Target, Users, ChevronRight, Plus, Edit2, Trash2, Search, Filter, ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'

const POTENTIAL_COLORS = { High: 'var(--success)', Medium: 'var(--warning)', Low: 'var(--danger)' }
const READINESS_COLORS = { 'Ready now': 'var(--success)', '1-2 years': 'var(--brand)', '2-3 years': 'var(--warning)', 'Not ready': 'var(--danger)' }
const READINESS_ORDER = ['Ready now', '1-2 years', '2-3 years', 'Not ready']

const NineBox = ({ talent }) => {
  const cells = [
    { row: 0, col: 0, label: 'Underperformer', sub: 'Low potential, low performance', bg: '#fee2e2', border: '#dc2626' },
    { row: 0, col: 1, label: 'Core Employee', sub: 'Moderate potential, low performance', bg: '#fef3c7', border: '#d97706' },
    { row: 0, col: 2, label: 'High Professional', sub: 'High potential, low performance', bg: '#dcfce7', border: '#16a34a' },
    { row: 1, col: 0, label: 'Inconsistent Player', sub: 'Low potential, moderate performance', bg: '#fef3c7', border: '#d97706' },
    { row: 1, col: 1, label: 'Key Player', sub: 'Moderate potential, moderate performance', bg: '#dbeafe', border: '#2563eb' },
    { row: 1, col: 2, label: 'High Performer', sub: 'High potential, moderate performance', bg: '#ede9fe', border: '#7c3aed' },
    { row: 2, col: 0, label: 'Reliable Employee', sub: 'Low potential, high performance', bg: '#dcfce7', border: '#16a34a' },
    { row: 2, col: 1, label: 'High Achiever', sub: 'Moderate potential, high performance', bg: '#ede9fe', border: '#7c3aed' },
    { row: 2, col: 2, label: 'Star', sub: 'High potential, high performance', bg: 'linear-gradient(135deg,#ede9fe,#dbeafe)', border: '#7c3aed' },
  ]

  const getCell = (t) => {
    const potCol = { High: 2, Medium: 1, Low: 0 }[t.potential] ?? 1
    const perfRow = t.idp_progress >= 80 ? 2 : t.idp_progress >= 50 ? 1 : 0
    return `${perfRow}-${potCol}`
  }

  const cellTalent = {}
  talent.forEach(t => {
    const key = getCell(t)
    if (!cellTalent[key]) cellTalent[key] = []
    cellTalent[key].push(t)
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, fontSize: 11, color: 'var(--text-muted)' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>LOW POTENTIAL</div>
        <div style={{ flex: 1, textAlign: 'center' }}>MEDIUM POTENTIAL</div>
        <div style={{ flex: 1, textAlign: 'center' }}>HIGH POTENTIAL</div>
      </div>
      <div style={{ display: 'flex', gap: 4, flexDirection: 'column' }}>
        {[2, 1, 0].map(row => (
          <div key={row} style={{ display: 'flex', gap: 4, alignItems: 'stretch' }}>
            <div style={{ width: 60, display: 'flex', alignItems: 'center', fontSize: 10, color: 'var(--text-muted)', textAlign: 'right', paddingRight: 8 }}>
              {row === 2 ? 'HIGH PERF' : row === 1 ? 'MID PERF' : 'LOW PERF'}
            </div>
            {[0, 1, 2].map(col => {
              const cell = cells.find(c => c.row === row && c.col === col)
              const key = `${row}-${col}`
              const names = cellTalent[key] || []
              return (
                <div key={col} style={{
                  flex: 1, minHeight: 80, borderRadius: 8, padding: '8px 10px',
                  background: cell.bg, border: `1.5px solid ${cell.border}`, position: 'relative',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: cell.border, marginBottom: 4 }}>{cell.label}</div>
                  {names.map(t => (
                    <div key={t.id} style={{
                      fontSize: 10, background: 'white', borderRadius: 4, padding: '2px 6px',
                      marginBottom: 2, fontWeight: 500, boxShadow: '0 1px 3px rgba(0,0,0,.1)',
                    }}>
                      {t.employee.split(' ')[0]}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Talent() {
  const [talent, setTalent] = useSupabaseTable('hr_talent', seedTalent)
  const [form, setForm] = useState(null)
  const [search, setSearch] = useState('')
  const [filterPotential, setFilterPotential] = useState('All')
  const [view, setView] = useState('list') // list | matrix

  const filtered = useMemo(() =>
    talent.filter(t =>
      (filterPotential === 'All' || t.potential === filterPotential) &&
      (t.employee.toLowerCase().includes(search.toLowerCase()) || (t.role || '').toLowerCase().includes(search.toLowerCase()))
    ), [talent, search, filterPotential])

  const openAdd = () => setForm({
    employee: seedEmployees[0]?.full_name || '',
    role: seedEmployees[0]?.role || '',
    potential: 'Medium',
    readiness: '1-2 years',
    successor_for: '',
    idp_progress: 0,
    strengths: '',
    development_areas: '',
  })

  const submit = () => {
    if (!form.employee.trim()) return toast.warning('Employee name required')
    if (form.id) {
      setTalent(prev => prev.map(x => x.id === form.id ? form : x))
      toast.success('Talent record updated')
    } else {
      setTalent(prev => [{ id: uid('T'), ...form }, ...prev])
      toast.success('Talent record added')
    }
    setForm(null)
  }

  const remove = (t) => {
    if (window.confirm(`Remove ${t.employee} from talent pipeline?`)) {
      setTalent(prev => prev.filter(x => x.id !== t.id))
      toast.success('Record removed')
    }
  }

  // Analytics
  const highPotential = talent.filter(t => t.potential === 'High').length
  const readyNow = talent.filter(t => t.readiness === 'Ready now').length
  const avgIdp = talent.length ? Math.round(talent.reduce((s, t) => s + (t.idp_progress || 0), 0) / talent.length) : 0
  const withSuccessor = talent.filter(t => t.successor_for).length

  const potentialDist = ['High', 'Medium', 'Low'].map((p, i) => ({
    label: p, value: talent.filter(t => t.potential === p).length,
    color: ['var(--success)', 'var(--warning)', 'var(--danger)'][i],
  }))
  const readinessDist = READINESS_ORDER.map(r => ({
    label: r.replace(' years', 'yr').replace('Ready now', 'Ready'),
    value: talent.filter(t => t.readiness === r).length,
  }))

  return (
    <DashboardLayout title="Talent Management">

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4c1d95 0%, var(--purple) 100%)',
        borderRadius: 16, padding: '22px 28px', marginBottom: 24, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        boxShadow: '0 8px 32px rgba(109,60,134,.35)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Star size={16} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', opacity: 0.8 }}>Talent Pipeline</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Succession Planning & IDP Tracker</h2>
          <p style={{ margin: '4px 0 0', opacity: 0.75, fontSize: 13 }}>
            {highPotential} high-potential employees · {readyNow} ready for promotion
          </p>
        </div>
        <button className="btn" onClick={openAdd} style={{ background: 'rgba(255,255,255,.2)', color: 'white', border: '1px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> Add Talent Record
        </button>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total in Pipeline', value: talent.length, icon: Users, color: 'var(--purple)' },
          { label: 'High Potential', value: highPotential, icon: Star, color: 'var(--success)', sub: `${Math.round((highPotential / (talent.length || 1)) * 100)}% of workforce` },
          { label: 'Ready for Promotion', value: readyNow, icon: Award, color: 'var(--brand)' },
          { label: 'Avg IDP Progress', value: `${avgIdp}%`, icon: TrendingUp, color: '#2563eb' },
          { label: 'Succession Mapped', value: withSuccessor, icon: Target, color: 'var(--warning)', sub: `${talent.length - withSuccessor} unmapped` },
        ].map((s, i) => (
          <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, borderRadius: '50%', background: s.color, opacity: 0.12 }} />
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            {s.sub && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Potential Distribution</div>
          <Donut data={potentialDist} size={140} thickness={20} />
        </div>
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Readiness for Advancement</div>
          <BarChart data={readinessDist} height={160} color="var(--purple)" />
        </div>
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>9-Box Grid</div>
          <NineBox talent={talent} />
        </div>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or role…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)' }} />
        </div>
        <select value={filterPotential} onChange={e => setFilterPotential(e.target.value)}
          style={{ padding: '6px 10px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)', fontSize: 12 }}>
          {['All', 'High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
        </select>
        <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
          {['list', 'matrix'].map(v => (
            <button key={v} onClick={() => setView(v)} className={`btn ${view === v ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: 0, padding: '6px 14px', fontSize: 12 }}>
              {v === 'list' ? 'List View' : '9-Box'}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> Add Record
        </button>
      </div>

      {view === 'list' ? (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                <th style={{ padding: '10px 0' }}>Employee</th>
                <th style={{ padding: '10px 12px' }}>Current Role</th>
                <th style={{ padding: '10px 12px' }}>Potential</th>
                <th style={{ padding: '10px 12px' }}>Readiness</th>
                <th style={{ padding: '10px 12px' }}>Successor For</th>
                <th style={{ padding: '10px 12px' }}>IDP Progress</th>
                <th style={{ padding: '10px 0', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px 12px 14px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--purple-soft)', color: 'var(--purple)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {t.employee.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{t.employee}</div>
                        {t.strengths && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Strengths: {t.strengths.slice(0, 40)}{t.strengths.length > 40 ? '…' : ''}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>{t.role}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ background: POTENTIAL_COLORS[t.potential] + '22', color: POTENTIAL_COLORS[t.potential], padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                      {t.potential}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ background: READINESS_COLORS[t.readiness] + '22', color: READINESS_COLORS[t.readiness], padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                      {t.readiness}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>{t.successor_for || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td style={{ padding: '14px 12px', minWidth: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 8, background: 'var(--bg-secondary)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${t.idp_progress}%`, height: '100%', background: t.idp_progress >= 70 ? 'var(--success)' : t.idp_progress >= 40 ? 'var(--warning)' : 'var(--danger)', borderRadius: 999, transition: 'width .4s ease' }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, width: 32 }}>{t.idp_progress}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 0', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 4 }}>
                      <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={() => setForm(t)}>
                        <Edit2 size={12} /> Edit
                      </button>
                      <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11, color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={() => remove(t)}>
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No talent records match your filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 16 }}>Full 9-Box Talent Matrix</div>
          <NineBox talent={talent} />
        </div>
      )}

      {form && (
        <Modal open onClose={() => setForm(null)} title={form.id ? 'Edit Talent Record' : 'New Talent Record'} width={640}
          footer={<><button className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary" onClick={submit}>Save Record</button></>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Employee Name</label>
              <select style={field} value={form.employee} onChange={e => {
                const emp = seedEmployees.find(x => x.full_name === e.target.value)
                setForm({ ...form, employee: e.target.value, role: emp?.role || form.role })
              }}>
                {seedEmployees.map(e => <option key={e.id} value={e.full_name}>{e.full_name}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Current Role</label><input style={field} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></div>
            <div><label style={labelStyle}>Potential Rating</label>
              <select style={field} value={form.potential} onChange={e => setForm({ ...form, potential: e.target.value })}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
            <div><label style={labelStyle}>Readiness for Advancement</label>
              <select style={field} value={form.readiness} onChange={e => setForm({ ...form, readiness: e.target.value })}>
                <option>Ready now</option><option>1-2 years</option><option>2-3 years</option><option>Not ready</option>
              </select>
            </div>
            <div><label style={labelStyle}>Successor For (Role)</label><input style={field} value={form.successor_for} onChange={e => setForm({ ...form, successor_for: e.target.value })} placeholder="e.g. HR Manager" /></div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>IDP Progress ({form.idp_progress}%)</label>
              <input type="range" min="0" max="100" step="5" value={form.idp_progress}
                onChange={e => setForm({ ...form, idp_progress: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--purple)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </div>
            <div><label style={labelStyle}>Key Strengths</label><input style={field} value={form.strengths || ''} onChange={e => setForm({ ...form, strengths: e.target.value })} placeholder="e.g. Leadership, communication" /></div>
            <div><label style={labelStyle}>Development Areas</label><input style={field} value={form.development_areas || ''} onChange={e => setForm({ ...form, development_areas: e.target.value })} placeholder="e.g. Strategic thinking" /></div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
