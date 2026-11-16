import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const Ctx = createContext(null)
const KEY = 'linkora.notifications.v1'

// No sample notifications: only events raised in this browser are listed.
const SAMPLE_IDS = new Set(['N1', 'N2', 'N3', 'N4', 'N5'])

export function NotificationProvider({ children }) {
  const [list, setList] = useState(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw).filter(n => !SAMPLE_IDS.has(n.id)) } catch {}
    return []
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
