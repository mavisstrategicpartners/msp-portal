import { PageHeader } from '@/components/layout/page'

// Navigation for the HR pages lives in src/lib/navigation.ts (main MSP sidebar).
// The page header follows the shared MSP design standard (src/components/layout/page.tsx).
export default function DashboardLayout({ children, title, description, actions }) {
  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader eyebrow="HR workspace" title={title} description={description} actions={actions} />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
