import { Routes, Route, Navigate } from 'react-router-dom'
import HostDashboard from './pages/Host/HostDashboard.jsx'
import PlacedLearners from './pages/Host/PlacedLearners.jsx'
import Performance from './pages/Host/Performance.jsx'
import Onboarding from './pages/Host/Onboarding.jsx'
import Calendar from './pages/Host/Calendar.jsx'
import Projects from './pages/Host/Projects.jsx'
import Tasks from './pages/Host/Tasks.jsx'
import Documents from './pages/Host/Documents.jsx'
import Messages from './pages/Host/Messages.jsx'
import Reports from './pages/Host/Reports.jsx'
import Settings from './pages/Host/Settings.jsx'
import CompanyProfile from './pages/Host/CompanyProfile.jsx'
import HostCheck from './pages/Host/HostCheck.jsx'
import Marketplace from './pages/Host/Marketplace.jsx'
import HostRecruitment from './pages/Host/HostRecruitment.jsx'
import Workforce from './pages/Host/Workforce.jsx'
import KPI from './pages/Host/KPI.jsx'
import Contracts from './pages/Host/Contracts.jsx'
import Coaching from './pages/Host/Coaching.jsx'

import HRDashboard from './pages/HR/HRDashboard.jsx'
import HRAttendance from './pages/HR/HRAttendance.jsx'
import Leave from './pages/HR/Leave.jsx'
import Timesheets from './pages/HR/Timesheets.jsx'
import Relations from './pages/HR/Relations.jsx'
import Recruitment from './pages/HR/Recruitment.jsx'
import Talent from './pages/HR/Talent.jsx'
import Training from './pages/HR/Training.jsx'
import HRPerformance from './pages/HR/HRPerformance.jsx'
import HRAdmin from './pages/HR/HRAdmin.jsx'
import HRIntegrations from './pages/HR/HRIntegrations.jsx'
import HRDocuments from './pages/HR/Documents.jsx'
import Payroll from './pages/HR/Payroll.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/host" replace />} />
      {/* Host Portal */}
      <Route path="/host" element={<HostDashboard />} />
      <Route path="/host/learners" element={<PlacedLearners />} />
      <Route path="/host/marketplace" element={<Marketplace />} />
      <Route path="/host/recruitment" element={<HostRecruitment />} />
      <Route path="/host/workforce" element={<Workforce />} />
      <Route path="/host/kpi" element={<KPI />} />
      <Route path="/host/contracts" element={<Contracts />} />
      <Route path="/host/coaching" element={<Coaching />} />
      <Route path="/host/performance" element={<Performance />} />
      <Route path="/host/onboarding" element={<Onboarding />} />
      <Route path="/host/calendar" element={<Calendar />} />
      <Route path="/host/schedule" element={<Navigate to="/host/calendar" replace />} />
      <Route path="/host/projects" element={<Projects />} />
      <Route path="/host/tasks" element={<Tasks />} />
      <Route path="/host/documents" element={<Documents />} />
      <Route path="/host/messages" element={<Messages />} />
      <Route path="/host/reports" element={<Reports />} />
      <Route path="/host/company" element={<CompanyProfile />} />
      <Route path="/host/check" element={<HostCheck />} />
      <Route path="/host/settings" element={<Settings />} />
      {/* legacy */}
      <Route path="/host/attendance" element={<Navigate to="/hr/attendance" replace />} />

      {/* HR Portal */}
      <Route path="/hr" element={<HRDashboard />} />
      <Route path="/hr/attendance" element={<HRAttendance />} />
      <Route path="/hr/leave" element={<Leave />} />
      <Route path="/hr/timesheets" element={<Timesheets />} />
      <Route path="/hr/relations" element={<Relations />} />
      <Route path="/hr/recruitment" element={<Recruitment />} />
      <Route path="/hr/talent" element={<Talent />} />
      <Route path="/hr/training" element={<Training />} />
      <Route path="/hr/performance" element={<HRPerformance />} />
      <Route path="/hr/admin" element={<HRAdmin />} />
      <Route path="/hr/integrations" element={<HRIntegrations />} />
      <Route path="/hr/documents" element={<HRDocuments />} />
      <Route path="/hr/payroll" element={<Payroll />} />
      {/* legacy HR under /host/hr/* */}
      <Route path="/host/hr" element={<Navigate to="/hr" replace />} />
      <Route path="/host/hr/leave" element={<Navigate to="/hr/leave" replace />} />
      <Route path="/host/hr/timesheets" element={<Navigate to="/hr/timesheets" replace />} />
      <Route path="/host/hr/relations" element={<Navigate to="/hr/relations" replace />} />
      <Route path="/host/hr/recruitment" element={<Navigate to="/hr/recruitment" replace />} />
      <Route path="/host/hr/talent" element={<Navigate to="/hr/talent" replace />} />
      <Route path="/host/hr/training" element={<Navigate to="/hr/training" replace />} />
      <Route path="/host/hr/performance" element={<Navigate to="/hr/performance" replace />} />
      <Route path="/host/hr/admin" element={<Navigate to="/hr/admin" replace />} />
      <Route path="/host/hr/integrations" element={<Navigate to="/hr/integrations" replace />} />
      <Route path="/host/hr/documents" element={<Navigate to="/hr/documents" replace />} />
      <Route path="/host/hr/payroll" element={<Navigate to="/hr/payroll" replace />} />
      <Route path="/host/hr/attendance" element={<Navigate to="/hr/attendance" replace />} />

      <Route path="*" element={<Navigate to="/host" replace />} />
    </Routes>
  )
}
