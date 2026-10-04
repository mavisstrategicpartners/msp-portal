import { useLocation, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  ClipboardList,
  Users,
  Briefcase,
  BarChart3,
  Crown,
  BookOpen,
  Settings,
  Wrench,
  FileText,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Layers,
  Sparkles,
  Building2,
  CheckSquare,
  FileSignature
} from 'lucide-react'

const hrNav = [
  { name: 'HR Dashboard', path: '/host/hr', altPath: '/hr', icon: LayoutDashboard },
  { name: 'Live Presence', path: '/admin/attendance', external: true, icon: Clock },
  { name: 'Leave Management', path: '/host/hr/leave', altPath: '/hr/leave', icon: CalendarDays },
  { name: 'Timesheets', path: '/host/hr/timesheets', altPath: '/hr/timesheets', icon: ClipboardList },
  { name: 'Employee Relations', path: '/host/hr/relations', altPath: '/hr/relations', icon: Users },
  { name: 'Recruitment', path: '/host/hr/recruitment', altPath: '/hr/recruitment', icon: Briefcase },
  { name: 'HR Performance', path: '/host/hr/performance', altPath: '/hr/performance', icon: BarChart3 },
  { name: 'Talent Management', path: '/host/hr/talent', altPath: '/hr/talent', icon: Crown },
  { name: 'Training & Development', path: '/host/hr/training', altPath: '/hr/training', icon: BookOpen },
  { name: 'HR Administration', path: '/host/hr/admin', altPath: '/hr/admin', icon: Settings },
  { name: 'Integrations', path: '/host/hr/integrations', altPath: '/hr/integrations', icon: Wrench },
]

const hostNav = [
  { name: 'Dashboard', path: '/host', icon: LayoutDashboard },
  { name: 'Workforce', path: '/host/workforce', icon: Users },
  { name: 'Performance', path: '/host/performance', icon: BarChart3 },
  { name: 'Coaching', path: '/host/coaching', icon: FileSignature },
  { name: 'Onboarding', path: '/host/onboarding', icon: CheckSquare },
  { name: 'Recruitment', path: '/host/recruitment', icon: Briefcase },
  { name: 'Employer Check', path: '/host/check', icon: ShieldCheck },
  { name: 'Calendar', path: '/host/calendar', icon: CalendarDays },
  { name: 'Projects', path: '/host/projects', icon: Briefcase },
  { name: 'Tasks', path: '/host/tasks', icon: CheckSquare },
  { name: 'KPIs', path: '/host/kpi', icon: BarChart3 },
  { name: 'Contracts', path: '/host/contracts', icon: FileText },
  { name: 'Documents', path: '/host/documents', icon: BookOpen },
  { name: 'Company Profile', path: '/host/company', icon: Building2 },
  { name: 'Settings', path: '/host/settings', icon: Settings },
]

export default function DashboardLayout({ children, title }) {
  const location = useLocation()
  const navigate = useNavigate()

  const isHR = location.pathname.startsWith('/hr') || location.pathname.startsWith('/host/hr')
  const currentNav = isHR ? hrNav : hostNav
  const portalLabel = isHR ? 'Human Resources Suite' : 'Host Employer Operations'
  const portalBadge = isHR ? 'HR Portal' : 'Host Portal'

  const handleNav = (item) => {
    if (item.external) {
      window.location.href = item.path
      return
    }
    navigate(item.path)
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top HR / Host Navigation Header Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>MSP All-in-One</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-primary">{portalBadge}</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-foreground">{title}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
          </div>

          {/* Quick Workspace Switcher (Host vs HR) */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="flex rounded-lg border border-border bg-muted/60 p-1">
              <button
                type="button"
                onClick={() => { window.location.href = '/host/workforce' }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  !isHR
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Host Ops</span>
              </button>
              <button
                type="button"
                onClick={() => { navigate('/host/hr') }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  isHR
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>HR Module</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Pill Tabs */}
        <div className="mt-4 border-t border-border/60 pt-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {currentNav.map((item) => {
              const Icon = item.icon
              const isActive =
                location.pathname === item.path ||
                (item.altPath && location.pathname === item.altPath) ||
                (item.path !== '/host/hr' && item.path !== '/hr' && item.path !== '/host' && location.pathname.startsWith(item.path)) ||
                (item.altPath && item.altPath !== '/hr' && location.pathname.startsWith(item.altPath))

              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item)}
                  type="button"
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="min-w-0">
        {children}
      </div>
    </div>
  )
}
