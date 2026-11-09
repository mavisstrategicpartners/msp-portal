import { ChevronRight } from 'lucide-react'

// Navigation for the HR pages lives in src/lib/navigation.ts (main MSP sidebar).
export default function DashboardLayout({ children, title }) {
  const portalBadge = 'HR Portal'

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
