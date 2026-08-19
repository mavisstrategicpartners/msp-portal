import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal from '../../components/Modal.jsx'
import SignaturePad from '../../components/SignaturePad.jsx'
import FilePreview from '../../components/FilePreview.jsx'
import { seedContracts } from '../../data/mockData.js'
import { useLocalStorage, uid } from '../../lib/useLocalStorage.js'
import { useNotifications } from '../../context/NotificationContext.jsx'

export default function Contracts() {
  const [contracts, setContracts] = useLocalStorage('host.contracts', seedContracts)
  const [signing, setSigning] = useState(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', party: '', expires: '' })
  const { push } = useNotifications()

  const generate = () => {
    setContracts(prev => [{ id: uid('C'), title: form.title, party: form.party, expires: form.expires || null, status: 'Awaiting Signature', signed_at: null, signed_by: null, signature_url: null }, ...prev])
    setCreating(false); setForm({ title: '', party: '', expires: '' })
    push({ title: 'Contract generated', body: `${form.title} is ready for signature.`, link: '/host/contracts', kind: 'doc' })
  }

  const apply = (payload) => {
    setContracts(prev => prev.map(c => c.id === signing.id ? { ...c, status: 'Signed', signed_at: new Date().toISOString().slice(0, 10), signed_by: 'Thandi Mokoena', signature_url: payload.dataUrl, signature_method: payload.method } : c))
    push({ title: 'Contract signed', body: `${signing.title} was signed.`, link: '/host/contracts', kind: 'doc' })
    setSigning(null)
  }

  return (
    <DashboardLayout title="Contract Management">
      <div className="card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{contracts.length} contracts</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Generate, e-sign (Adobe Sign–style: type / draw / upload), and store all placement and host agreements.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>+ Generate Contract</button>
      </div>

      <div className="card">
        <table>
          <thead><tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            <th style={{ padding: '10px 0' }}>Title</th><th>Party</th><th>Status</th><th>Signed at</th><th>Expires</th><th></th></tr></thead>
          <tbody>
            {contracts.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                <td style={{ padding: '12px 0', fontWeight: 600 }}>{c.title}</td>
                <td>{c.party}</td>
                <td><span className={'badge ' + (c.status === 'Signed' ? 'badge-success' : c.status === 'Draft' ? 'badge-info' : 'badge-warning')}>{c.status}</span></td>
                <td>{c.signed_at || '—'}</td>
                <td>{c.expires || '—'}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn btn-ghost" onClick={() => setSigning({ ...c, viewOnly: true })}>View</button>
                  {c.status !== 'Signed' && <button className="btn btn-primary" onClick={() => setSigning(c)}>Sign</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <Modal open onClose={() => setCreating(false)} title="Generate contract" width={480}
          footer={<>
            <button className="btn btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={generate} disabled={!form.title || !form.party}>Generate</button>
          </>}>
          <div style={{ display: 'grid', gap: 12 }}>
            <input placeholder="Contract title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ padding: 10, border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }} />
            <input placeholder="Party (e.g. Mavis Strategic Partners / Neo Mabaso)" value={form.party} onChange={e => setForm({ ...form, party: e.target.value })} style={{ padding: 10, border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }} />
            <input type="date" value={form.expires} onChange={e => setForm({ ...form, expires: e.target.value })} style={{ padding: 10, border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }} />
          </div>
        </Modal>
      )}

      {signing && (
        <Modal open onClose={() => setSigning(null)} title={signing.title} subtitle={signing.viewOnly ? 'Signature preview' : 'Adobe Sign–style: type, draw, or upload your signature'} width={720}>
          <FilePreview url={null} mime="application/pdf" name={signing.title}
            mockTitle={signing.title}
            mockBody="This is a mock preview of the contract. In production the actual PDF would render here for review before signing."
            height={260} />
          {signing.viewOnly ? (
            <div style={{ marginTop: 14 }}>
              {signing.signature_url && (
                <div style={{ background: 'white', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Signed by {signing.signed_by} ({signing.signature_method})</div>
                  <img src={signing.signature_url} alt="Signature" style={{ maxHeight: 100 }} />
                </div>
              )}
              <div style={{ textAlign: 'right', marginTop: 10 }}><button className="btn btn-primary" onClick={() => setSigning(null)}>Close</button></div>
            </div>
          ) : <div style={{ marginTop: 14 }}><SignaturePad defaultName="Thandi Mokoena" onConfirm={apply} onCancel={() => setSigning(null)} /></div>}
        </Modal>
      )}
    </DashboardLayout>
  )
}
