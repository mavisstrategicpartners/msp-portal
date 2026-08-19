// Renders a preview of an uploaded file (data URL) or a friendly HTML mock for seed docs.
export default function FilePreview({ url, mime, name, mockTitle, mockBody, height = 480 }) {
  const wrapper = { border: '1px solid var(--border-color)', borderRadius: 10, background: 'var(--bg-secondary)', overflow: 'hidden' }
  if (url) {
    if ((mime || '').startsWith('image/')) {
      return <div style={wrapper}><img src={url} alt={name || 'preview'} style={{ display: 'block', maxWidth: '100%', maxHeight: height, margin: '0 auto' }} /></div>
    }
    // PDF, text or unknown — try iframe (works for pdf/text/html data URLs in modern browsers).
    return <iframe title={name || 'preview'} src={url} style={{ width: '100%', height, border: 0, background: 'white', ...wrapper }} />
  }
  // No real file — render a printed-page mock.
  return (
    <div style={{ ...wrapper, padding: 24, minHeight: height, color: 'var(--text-primary)', background: 'white', lineHeight: 1.6 }}>
      <div style={{ borderBottom: '2px solid var(--brand)', paddingBottom: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Mavis Strategic Partners (Pty) Ltd — Official document</div>
        <h2 style={{ margin: '4px 0 0', fontSize: 20 }}>{mockTitle || name || 'Document'}</h2>
      </div>
      <p style={{ marginTop: 0, fontSize: 13 }}>{mockBody || 'This is a placeholder rendering used for local testing. In production, the uploaded document would be displayed here for review.'}</p>
      <p style={{ fontSize: 13 }}>By signing below the reader confirms they have read, understood and agree to the contents of this document. Signed copies are retained by HR and shared with the relevant provider.</p>
      <ol style={{ fontSize: 13, paddingLeft: 20 }}>
        <li>All parties must comply with the Occupational Health &amp; Safety Act, 1993.</li>
        <li>Confidential information must not be shared outside the placement.</li>
        <li>Any concerns or grievances must be raised via the standard channels.</li>
      </ol>
      <div style={{ marginTop: 30, borderTop: '1px dashed var(--border-color)', paddingTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
        Page 1 of 1 — generated for local testing.
      </div>
    </div>
  )
}
