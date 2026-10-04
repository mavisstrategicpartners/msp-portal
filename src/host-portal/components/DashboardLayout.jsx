import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import NotificationBell from './NotificationBell.jsx'
import { useSidebarScrollRef } from '../lib/scrollMemory.js'
import { useLocalStorage } from '../lib/useLocalStorage.js'
import { hostProfile } from '../data/mockData.js'
import { Camera, LogOut, Moon, Sun, User, UserRound } from 'lucide-react'
import { supabase } from '../../integrations/supabase/client'

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
      { name: 'Recruitment', path: '/host/recruitment', icon: '◎' },
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
      { name: 'Timesheets', path: '/hr/timesheets', icon: '◷' },
      { name: 'Employee Relations', path: '/hr/relations', icon: '◇' },
    ],
  },
  {
    heading: 'Talent',
    items: [
      { name: 'Employee Recruitment', path: '/hr/recruitment', icon: '◎' },
      { name: 'HR Performance', path: '/hr/performance', icon: '◑' },
      { name: 'Talent Management', path: '/hr/talent', icon: '★' },
      { name: 'Training Development', path: '/hr/training', icon: '✦' },
    ],
  },
  {
    heading: 'System',
    items: [
      { name: 'HR Administration', path: '/hr/admin', icon: '▣' },
      { name: 'Employee Documents', path: '/hr/documents', icon: '▤' },
      { name: 'Payroll', path: '/hr/payroll', icon: '▥' },
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
  const [accountOpen, setAccountOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [initialsMode, setInitialsMode] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  const [profile] = useLocalStorage('host.company_profile', hostProfile)
  const navRef = useRef(null)
  const avatarInputRef = useRef(null)
  useSidebarScrollRef(navRef)

  useEffect(() => {
    setAvatarUrl(localStorage.getItem('msp.portalAvatar') || null)
    setInitialsMode(localStorage.getItem('msp.portalInitials') === 'true')
  }, [])

  if (typeof window !== 'undefined') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const onResize = () => setIsMobile(window.innerWidth < 768)
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }, [])
  }

  const isHR = location.pathname.startsWith('/hr') || location.pathname.startsWith('/host/hr')
  const groups = isHR ? hrNav : hostNav
  const W = open ? 254 : 68
  const portalLabel = isHR ? 'MSP — All In One (HR)' : 'MSP — All In One (Host)'
  const portalSub = isHR ? 'Human Resources' : 'Host Employer'
  const accent = isHR ? 'var(--purple)' : 'var(--brand)'
  const displayName = profile.contact_person || 'User'
  const role = isHR ? 'HR Manager' : (profile.contact_title || 'Host Admin')

  const logout = async () => {
    try {
      if (profile?.contact_email && !localStorage.getItem('msp.rememberedEmail')) {
        localStorage.setItem('msp.rememberedEmail', profile.contact_email)
      }
      await supabase.auth.signOut()
    } catch {}
    localStorage.removeItem('msp.demoUser')
    localStorage.removeItem('msp.selectedPortal')
    window.location.replace('/auth')
  }

  const updateAvatar = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return
    setUploadingAvatar(true)
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result)
        setInitialsMode(false)
        localStorage.setItem('msp.portalAvatar', reader.result)
        localStorage.removeItem('msp.portalInitials')
      }
      setUploadingAvatar(false)
    }
    reader.onerror = () => setUploadingAvatar(false)
    reader.readAsDataURL(file)
  }

  const useInitials = () => {
    setAvatarUrl(null)
    setInitialsMode(true)
    localStorage.removeItem('msp.portalAvatar')
    localStorage.setItem('msp.portalInitials', 'true')
  }

  const useAvatarIcon = () => {
    setInitialsMode(false)
    localStorage.removeItem('msp.portalInitials')
  }

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
                const active = location.pathname === item.path || location.pathname === `/host${item.path}` || location.pathname.replace('/host/hr', '/hr') === item.path
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
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setAccountOpen(value => !value)}
                aria-expanded={accountOpen}
                aria-label="Open account menu"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 999,
                  background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: accent,
                  color: 'white', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700,
                  overflow: 'hidden',
                }}>{avatarUrl ? <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initialsMode ? initialsOf(displayName) : <UserRound size={16} strokeWidth={1.8} />}</div>
                <div style={{ fontSize: 12 }} className="hp-user-meta">
                  <div style={{ fontWeight: 600 }}>{displayName}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{role}</div>
                </div>
              </button>
              {accountOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 10px)', minWidth: 238, padding: 8,
                  background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 12,
                  boxShadow: '0 14px 34px rgba(11, 7, 20, .28)', zIndex: 20,
                }}>
                  <div style={{ padding: '7px 10px 9px', borderBottom: '1px solid var(--border-color)', marginBottom: 6 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>Account</div>
                    <div style={{ marginTop: 3, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{displayName}</div>
                  </div>
                  <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar} className="hp-account-action">
                    <Camera size={16} />
                    <span>{uploadingAvatar ? 'Uploading picture...' : avatarUrl ? 'Change profile picture' : 'Add profile picture'}</span>
                  </button>
                  <button type="button" onClick={initialsMode ? useAvatarIcon : useInitials} disabled={uploadingAvatar} className="hp-account-action">
                    {initialsMode ? <UserRound size={16} /> : <User size={16} />}
                    <span>{initialsMode ? 'Use avatar icon' : 'Use initials instead'}</span>
                  </button>
                  <button type="button" onClick={logout} className="hp-account-action hp-account-action-danger">
                    <LogOut size={16} />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <input ref={avatarInputRef} type="file" accept="image/*" onChange={updateAvatar} style={{ display: 'none' }} aria-label="Upload profile picture" />
        <div style={{ padding: 'clamp(14px, 3vw, 28px)' }}>{children}</div>
      </main>
    </div>
  )
}
