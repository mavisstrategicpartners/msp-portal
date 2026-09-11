import DashboardLayout from './DashboardLayout.jsx'
import { Sparkles } from 'lucide-react'

export default function ComingSoon({ title, tagline, features = [] }) {
  return (
    <DashboardLayout title={title}>
      <div className="card" style={{ padding: 40, textAlign: 'center', background: 'var(--bg-primary)' }}>
        <Sparkles size={52} strokeWidth={1.5} style={{ marginBottom: 10, color: 'var(--brand)' }} />
        <div className="badge badge-purple" style={{ marginBottom: 12 }}>Coming Soon</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 24 }}>{title}</h2>
        <p style={{ margin: '0 auto', maxWidth: 560, color: 'var(--text-secondary)', fontSize: 14 }}>{tagline}</p>
      </div>

      {features.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14, marginTop: 20 }}>
          {features.map((f, i) => (
            <div key={i} className="card">
              <div style={{ marginBottom: 8, color: 'var(--brand)' }}>{f.icon ? <f.icon size={22} /> : '◆'}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{f.body}</div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
