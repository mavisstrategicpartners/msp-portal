import DashboardLayout from './DashboardLayout.jsx'

export default function ComingSoon({ title, tagline, features = [] }) {
  return (
    <DashboardLayout title={title}>
      <div className="card" style={{ padding: 40, textAlign: 'center', background: 'linear-gradient(135deg, var(--brand-soft), var(--purple-soft))', border: 'none' }}>
        <div style={{ fontSize: 60, marginBottom: 10 }}>✨</div>
        <div className="badge badge-purple" style={{ marginBottom: 12 }}>Coming Soon</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 24 }}>{title}</h2>
        <p style={{ margin: '0 auto', maxWidth: 560, color: 'var(--text-secondary)', fontSize: 14 }}>{tagline}</p>
      </div>

      {features.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14, marginTop: 20 }}>
          {features.map((f, i) => (
            <div key={i} className="card">
              <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon || '◆'}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{f.body}</div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
