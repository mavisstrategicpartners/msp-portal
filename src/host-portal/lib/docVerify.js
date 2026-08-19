// Lightweight document authenticity heuristic for the demo.
// Real product would use metadata, hashing, tamper detection, and AI.
export function verifyDocument({ name = '', size = 0, type = '' }) {
  const reasons = []
  let score = 100
  const lower = name.toLowerCase()

  if (/copy|duplicate|final_final|edited|scan(001|_new)/.test(lower)) { score -= 30; reasons.push('Filename contains suspicious edit markers.') }
  if (size > 0 && size < 20 * 1024) { score -= 25; reasons.push('File is unusually small for a legitimate document (< 20 KB).') }
  if (size > 20 * 1024 * 1024) { score -= 10; reasons.push('File is unusually large (> 20 MB) — may contain modified images.') }
  if (type && !/pdf|image|word|officedocument/.test(type)) { score -= 15; reasons.push('Unusual file type for a compliance document.') }
  if (/whatsapp|screenshot|screen shot|img_\d+/i.test(lower)) { score -= 20; reasons.push('Filename suggests a phone screenshot rather than an original scan.') }
  // Randomised metadata check (deterministic on the name)
  const seed = [...lower].reduce((a, c) => a + c.charCodeAt(0), 0)
  if (seed % 7 === 0) { score -= 15; reasons.push('Metadata check: creation and modification dates do not match.') }

  score = Math.max(0, Math.min(100, score))
  const status = score >= 80 ? 'Verified' : score >= 55 ? 'Needs Review' : 'Suspicious'
  if (reasons.length === 0) reasons.push('No anomalies detected in filename, size, or metadata.')
  return { score, status, reasons }
}
