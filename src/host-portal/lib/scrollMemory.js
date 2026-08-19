// Sidebar scroll retention: keep the sidebar-nav scroll position across route changes.
import { useEffect } from 'react'

const KEY = 'linkora.sidebar.scroll'

export function useScrollMemory() {} // legacy no-op (kept for compatibility)

export function useSidebarScrollRef(navRef) {
  useEffect(() => {
    const el = navRef.current
    if (!el) return
    try {
      const y = Number(sessionStorage.getItem(KEY) || 0)
      if (!Number.isNaN(y)) el.scrollTop = y
    } catch {}
    const onScroll = () => {
      try { sessionStorage.setItem(KEY, String(el.scrollTop)) } catch {}
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
