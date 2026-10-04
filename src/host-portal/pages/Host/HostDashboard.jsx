import DashboardLayout from '../../components/DashboardLayout.jsx'
import { Link } from 'react-router-dom'
import { hostProfile, seedLearners, seedCalendar, seedMessages, seedOnboarding, seedAttendance, seedPerformance } from '../../data/mockData.js'
import { useLocalStorage } from '../../lib/useLocalStorage.js'
import { BarChart, LineChart, Donut, StatCard } from '../../components/Chart.jsx'
import { holidayOn } from '../../lib/holidays.js'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function HostDashboard() {
  const [learners] = useLocalStorage('host.learners', seedLearners)
  const [events] = useLocalStorage('host.calendar', seedCalendar)
  const [messages] = useLocalStorage('host.messages', seedMessages)
  const [profile] = useLocalStorage('host.company_profile', hostProfile)
  const [onboarding] = useLocalStorage('host.onboarding', seedOnboarding)
  const [attendance] = useLocalStorage('host.attendance', seedAttendance)
  const [performance] = useLocalStorage('host.performance', seedPerformance)

  const activeCount = learners.filter(l => l.status === 'Active').length
  const capacity = Number(profile.learner_capacity) || 25
  const vacant = Math.max(0, capacity - learners.length)
  const openReviews = performance.length ? Math.max(0, Math.round(performance.length * 0.25)) : 0
  const avgAttendance = learners.length
    ? Math.round(learners.reduce((s, l) => s + (Number(l.attendance_rate) || 0), 0) / learners.length)
    : 0
  const interviewsScheduled = events.filter(e => (e.type || '').toLowerCase().includes('interview')).length || onboarding.length

  const recent = learners.slice(0, 6)

  const donutData = [
    { label: 'Active', value: learners.filter(l => l.status === 'Active').length, color: '#16a34a' },
    { label: 'On Leave', value: learners.filter(l => l.status === 'On Leave').length, color: '#d97706' },
    { label: 'At Risk', value: learners.filter(l => l.status === 'At Risk').length, color: '#dc2626' },
    { label: 'Completed', value: learners.filter(l => l.status === 'Completed').length, color: '#2563eb' },
  ]

  // Real attendance-by-weekday from local records (last 14 days)
  const attendanceByDay = (() => {
    const buckets = DAY_LABELS.map(l => ({ label: l, sum: 0, count: 0 }))
    const cutoff = Date.now() - 14 * 24 * 3600 * 1000
    attendance.forEach(a => {
      const dt = new Date(a.date + 'T00:00:00')
      if (dt.getTime() < cutoff) return
      const dayIdx = (dt.getDay() + 6) % 7 // 0=Mon
      const b = buckets[dayIdx]
      b.count += 1
      if (a.status === 'Present' || a.status === 'Clocked In' || a.status === 'Clocked Out') b.sum += 1
    })
    return buckets.map(b => ({ label: b.label, value: b.count ? Math.round((b.sum / b.count) * 100) : 0 }))
  })()

  // Real quarterly performance trend from live reviews
  const perfTrend = (() => {
    const buckets = { Q1: [], Q2: [], Q3: [], Q4: [] }
    performance.forEach(r => {
      const avg = (r.technical + r.communication + r.teamwork + r.attitude) / 4 * 20 // → out of 100
      const m = Number((r.review_date || '').slice(5, 7))
      const q = m <= 3 ? 'Q1' : m <= 6 ? 'Q2' : m <= 9 ? 'Q3' : 'Q4'
      buckets[q].push(avg)
    })
    return Object.entries(buckets).map(([k, arr]) => ({ label: k, value: arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0 }))
  })()

  // Learners hosted per month (based on start dates in current year window)
  const hostActivity = (() => {
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
      return { label: MONTH_LABELS[d.getMonth()], year: d.getFullYear(), month: d.getMonth(), value: 0 }
    })
    learners.forEach(l => {
      const [y, m] = (l.start_date || '').split('-').map(Number)
      if (!y) return
      const hit = months.find(x => x.year === y && x.month === (m - 1))
      if (hit) hit.value += 1
    })
    return months.map(m => ({ label: m.label, value: m.value }))
  })()

  const upcomingWithHolidays = [...events]
    .filter(e => e.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  return (
    <DashboardLayout title="Dashboard">
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Welcome back, {(profile.contact_person || 'there').split(' ')[0]}</h2>
        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
          {profile.company_name} — {profile.industry}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 16 }}>
        <StatCard label="Active Learners" value={activeCount} sub={`of ${capacity} capacity`} color="var(--brand)" />
        <StatCard label="Vacant Positions" value={vacant} sub="Placements you can still take" color="var(--warning)" />
        <StatCard label="In Onboarding" value={onboarding.length} sub="Being onboarded" />
        <StatCard label="Reviews Due" value={openReviews} sub="Pending your input" color="var(--danger)" />
        <StatCard label="Avg Attendance" value={`${avgAttendance}%`} sub="Across placed interns" color="var(--success)" />
      </div>

      <div style={{ marginTop: 28 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Analytics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(260px,1fr)', gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>ATTENDANCE BY WEEKDAY (%) — LAST 2 WEEKS</div>
            <LineChart data={attendanceByDay} height={220} />
          </div>
          <div className="card">
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>LEARNER STATUS BREAKDOWN</div>
            <Donut data={donutData} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
          <div className="card">
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>PERFORMANCE TREND (quarterly avg %)</div>
            <BarChart data={perfTrend} height={220} labelFormatter={v => v + '%'} />
          </div>
          <div className="card">
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>LEARNERS HOSTED PER MONTH (last 6)</div>
            <BarChart data={hostActivity} height={220} color="#7c3aed" />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginTop: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 15 }}>Recent Placed Interns</h3>
            <Link to="/host/learners" className="btn btn-ghost">View all →</Link>
          </div>
          <table>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 0' }}>Name</th><th>Program</th><th>Status</th><th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(l => (
                <tr key={l.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                  <td style={{ padding: '10px 0', fontWeight: 600 }}>{l.full_name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{l.program}</td>
                  <td><span className={'badge ' + (l.status === 'Active' ? 'badge-success' : l.status === 'At Risk' ? 'badge-danger' : 'badge-info')}>{l.status}</span></td>
                  <td>{l.attendance_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 14px', fontSize: 15 }}>Upcoming</h3>
          {upcomingWithHolidays.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No upcoming events.</div>
          )}
          {upcomingWithHolidays.map(e => {
            const hol = holidayOn(e.date)
            return (
              <div key={e.id} style={{ padding: '10px 0', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 12, color: 'var(--brand)', fontWeight: 600 }}>{e.date} · {e.time}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{e.title}{hol ? ` · 🇿🇦 ${hol.name}` : ''}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.type}{e.location ? ` • ${e.location}` : ''}</div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
