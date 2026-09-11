import ComingSoon from '../../components/ComingSoon.jsx'
import { Scale, HeartPulse, BarChart3, LogOut, Award, FileText } from 'lucide-react'
export default function Relations() {
  return (
    <ComingSoon title="Employee Relations"
      tagline="A single hub for grievances, disciplinary cases, warnings, wellness/EAP, satisfaction surveys, exit interviews, and CCMA documentation — all with confidential audit trails."
      features={[
        { icon: Scale, title: 'Grievance & disciplinary', body: 'Case files, warnings register, and CCMA-ready documentation.' },
        { icon: HeartPulse, title: 'Wellness & EAP', body: 'Anonymous access to counselling and mental health support.' },
        { icon: BarChart3, title: 'Satisfaction surveys', body: 'Pulse and annual surveys with trend analytics.' },
        { icon: LogOut, title: 'Exit interviews', body: 'Structured exit workflows and offboarding.' },
        { icon: Award, title: 'Recognition', body: 'Peer-nominated recognition and rewards.' },
        { icon: FileText, title: 'Policy acknowledgement', body: 'Track who has read and acknowledged each policy.' },
      ]}
    />
  )
}
