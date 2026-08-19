import { useRef, useState, useEffect } from 'react'

const FONTS = ['"Brush Script MT", cursive', '"Segoe Script", cursive', 'Georgia, serif']

export default function SignaturePad({ onConfirm, onCancel, defaultName = '' }) {
  const [tab, setTab] = useState('draw')
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const [typed, setTyped] = useState(defaultName)
  const [font, setFont] = useState(FONTS[0])
  const [uploadUrl, setUploadUrl] = useState(null)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    if (tab !== 'draw') return
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.strokeStyle = '#0f172a'
  }, [tab])

  const pos = (e) => {
    const c = canvasRef.current
    const rect = c.getBoundingClientRect()
    const t = e.touches ? e.touches[0] : e
    return { x: (t.clientX - rect.left) * (c.width / rect.width), y: (t.clientY - rect.top) * (c.height / rect.height) }
  }
  const down = (e) => { e.preventDefault(); drawing.current = true; const { x, y } = pos(e); const ctx = canvasRef.current.getContext('2d'); ctx.beginPath(); ctx.moveTo(x, y); setHasDrawn(true) }
  const move = (e) => { if (!drawing.current) return; const { x, y } = pos(e); const ctx = canvasRef.current.getContext('2d'); ctx.lineTo(x, y); ctx.stroke() }
  const up = () => { drawing.current = false }
  const clear = () => { const c = canvasRef.current; c.getContext('2d').clearRect(0, 0, c.width, c.height); setHasDrawn(false) }

  const buildTypedDataUrl = () => {
    const c = document.createElement('canvas'); c.width = 600; c.height = 160
    const ctx = c.getContext('2d')
    ctx.fillStyle = 'white'; ctx.fillRect(0, 0, c.width, c.height)
    ctx.fillStyle = '#0f172a'; ctx.font = `48px ${font}`; ctx.textBaseline = 'middle'
    ctx.fillText(typed || 'Signature', 20, c.height / 2)
    return c.toDataURL('image/png')
  }

  const handleUpload = (e) => {
    const f = e.target.files?.[0]; if (!f) return
    const reader = new FileReader(); reader.onload = () => setUploadUrl(reader.result); reader.readAsDataURL(f)
  }

  const confirm = () => {
    if (tab === 'draw') {
      if (!hasDrawn) return alert('Please draw your signature first.')
      onConfirm({ dataUrl: canvasRef.current.toDataURL('image/png'), method: 'drawn' })
    } else if (tab === 'type') {
      if (!typed.trim()) return alert('Please type your name.')
      onConfirm({ dataUrl: buildTypedDataUrl(), method: 'typed', typed })
    } else {
      if (!uploadUrl) return alert('Please upload a signature image.')
      onConfirm({ dataUrl: uploadUrl, method: 'uploaded' })
    }
  }

  const tabStyle = (t) => ({
    padding: '8px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    background: tab === t ? 'var(--brand)' : 'transparent', color: tab === t ? 'white' : 'var(--text-secondary)',
    border: '1px solid ' + (tab === t ? 'var(--brand)' : 'var(--border-color)'),
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button style={tabStyle('type')} onClick={() => setTab('type')}>Type</button>
        <button style={tabStyle('draw')} onClick={() => setTab('draw')}>Draw</button>
        <button style={tabStyle('upload')} onClick={() => setTab('upload')}>Upload</button>
      </div>

      {tab === 'draw' && (
        <div>
          <canvas ref={canvasRef} width={600} height={180}
            onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
            onTouchStart={down} onTouchMove={move} onTouchEnd={up}
            style={{ width: '100%', maxHeight: 200, background: 'white', border: '1px dashed var(--input-border)', borderRadius: 8, touchAction: 'none' }} />
          <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
            <span>Draw with your mouse or finger</span>
            <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={clear}>Clear</button>
          </div>
        </div>
      )}

      {tab === 'type' && (
        <div>
          <input value={typed} onChange={e => setTyped(e.target.value)} placeholder="Type your full name"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--input-border)', borderRadius: 8, background: 'var(--input-bg)', color: 'var(--input-text)' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {FONTS.map(f => (
              <button key={f} onClick={() => setFont(f)} style={{
                padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                border: font === f ? '2px solid var(--brand)' : '1px solid var(--border-color)',
                background: 'white', color: '#0f172a', fontFamily: f, fontSize: 22,
              }}>{typed || 'Signature'}</button>
            ))}
          </div>
        </div>
      )}

      {tab === 'upload' && (
        <div>
          <label style={{
            display: 'block', border: '2px dashed var(--input-border)', borderRadius: 10,
            padding: 30, textAlign: 'center', cursor: 'pointer', background: 'var(--bg-secondary)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>📤</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Upload a signature image</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>PNG or JPG with a transparent or white background works best</div>
            <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
          </label>
          {uploadUrl && (
            <div style={{ marginTop: 10, background: 'white', border: '1px solid var(--border-color)', padding: 10, borderRadius: 8, textAlign: 'center' }}>
              <img src={uploadUrl} alt="Signature" style={{ maxHeight: 120 }} />
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={confirm}>Apply signature</button>
      </div>
    </div>
  )
}
