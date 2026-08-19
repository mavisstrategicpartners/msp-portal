// Safe date helpers — parse YYYY-MM-DD as local dates so timezone never shifts the day.
export function parseYMD(key) {
  if (!key) return null
  const [y, m, d] = key.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}
export function formatLongDate(key) {
  const dt = parseYMD(key); if (!dt) return key || ''
  return dt.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
export function formatShortDate(key) {
  const dt = parseYMD(key); if (!dt) return key || ''
  return dt.toLocaleDateString('en-ZA')
}
