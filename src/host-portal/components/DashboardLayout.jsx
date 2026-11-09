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
  ChevronRight,
} from 'lucide-react'

const hrNav = [
  { name: 'HR Dashboard', path: '/host/hr', altPath: '/hr', icon: LayoutDashboard },
  { name: 'Live Presence', path: '/hr/attendance', external: true, icon: Clock },
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



export default function DashboardLayout({ children, title }) {
  const location = useLocation()
  const navigate = useNavigate()

  const currentNav = hrNav
  const portalLabel = 'Human Resources Suite'
  const portalBadge = 'HR Portal'

  const handleNav = (item) => {
    if (item.altPath) {
      window.location.href = item.altPath;
      return;
    }
    if (item.external) {
      window.location.href = item.path;
      return;
    }
    navigate(item.path);
  };

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


        </div>
      </div>

      {/* Page Content */}
      <div className="min-w-0">
        {children}
      </div>
    </div>
  )
}
