import ComingSoon from '../../components/ComingSoon.jsx'
export default function Training() {
  return (
    <ComingSoon title="Training & Development"
      tagline="Full LMS, skills gap analysis, mandatory compliance training, certification tracking, WSP/ATR reporting, and CPD — everything you need to grow your people."
      features={[
        { icon: '🎓', title: 'Learning Management', body: 'Online, classroom, and webinar training in one catalogue.' },
        { icon: '📜', title: 'Certification tracking', body: 'Expiry alerts and renewal workflows.' },
        { icon: '⚖', title: 'Compliance training', body: 'Mandatory training coverage across your workforce.' },
        { icon: '📊', title: 'Skills gap analysis', body: 'Identify gaps between required and actual competencies.' },
        { icon: '📝', title: 'WSP & ATR', body: 'Workplace Skills Plan and Annual Training Report exports.' },
        { icon: '🎯', title: 'CPD tracking', body: 'Continuous professional development points.' },
      ]}
    />
  )
}
