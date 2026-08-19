import ComingSoon from '../../components/ComingSoon.jsx'
export default function Talent() {
  return (
    <ComingSoon title="Talent Management"
      tagline="Succession planning, skills matrices, career paths, competency frameworks, and internal mobility — one workspace for every talent decision."
      features={[
        { icon: '👑', title: 'Succession planning', body: 'Identify successors for every critical role.' },
        { icon: '🧭', title: 'Career paths', body: 'Visualise growth journeys and lateral moves.' },
        { icon: '🧬', title: 'Skills matrix', body: 'Score every competency across your team.' },
        { icon: '🌟', title: 'High potential', body: 'Spot rising stars and readiness levels.' },
        { icon: '🗺', title: 'IDPs', body: 'Individual Development Plans with progress tracking.' },
        { icon: '📈', title: 'Talent analytics', body: 'Bench strength and internal mobility rates.' },
      ]}
    />
  )
}
