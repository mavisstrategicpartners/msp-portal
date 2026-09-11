import DashboardLayout from '../../components/DashboardLayout.jsx'
import { seedIntegrations } from '../../data/mockData.js'
import { useLocalStorage } from '../../lib/useLocalStorage.js'

export default function HRIntegrations() {
  const [ints, setInts] = useLocalStorage('hr.integrations', seedIntegrations)
  const toggle = (id) => setInts(prev => prev.map(i => i.id === id ? { ...i, status: i.status === 'Connected' ? 'Not Connected' : 'Connected', last_sync: i.status === 'Connected' ? null : new Date().toISOString().slice(0, 16).replace('T', ' ') } : i))
  const cats = Array.from(new Set(ints.map(i => i.category)))
  return (
    <DashboardLayout title="Integrations">
      <div className="card" style={{ marginBottom: 16, background: 'var(--bg-primary)' }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>Connect your existing HR tooling</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Payroll, biometric devices, ERP, LMS, job boards, e-signature, SSO/MFA, and BI. Toggle to enable a live connection (demo — no external calls made).</div>
      </div>

      {cats.map(cat => (
        <div key={cat} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', marginBottom: 8 }}>{cat}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
            {ints.filter(i => i.category === cat).map(i => (
              <div key={i.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700 }}>{i.name}</div>
                  <span className={'badge ' + (i.status === 'Connected' ? 'badge-success' : 'badge-danger')}>{i.status}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Last sync: {i.last_sync || '—'}</div>
                <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => toggle(i.id)}>{i.status === 'Connected' ? 'Disconnect' : 'Connect'}</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </DashboardLayout>
  )
}
