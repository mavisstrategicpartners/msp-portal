import { useState } from 'react'

/**
 * Draggable kanban board with drop targets on every column so users can move
 * cards in any direction (backward or forward).
 * props:
 *  columns: [string]
 *  items:   [{ id, status, ... }]
 *  onMove:  (id, newStatus) => void
 *  renderCard: (item) => ReactNode
 *  columnAccent: (col) => cssColor
 */
export default function KanbanBoard({ columns, items, onMove, renderCard, columnAccent }) {
  const [dragId, setDragId] = useState(null)
  const [over, setOver] = useState(null)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, 1fr)`, gap: 12 }}>
      {columns.map(col => {
        const colItems = items.filter(i => i.status === col)
        return (
          <div key={col}
            className={'kanban-col' + (over === col ? ' drag-over' : '')}
            onDragOver={(e) => { e.preventDefault(); setOver(col) }}
            onDragLeave={() => setOver(o => o === col ? null : o)}
            onDrop={() => {
              if (dragId) onMove(dragId, col)
              setDragId(null); setOver(null)
            }}
            style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 10, minHeight: 320 }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: columnAccent ? columnAccent(col) : 'var(--brand)' }} />
                {col}
              </span>
              <span>{colItems.length}</span>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {colItems.map(item => (
                <div key={item.id}
                  className="kanban-card"
                  draggable
                  onDragStart={() => setDragId(item.id)}
                  onDragEnd={() => { setDragId(null); setOver(null) }}
                >
                  {renderCard(item)}
                </div>
              ))}
              {colItems.length === 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: 20, border: '1px dashed var(--border-color)', borderRadius: 8 }}>Drop here</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
