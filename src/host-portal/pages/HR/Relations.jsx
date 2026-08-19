import ComingSoon from '../../components/ComingSoon.jsx'
export default function Relations() {
  return (
    <ComingSoon title="Employee Relations"
      tagline="A single hub for grievances, disciplinary cases, warnings, wellness/EAP, satisfaction surveys, exit interviews, and CCMA documentation — all with confidential audit trails."
      features={[
        { icon: '⚖', title: 'Grievance & disciplinary', body: 'Case files, warnings register, and CCMA-ready documentation.' },
        { icon: '💛', title: 'Wellness & EAP', body: 'Anonymous access to counselling and mental health support.' },
        { icon: '📊', title: 'Satisfaction surveys', body: 'Pulse and annual surveys with trend analytics.' },
        { icon: '👋', title: 'Exit interviews', body: 'Structured exit workflows and offboarding.' },
        { icon: '🏆', title: 'Recognition', body: 'Peer-nominated recognition and rewards.' },
        { icon: '📜', title: 'Policy acknowledgement', body: 'Track who has read and acknowledged each policy.' },
      ]}
    />
  )
}
