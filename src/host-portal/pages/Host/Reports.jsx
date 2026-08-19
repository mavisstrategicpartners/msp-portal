import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal from '../../components/Modal.jsx'
import { seedLearners, seedAttendance, seedPerformance } from '../../data/mockData.js'
import { useLocalStorage } from '../../lib/useLocalStorage.js'

function toCSV(rows) {
  if (!rows.length) return ''
  const keys = Object.keys(rows[0])
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  return [keys.join(','), ...rows.map(r => keys.map(k => esc(r[k])).join(','))].join('\n')
}
function download(name, csv) {
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export default function Reports() {
  const [learners] = useLocalStorage('host.learners', seedLearners)
  const [attendance] = useLocalStorage('host.attendance', seedAttendance)
  const [performance] = useLocalStorage('host.performance', seedPerformance)
  const [preview, setPreview] = useState(null)

  const learnerRows = learners.map(l => ({ id: l.id, name: l.full_name, program: l.program, status: l.status, attendance: l.attendance_rate + '%', performance: l.performance_score }))
  const attendanceRows = attendance.slice(0, 60).map(a => ({ date: a.date, learner: a.learner_name, status: a.status, in: a.check_in, out: a.check_out }))
  const perfRows = performance.map(p => ({ learner: p.learner_name, review_date: p.review_date, technical: p.technical, communication: p.communication, teamwork: p.teamwork, attitude: p.attitude }))
  const absenteeismRows = learners.map(l => ({ learner: l.full_name, attendance_rate: l.attendance_rate, absent_days: 30 - Math.round(l.attendance_rate * 0.3), risk: l.attendance_rate < 80 ? 'High' : l.attendance_rate < 90 ? 'Medium' : 'Low' }))
  const complianceRows = [
    { area: 'POPIA training', completion: '92%', status: 'On Track' },
    { area: 'Health & Safety refresher', completion: '100%', status: 'Complete' },
    { area: 'Signed learner contracts', completion: '96%', status: 'On Track' },
    { area: 'BBBEE reporting docs', completion: '80%', status: 'Review' },
  ]

  const categories = [
    {
      name: 'Host Reports', icon: '⌂',
      items: [
        { id: 'host-attendance', title: 'Attendance report', desc: 'Daily attendance across all placed learners.', rows: attendanceRows, file: 'host-attendance.csv' },
        { id: 'host-perf', title: 'Performance report', desc: 'Quarterly review scores per learner.', rows: perfRows, file: 'host-performance.csv' },
        { id: 'host-absent', title: 'Absenteeism analysis', desc: 'Risk categorisation based on attendance rate.', rows: absenteeismRows, file: 'host-absenteeism.csv' },
        { id: 'host-compliance', title: 'Compliance report', desc: 'POPIA, H&S, contracts, and BBBEE status.', rows: complianceRows, file: 'host-compliance.csv' },
      ],
    },
    {
      name: 'General Reports', icon: '▥',
      items: [
        { id: 'learners', title: 'Placed learners register', desc: 'Full register of currently placed learners.', rows: learnerRows, file: 'learners.csv' },
      ],
    },
  ]

  return (
    <DashboardLayout title="Reports">
      {categories.map(cat => (
        <div key={cat.name} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '4px 0 10px' }}>{cat.icon} {cat.name}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
            {cat.items.map(r => (
              <div key={r.id} className="card">
                <div style={{ fontSize: 15, fontWeight: 700 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '6px 0 12px' }}>{r.desc}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost" onClick={() => setPreview(r)}>Preview</button>
                  <button className="btn btn-primary" onClick={() => download(r.file, toCSV(r.rows))}>Export CSV</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {preview && (
        <Modal open onClose={() => setPreview(null)} title={preview.title} width={780}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setPreview(null)}>Close</button>
            <button className="btn btn-primary" onClick={() => download(preview.file, toCSV(preview.rows))}>Export CSV</button>
          </>}>
          <div style={{ overflow: 'auto', maxHeight: '60vh' }}>
            <table>
              <thead>
                <tr>{preview.rows[0] && Object.keys(preview.rows[0]).map(k => (
                  <th key={k} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{k}</th>
                ))}</tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 100).map((r, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--border-color)', fontSize: 12 }}>
                    {Object.values(r).map((v, j) => <td key={j} style={{ padding: '6px 10px' }}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
