import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const Ctx = createContext(null)
const KEY = 'linkora.notifications.v1'

const seed = [
  { id: 'N1', title: 'New leave request', body: 'Sipho Dlamini submitted a sick leave request with a medical certificate.', link: '/hr/leave', kind: 'leave', unread: true, at: Date.now() - 1000 * 60 * 30 },
  { id: 'N2', title: 'Contract awaiting signature', body: 'Host Agreement — Cohort 2026 is waiting for your signature.', link: '/host/documents', kind: 'doc', unread: true, at: Date.now() - 1000 * 60 * 60 * 2 },
  { id: 'N3', title: 'Timesheet approvals due', body: '3 timesheets pending your approval for the week of 30 Jun.', link: '/hr/timesheets', kind: 'timesheet', unread: true, at: Date.now() - 1000 * 60 * 60 * 5 },
  { id: 'N4', title: 'New candidate shortlisted', body: 'Ayanda Pillay was recommended by the AI matching engine.', link: '/host/marketplace', kind: 'recruit', unread: false, at: Date.now() - 1000 * 60 * 60 * 26 },
  { id: 'N5', title: 'Quarterly report reminder', body: 'Managers must submit their quarterly learner reports by end of month.', link: '/host/company', kind: 'reminder', unread: false, at: Date.now() - 1000 * 60 * 60 * 40 },
]

export function NotificationProvider({ children }) {
  const [list, setList] = useState(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw) } catch {}
    return seed
  })
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(list)) } catch {} }, [list])

  const push = useCallback((n) => setList(prev => [{ id: 'N' + Date.now(), unread: true, at: Date.now(), ...n }, ...prev].slice(0, 50)), [])
  const markRead = useCallback((id) => setList(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n)), [])
  const markAllRead = useCallback(() => setList(prev => prev.map(n => ({ ...n, unread: false }))), [])
  const remove = useCallback((id) => setList(prev => prev.filter(n => n.id !== id)), [])
  const unreadCount = list.filter(n => n.unread).length

  return <Ctx.Provider value={{ list, push, markRead, markAllRead, remove, unreadCount }}>{children}</Ctx.Provider>
}

export const useNotifications = () => useContext(Ctx)
