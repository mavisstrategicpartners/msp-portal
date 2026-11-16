import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Same dialog as the rest of the portal (src/components/ui/dialog.tsx). The body keeps the HR
// pages' colour tokens because dialogs open outside the page container.
export default function Modal({ open, onClose, title, subtitle, width = 560, footer, children }) {
  return (
    <Dialog open={!!open} onOpenChange={(o) => { if (!o) onClose?.() }}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 p-0" style={{ maxWidth: `min(${width}px, 96vw)` }}>
        <DialogHeader className="border-b border-border px-6 py-4 text-left">
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          {subtitle ? <DialogDescription className="text-xs">{subtitle}</DialogDescription> : <DialogDescription className="sr-only">{String(title ?? '')}</DialogDescription>}
        </DialogHeader>
        <div className="host-portal-root min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <DialogFooter className="host-portal-root gap-2 border-t border-border px-6 py-3">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}

export const field = {
  display: 'block', width: '100%', minHeight: 36, padding: '7px 12px',
  border: '1px solid var(--input-border)', borderRadius: 'calc(var(--radius) - 2px)',
  background: 'var(--input-bg)', color: 'var(--input-text)', fontSize: 14,
}
export const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }
