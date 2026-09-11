import ComingSoon from '../../components/ComingSoon.jsx'
import { GraduationCap, FileText, Scale, BarChart3, ClipboardList, Target } from 'lucide-react'
export default function Training() {
  return (
    <ComingSoon title="Training & Development"
      tagline="Full LMS, skills gap analysis, mandatory compliance training, certification tracking, WSP/ATR reporting, and CPD — everything you need to grow your people."
      features={[
        { icon: GraduationCap, title: 'Learning Management', body: 'Online, classroom, and webinar training in one catalogue.' },
        { icon: FileText, title: 'Certification tracking', body: 'Expiry alerts and renewal workflows.' },
        { icon: Scale, title: 'Compliance training', body: 'Mandatory training coverage across your workforce.' },
        { icon: BarChart3, title: 'Skills gap analysis', body: 'Identify gaps between required and actual competencies.' },
        { icon: ClipboardList, title: 'WSP & ATR', body: 'Workplace Skills Plan and Annual Training Report exports.' },
        { icon: Target, title: 'CPD tracking', body: 'Continuous professional development points.' },
      ]}
    />
  )
}
