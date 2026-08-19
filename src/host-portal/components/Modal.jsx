export default function Modal({ open, onClose, title, subtitle, width = 560, footer, children }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
      display: 'grid', placeItems: 'center', zIndex: 60, padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{
        width: `min(${width}px, 96vw)`, maxHeight: '92vh', overflow: 'auto', padding: 0,
      }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
            {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</div>}
          </div>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
        {footer && (
          <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export const field = {
  display: 'block', width: '100%', padding: '10px 12px',
  border: '1px solid var(--input-border)', borderRadius: 8,
  background: 'var(--input-bg)', color: 'var(--input-text)', fontSize: 13,
}
export const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }
