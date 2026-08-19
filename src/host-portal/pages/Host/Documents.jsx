import { useState, useRef } from 'react'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Modal, { field, labelStyle } from '../../components/Modal.jsx'
import SignaturePad from '../../components/SignaturePad.jsx'
import FilePreview from '../../components/FilePreview.jsx'
import { seedDocuments, DOCUMENT_CATEGORIES } from '../../data/mockData.js'
import { useLocalStorage, uid } from '../../lib/useLocalStorage.js'
import { verifyDocument } from '../../lib/docVerify.js'
import { useNotifications } from '../../context/NotificationContext.jsx'

const badgeFor = (status) => status === 'Verified' ? 'badge-success' : status === 'Needs Review' ? 'badge-warning' : 'badge-danger'

export default function Documents() {
  const [docs, setDocs] = useLocalStorage('host.documents', seedDocuments)
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('All')
  const [signing, setSigning] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({ category: 'Policy', requires_signature: false, file: null, verification: null })
  const fileInput = useRef(null)
  const { push } = useNotifications()

  const filtered = docs.filter(d =>
    (category === 'All' || d.category === category) &&
    d.name.toLowerCase().includes(q.toLowerCase())
  )

  const chooseFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return
    const verification = verifyDocument({ name: f.name, size: f.size, type: f.type })
    setUploadForm(u => ({ ...u, file: f, verification }))
  }

  const doUpload = () => {
    if (!uploadForm.file) return alert('Please pick a file first.')
    const f = uploadForm.file
    const nextDoc = {
      id: uid('D'), name: f.name, category: uploadForm.category,
      size: (f.size / 1024).toFixed(0) + ' KB', uploaded: new Date().toISOString().slice(0, 10),
      requires_signature: uploadForm.requires_signature, signed: false,
      review_status: uploadForm.requires_signature ? 'Pending' : 'N/A',
      verification: uploadForm.verification,
    }
    setDocs(prev => [nextDoc, ...prev])
    push({ title: `Document uploaded — ${nextDoc.name}`, body: `Authenticity: ${nextDoc.verification.status} (${nextDoc.verification.score}/100).`, link: '/host/documents', kind: 'doc' })
    setUploading(false)
    setUploadForm({ category: 'Policy', requires_signature: false, file: null, verification: null })
  }

  const applySignature = (payload) => {
    setDocs(prev => prev.map(d => d.id === signing.id ? { ...d, signed: true, signature_url: payload.dataUrl, signature_method: payload.method, signed_at: new Date().toISOString().slice(0, 10), review_status: 'Signed' } : d))
    push({ title: 'Document signed', body: `${signing.name} was signed (${payload.method}).`, link: '/host/documents', kind: 'doc' })
    setSigning(null)
  }

  const remove = (d) => { if (window.confirm(`Delete ${d.name}?`)) setDocs(prev => prev.filter(x => x.id !== d.id)) }

  return (
    <DashboardLayout title="Documents & E-Signatures">
      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search documents…"
          style={{ flex: 1, minWidth: 220, padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }} />
        <select value={category} onChange={e => setCategory(e.target.value)}
          style={{ padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }}>
          <option>All</option>
          {DOCUMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => setUploading(true)}>+ Upload Document</button>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 0' }}>Name</th><th>Category</th><th>Size</th><th>Uploaded</th><th>Authenticity</th><th>Signature</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} style={{ borderTop: '1px solid var(--border-color)', fontSize: 13 }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>{d.name}</td>
                  <td>{d.category}</td>
                  <td>{d.size}</td>
                  <td>{d.uploaded}</td>
                  <td>
                    <span className={'badge ' + badgeFor(d.verification?.status || 'Verified')}
                      title={d.verification?.reasons?.join('\n') || ''}>
                      {d.verification?.status || 'Verified'} · {d.verification?.score ?? 100}
                    </span>
                  </td>
                  <td>
                    {d.requires_signature ? (
                      d.signed
                        ? <span className="badge badge-success">Signed {d.signed_at ? `· ${d.signed_at}` : ''}</span>
                        : <span className="badge badge-warning">Awaiting signature</span>
                    ) : <span className="badge badge-info">Not required</span>}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-ghost" onClick={() => setSigning({ ...d, viewOnly: true })}>View</button>
                    {d.requires_signature && !d.signed && <button className="btn btn-primary" onClick={() => setSigning(d)}>Sign</button>}
                    <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => remove(d)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload modal with authenticity check */}
      <Modal open={uploading} onClose={() => setUploading(false)} title="Upload document"
        subtitle="Every upload is scanned for authenticity before being stored." width={620}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setUploading(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={doUpload} disabled={!uploadForm.file}>Upload</button>
        </>}>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={labelStyle}>File</label>
            <input ref={fileInput} type="file" onChange={chooseFile}
              style={{ ...field, padding: 8 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={field} value={uploadForm.category} onChange={e => setUploadForm(u => ({ ...u, category: e.target.value }))}>
                {DOCUMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
              <label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="checkbox" checked={uploadForm.requires_signature} onChange={e => setUploadForm(u => ({ ...u, requires_signature: e.target.checked }))} />
                Requires signature
              </label>
            </div>
          </div>
          {uploadForm.verification && (
            <div className="card" style={{ padding: 14, background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ fontSize: 13 }}>Document authenticity check</b>
                <span className={'badge ' + badgeFor(uploadForm.verification.status)}>{uploadForm.verification.status} · {uploadForm.verification.score}/100</span>
              </div>
              <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12, color: 'var(--text-secondary)' }}>
                {uploadForm.verification.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
              {uploadForm.verification.status !== 'Verified' && (
                <div style={{ fontSize: 11, color: 'var(--warning)', marginTop: 8 }}>
                  ⚠ This document will be flagged for manual HR review after upload.
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Signing flow */}
      {signing && (
        <Modal open onClose={() => setSigning(null)} title={signing.name}
          subtitle={signing.viewOnly ? 'Signature preview (read-only)' : 'Type, draw, or upload your signature — Adobe Sign style'}
          width={720}>
          <FilePreview
            url={null} mime="application/pdf" name={signing.name}
            mockTitle={signing.name.replace(/\.[^.]+$/, '')}
            mockBody="This is a mock preview of the document. In production the actual PDF would render here. After you apply your signature it will be placed at the bottom of the last page and the document will be marked as signed."
            height={280}
          />
          {signing.viewOnly ? (
            <div style={{ marginTop: 14 }}>
              {signing.signature_url && (
                <div style={{ background: 'white', padding: 12, borderRadius: 8, textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Applied signature ({signing.signature_method})</div>
                  <img src={signing.signature_url} alt="Signature" style={{ maxHeight: 100 }} />
                </div>
              )}
              <div style={{ marginTop: 10, textAlign: 'right' }}>
                <button className="btn btn-primary" onClick={() => setSigning(null)}>Close</button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 14 }}>
              <SignaturePad defaultName="Thandi Mokoena" onConfirm={applySignature} onCancel={() => setSigning(null)} />
            </div>
          )}
        </Modal>
      )}
    </DashboardLayout>
  )
}
