import { Routes, Route, Navigate } from 'react-router-dom'

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
      <Route path="/" element={<Navigate to="/host/hr" replace />} />
      <Route path="/host" element={<Navigate to="/host/hr" replace />} />

      {/* HR Portal Direct & Legacy Routes */}
      <Route path="/hr" element={<HRDashboard />} />
      <Route path="/host/hr" element={<HRDashboard />} />

      <Route path="/hr/attendance" element={<HRAttendance />} />
      <Route path="/host/hr/attendance" element={<HRAttendance />} />

      <Route path="/hr/leave" element={<Leave />} />
      <Route path="/host/hr/leave" element={<Leave />} />

      <Route path="/hr/timesheets" element={<Timesheets />} />
      <Route path="/host/hr/timesheets" element={<Timesheets />} />

      <Route path="/hr/relations" element={<Relations />} />
      <Route path="/host/hr/relations" element={<Relations />} />

      <Route path="/hr/recruitment" element={<Recruitment />} />
      <Route path="/host/hr/recruitment" element={<Recruitment />} />

      <Route path="/hr/talent" element={<Talent />} />
      <Route path="/host/hr/talent" element={<Talent />} />

      <Route path="/hr/training" element={<Training />} />
      <Route path="/host/hr/training" element={<Training />} />

      <Route path="/hr/performance" element={<HRPerformance />} />
      <Route path="/host/hr/performance" element={<HRPerformance />} />

      <Route path="/hr/admin" element={<HRAdmin />} />
      <Route path="/host/hr/admin" element={<HRAdmin />} />

      <Route path="/hr/integrations" element={<HRIntegrations />} />
      <Route path="/host/hr/integrations" element={<HRIntegrations />} />

      <Route path="/hr/documents" element={<HRDocuments />} />
      <Route path="/host/hr/documents" element={<HRDocuments />} />

      <Route path="/hr/payroll" element={<Payroll />} />
      <Route path="/host/hr/payroll" element={<Payroll />} />

      <Route path="*" element={<Navigate to="/host/hr" replace />} />
    </Routes>
  )
}
