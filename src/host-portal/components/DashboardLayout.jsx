import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import NotificationBell from './NotificationBell.jsx'
import { useSidebarScrollRef } from '../lib/scrollMemory.js'
import { useLocalStorage } from '../lib/useLocalStorage.js'
import { hostProfile } from '../data/mockData.js'

const hostNav = [
  { heading: null, items: [{ name: 'Dashboard', path: '/host', icon: '◆' }] },
  {
    heading: 'Operations',
    items: [
      { name: 'Placed Learners', path: '/host/learners', icon: '◇' },
      { name: 'Workforce', path: '/host/workforce', icon: '⚙' },
      { name: 'Performance', path: '/host/performance', icon: '◑' },
      { name: 'Coaching Notes', path: '/host/coaching', icon: '✎' },
      { name: 'Onboarding', path: '/host/onboarding', icon: '◓' },
    ],
  },
  {
    heading: 'Recruitment',
    items: [
      { name: 'Learner Marketplace', path: '/host/marketplace', icon: '★' },
      { name: 'Recruitment', path: '/host/recruitment', icon: '👥' },
      { name: 'Host Employer Check', path: '/host/check', icon: '☑' },
    ],
  },
  {
    heading: 'Workspace',
    items: [
      { name: 'Calendar', path: '/host/calendar', icon: '◕' },
      { name: 'Projects', path: '/host/projects', icon: '⬢' },
      { name: 'Tasks', path: '/host/tasks', icon: '✓' },
      { name: 'KPI Management', path: '/host/kpi', icon: '◈' },
      { name: 'Contracts', path: '/host/contracts', icon: '✍' },
      { name: 'Documents', path: '/host/documents', icon: '▣' },
      { name: 'Messages', path: '/host/messages', icon: '▤' },
      { name: 'Reports', path: '/host/reports', icon: '▥' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { name: 'Company Profile', path: '/host/company', icon: '⌂' },
      { name: 'Settings', path: '/host/settings', icon: '▦' },
    ],
  },
]

const hrNav = [
  { heading: null, items: [{ name: 'HR Dashboard', path: '/hr', icon: '◆' }] },
  {
    heading: 'People Ops',
    items: [
      { name: 'Attendance Register', path: '/hr/attendance', icon: '◐' },
      { name: 'Leave Management', path: '/hr/leave', icon: '☰' },
      { name: 'Timesheets', path: '/hr/timesheets', icon: '⏱' },
      { name: 'Employee Relations', path: '/hr/relations', icon: '⚖' },
    ],
  },
  {
    heading: 'Talent',
    items: [
      { name: 'Recruitment', path: '/hr/recruitment', icon: '✎' },
      { name: 'Performance', path: '/hr/performance', icon: '◑' },
      { name: 'Talent Management', path: '/hr/talent', icon: '★' },
      { name: 'Training & Development', path: '/hr/training', icon: '✦' },
    ],
  },
  {
    heading: 'System',
    items: [
      { name: 'HR Administration', path: '/hr/admin', icon: '▣' },
      { name: 'Integrations', path: '/hr/integrations', icon: '⚡' },
    ],
  },
]

const initialsOf = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U'

export default function DashboardLayout({ children, title }) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  const [profile] = useLocalStorage('host.company_profile', hostProfile)
  const navRef = useRef(null)
  useSidebarScrollRef(navRef)

  if (typeof window !== 'undefined') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const onResize = () => setIsMobile(window.innerWidth < 768)
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }, [])
  }

  const isHR = location.pathname.startsWith('/hr')
  const groups = isHR ? hrNav : hostNav
  const W = open ? 254 : 68
  const portalLabel = isHR ? 'MSP — All In One (HR)' : 'MSP — All In One (Host)'
  const portalSub = isHR ? 'Human Resources' : 'Host Employer'
  const accent = isHR ? 'var(--purple)' : 'var(--brand)'
  const displayName = profile.contact_person || 'User'
  const role = isHR ? 'HR Manager' : (profile.contact_title || 'Host Admin')

  const sidebarVisible = !isMobile || mobileOpen
  const sidebarStyle = isMobile
    ? {
        width: 260, background: 'var(--bg-primary)',
        borderRight: '1px solid var(--border-color)', position: 'fixed', top: 0, left: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', zIndex: 50,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform .2s',
      }
    : {
        width: W, transition: 'width .2s', background: 'var(--bg-primary)',
        borderRight: '1px solid var(--border-color)', position: 'sticky', top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column',
      }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      {isMobile && mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 40 }} />
      )}
      <aside style={sidebarStyle}>
        <div style={{ padding: '18px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: accent,
            color: 'white', display: 'grid', placeItems: 'center', fontWeight: 700,
          }}>M</div>
          {(open || isMobile) && <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{portalLabel}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{portalSub}</div>
          </div>}
        </div>

        {(open || isMobile) && (
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 8 }}>
              <Link to="/host" style={{
                textAlign: 'center', padding: '6px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                background: !isHR ? 'var(--bg-primary)' : 'transparent',
                color: !isHR ? 'var(--brand)' : 'var(--text-secondary)',
                boxShadow: !isHR ? 'var(--shadow-sm)' : 'none',
              }}>Host</Link>
              <Link to="/hr" style={{
                textAlign: 'center', padding: '6px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                background: isHR ? 'var(--bg-primary)' : 'transparent',
                color: isHR ? 'var(--purple)' : 'var(--text-secondary)',
                boxShadow: isHR ? 'var(--shadow-sm)' : 'none',
              }}>HR</Link>
            </div>
            <Link to="/home" style={{ display: 'block', textAlign: 'center', marginTop: 8, fontSize: 11, color: 'var(--text-muted)', padding: '6px', borderRadius: 6, border: '1px dashed var(--border-color)' }}>← Back to MSP Portal</Link>
          </div>
        )}

        <nav ref={navRef} style={{ flex: 1, padding: '10px 8px', overflow: 'auto' }}>
          {groups.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 10 }}>
              {(open || isMobile) && group.heading && (
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', padding: '8px 10px 4px', fontWeight: 700 }}>{group.heading}</div>
              )}
              {group.items.map(item => {
                const active = location.pathname === item.path
                return (
                  <Link key={item.path} to={item.path} onClick={() => isMobile && setMobileOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 10px', borderRadius: 8, textDecoration: 'none',
                    color: active ? accent : 'var(--text-secondary)',
                    background: active ? 'var(--brand-soft)' : 'transparent',
                    fontWeight: active ? 700 : 500, fontSize: 13, margin: '2px 0',
                  }}>
                    <span style={{ width: 18, textAlign: 'center' }}>{item.icon}</span>
                    {(open || isMobile) && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {!isMobile && (
          <button onClick={() => setOpen(o => !o)} style={{
            margin: 10, padding: '8px', border: '1px solid var(--border-color)',
            background: 'transparent', color: 'var(--text-secondary)', borderRadius: 8, cursor: 'pointer',
          }}>{open ? '« Collapse' : '»'}</button>
        )}
      </aside>

      <main style={{ flex: 1, minWidth: 0 }}>
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 10,
          gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            {isMobile && (
              <button onClick={() => setMobileOpen(true)} aria-label="Open navigation" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', width: 36, height: 36, borderRadius: 8, cursor: 'pointer', fontSize: 18 }}>☰</button>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{portalLabel}</div>
              <h1 style={{ margin: 0, fontSize: 18, lineHeight: 1.2 }}>{title}</h1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <NotificationBell />
            <button className="btn btn-ghost" onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀'}
            </button>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 999,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: accent,
                color: 'white', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700,
              }}>{initialsOf(displayName)}</div>
              <div style={{ fontSize: 12 }} className="hp-user-meta">
                <div style={{ fontWeight: 600 }}>{displayName}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{role}</div>
              </div>
            </div>
          </div>
        </header>
        <div style={{ padding: 'clamp(14px, 3vw, 28px)' }}>{children}</div>
      </main>
    </div>
  )
}
