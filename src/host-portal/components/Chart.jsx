// Zero-dep SVG charts. Uses a proper viewBox with fixed pixel-like coords so labels
// don't get stretched horizontally on wide containers.

const cssVar = (name, fallback) => {
  if (typeof window === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

export function BarChart({ data, height = 220, color, labelFormatter = v => v }) {
  const c = color || cssVar('--brand', '#2563eb')
  const n = Math.max(1, data.length)
  const longest = data.reduce((m, d) => Math.max(m, String(d.label).length), 0)
  const rotate = longest > 8
  const barW = rotate ? 52 : 44
  const gap = rotate ? 26 : 18
  const padTop = 18
  const padBottom = rotate ? 78 : 34
  const W = gap + n * (barW + gap)
  const H = height
  const max = Math.max(1, ...data.map(d => d.value))
  const usable = H - padBottom - padTop
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      {/* baseline */}
      <line x1={0} x2={W} y1={H - padBottom} y2={H - padBottom} stroke="currentColor" opacity="0.15" />
      {data.map((d, i) => {
        const h = (d.value / max) * usable
        const x = gap + i * (barW + gap)
        const y = H - padBottom - h
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} fill={c} rx={5}>
              <title>{d.label}: {labelFormatter(d.value)}</title>
            </rect>
            <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize={11} fill="currentColor" opacity="0.75" fontWeight="600">{labelFormatter(d.value)}</text>
            {rotate ? (
              <text x={x + barW / 2} y={H - padBottom + 14} fontSize={11} fill="currentColor" opacity="0.85" textAnchor="end" transform={`rotate(-35 ${x + barW / 2} ${H - padBottom + 14})`}>{d.label}</text>
            ) : (
              <text x={x + barW / 2} y={H - 12} textAnchor="middle" fontSize={12} fill="currentColor" opacity="0.75">{d.label}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function LineChart({ data, height = 220, color }) {
  const c = color || cssVar('--brand', '#2563eb')
  const n = Math.max(1, data.length)
  const step = 60
  const padX = 30
  const padTop = 18
  const padBottom = 34
  const W = padX * 2 + Math.max(1, n - 1) * step
  const H = height
  const max = Math.max(1, ...data.map(d => d.value))
  const min = Math.min(0, ...data.map(d => d.value))
  const range = max - min || 1
  const usable = H - padBottom - padTop
  const y = v => H - padBottom - ((v - min) / range) * usable
  const pts = data.map((d, i) => [padX + i * step, y(d.value)])
  const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1]).join(' ')
  const area = path + ` L ${pts[pts.length - 1][0]},${H - padBottom} L ${pts[0][0]},${H - padBottom} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      <line x1={0} x2={W} y1={H - padBottom} y2={H - padBottom} stroke="currentColor" opacity="0.15" />
      <path d={area} fill={c} opacity="0.15" />
      <path d={path} fill="none" stroke={c} strokeWidth="2" />
      {pts.map(([x, yy], i) => (
        <g key={i}>
          <circle cx={x} cy={yy} r="3.5" fill={c}><title>{data[i].label}: {data[i].value}</title></circle>
          <text x={x} y={yy - 10} textAnchor="middle" fontSize={11} fill="currentColor" opacity="0.75" fontWeight="600">{data[i].value}</text>
          <text x={x} y={H - 12} textAnchor="middle" fontSize={12} fill="currentColor" opacity="0.75">{data[i].label}</text>
        </g>
      ))}
    </svg>
  )
}

export function Donut({ data, size = 180, thickness = 22 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const r = size / 2 - thickness / 2
  const C = 2 * Math.PI * r
  let acc = 0
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-secondary)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const frac = d.value / total
          const dash = frac * C
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={d.color} strokeWidth={thickness}
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={-acc}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}>
              <title>{d.label}: {d.value}</title>
            </circle>
          )
          acc += dash
          return el
        })}
        <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="middle" fontSize={size / 6} fontWeight="700" fill="currentColor">{total}</text>
      </svg>
      <div style={{ display: 'grid', gap: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{d.label}</span>
            <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatCard({ label, value, sub, color, trend }) {
  return (
    <div className="card">
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, margin: '6px 0 2px', color: color || 'var(--text-primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{ fontSize: 11, marginTop: 4, color: trend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}
