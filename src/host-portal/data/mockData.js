// Mock data for the Host + HR portals (Mavis Strategic Partners Pty Ltd)

export const HOST_COMPANY = 'Mavis Strategic Partners'
export const OTHER_HOST_COMPANIES = ['Aurora Digital', 'Kopano Cloud', 'Ubuntu Analytics', 'Sanele Systems']

const firstNames = ['Sipho','Lerato','Naledi','Bongani','Karabo','Anele','Themba','Zinhle','Lwazi','Palesa','Kagiso','Nomvula','Mandla','Refilwe','Tumelo','Boitumelo','Sibusiso','Nokuthula']
const lastNames = ['Dlamini','Khumalo','Mokoena','Nkosi','Mthembu','Zulu','Ndlovu','Sithole','Mahlangu','Radebe','Sibiya','Mokwena','Hlongwane','Khoza']
const programs = ['Software Development NQF5','Data Analytics NQF5','Cloud Engineering NQF6','Cybersecurity NQF5','UX/UI Design NQF5']
const statuses = ['Active','On Leave','Completed','At Risk']

export const hostProfile = {
  company_name: 'Mavis Strategic Partners (Pty) Ltd',
  contact_person: 'Thandi Mokoena',
  contact_title: 'HR & Talent Lead',
  email: 'thandi@linkora.co.za',
  alt_email: 'ops@linkora.co.za',
  phone: '+27 11 555 1234',
  industry: 'Information Technology',
  sector: 'ICT & Digital Services',
  address: '12 Innovation Drive, Sandton, Johannesburg, 2196',
  registration_number: '2018/456123/07',
  bbbee_level: 'Level 2',
  years_operating: 8,
  footprint: 'Gauteng · Western Cape · KZN',
  website: 'https://linkora.co.za',
  employees: 84,
  learners_current: 18,
  learners_previous: 46,
  last_intake: '2026-04-15',
  learners_requested: 8,
  roles_needed: 'Junior software developers, UX design apprentices, cloud engineering learners',
  disability_accommodation: 'Yes',
  disability_types: 'Physical mobility, hearing impairment',
  virtual_site_visit: true,
  proximity_transport: 'Walking distance to Gautrain Sandton',
  learner_capacity: 25,
  current_placements: 18,
  approval_status: 'Approved',
  company_bio: 'Mavis Strategic Partners is a South African technology services firm building enterprise cloud, data, and product platforms for local financial services and retail clients. We invest in workplace-based learning as a talent pipeline.',
  open_to_host: true,
  manager: { name: 'Thandi Mokoena', role: 'HR & Talent Lead', email: 'thandi@linkora.co.za', phone: '+27 11 555 1234' },
  departments: ['Engineering', 'Design', 'Data', 'People Ops'],
  programs: ['Software Development NQF5','Data Analytics NQF5','Cloud Engineering NQF6','Cybersecurity NQF5','UX/UI Design NQF5'],
}

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)] }

export const seedLearners = Array.from({ length: 18 }, (_, i) => {
  const fn = firstNames[i % firstNames.length], ln = lastNames[i % lastNames.length]
  return {
    id: `L-${1001 + i}`,
    full_name: `${fn} ${ln}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@learner.co.za`,
    phone: `+27 8${i % 5} 555 ${1000 + i}`,
    program: programs[i % programs.length],
    company: HOST_COMPANY,
    mentor: rand(firstNames) + ' ' + rand(lastNames),
    mentor_phone: `+27 82 555 ${2000 + i}`,
    sponsor: ['MerSETA','Services SETA','BankSETA','MICT SETA'][i % 4],
    start_date: `2025-${String(1 + (i % 9)).padStart(2,'0')}-${String(5 + (i % 20)).padStart(2,'0')}`,
    end_date: `2026-${String(1 + (i % 12)).padStart(2,'0')}-15`,
    status: statuses[i % statuses.length],
    attendance_rate: 70 + (i * 3) % 30,
    performance_score: 60 + (i * 5) % 40,
    progress: (i * 11) % 100,
    bio: 'Enthusiastic learner working through a workplace-based rotation programme. Reliable, coachable and a strong team contributor.',
    skills: ['Communication', 'Teamwork', i % 2 ? 'JavaScript' : 'Python', i % 3 ? 'SQL' : 'Excel'],
    disability: i % 7 === 0 ? 'Hearing impairment' : null,
    location: ['Johannesburg','Cape Town','Pretoria','Durban'][i % 4],
    qualifications: ['NQF Level 5 Certificate', 'Matric with Distinction in Maths'],
    experience: `${(i % 4) + 1} months workplace exposure`,
  }
})

// Learners available across all providers (privacy-preserving: no host activity attached)
export const seedAvailableLearners = [
  { id: 'AL-1', full_name: 'Neo Mabaso', program: 'Software Development NQF5', provider: 'CoTech Academy', years_experience: 1, availability: 'Immediate', location: 'Johannesburg', skills: ['React','Node.js','SQL'], bio: 'Recently completed a 6-month bootcamp with distinction, looking for a first placement.', disability: null, match_score: 92, industry: 'Technology', match_reasons: ['Skills: React + Node.js aligned', 'Located in Johannesburg', 'Immediate start'] },
  { id: 'AL-2', full_name: 'Ayanda Pillay', program: 'Data Analytics NQF5', provider: 'Skillup SA', years_experience: 2, availability: 'Immediate', location: 'Cape Town', skills: ['Power BI','Python','SQL'], bio: 'Analyst with retail-sector experience seeking a stretch placement in fintech or SaaS.', disability: null, match_score: 88, industry: 'Data & Analytics', match_reasons: ['NQF5 Data Analytics matches your need', 'Sector alignment: fintech'] },
  { id: 'AL-3', full_name: 'Junior Baloyi', program: 'Cybersecurity NQF5', provider: 'CyberHub', years_experience: 0, availability: '2 weeks', location: 'Pretoria', skills: ['Linux','Networking','SIEM basics'], bio: 'Passionate about blue-team work. Currently studying CompTIA Security+.', disability: 'Mobility (wheelchair)', match_score: 84, industry: 'Cybersecurity', match_reasons: ['Cybersecurity NQF5', 'Inclusive: mobility accommodation supported'] },
  { id: 'AL-4', full_name: 'Refiloe Mahlangu', program: 'UX/UI Design NQF5', provider: 'Design Hive', years_experience: 1, availability: 'Immediate', location: 'Remote', skills: ['Figma','User research','Prototyping'], bio: 'UX designer focused on accessibility and inclusive design patterns.', disability: null, match_score: 90, industry: 'Design', match_reasons: ['UX/UI Design matches open role', 'Remote availability'] },
  { id: 'AL-5', full_name: 'Tshepo Radebe', program: 'Cloud Engineering NQF6', provider: 'CloudNative Institute', years_experience: 2, availability: '1 month', location: 'Johannesburg', skills: ['AWS','Terraform','Docker'], bio: 'Cloud engineer with hands-on AWS work. AWS Solutions Architect Associate certified.', disability: null, match_score: 95, industry: 'Cloud', match_reasons: ['AWS + Terraform match your stack', 'NQF6 level', 'Local — Johannesburg'] },
  { id: 'AL-6', full_name: 'Zanele Cele', program: 'Software Development NQF5', provider: 'CoTech Academy', years_experience: 0, availability: 'Immediate', location: 'Durban', skills: ['HTML','CSS','JavaScript'], bio: 'Junior full-stack learner ready to be placed in a supportive engineering team.', disability: 'Hearing impairment', match_score: 78, industry: 'Technology', match_reasons: ['Software Dev NQF5', 'Inclusive: hearing accommodation supported'] },
]

export const seedAttendance = (() => {
  const recs = []
  const today = new Date()
  seedLearners.forEach((l, li) => {
    for (let d = 0; d < 10; d++) {
      const dt = new Date(today); dt.setDate(today.getDate() - d)
      const r = ((li * 7 + d * 13) % 100) / 100
      recs.push({
        id: `${l.id}-${d}`,
        learner_id: l.id,
        learner_name: l.full_name,
        sponsor: l.sponsor,
        host: HOST_COMPANY,
        mentor: l.mentor,
        mentor_phone: l.mentor_phone,
        contact: l.phone,
        date: dt.toISOString().slice(0, 10),
        status: r > 0.9 ? 'Absent' : r > 0.85 ? 'On Leave' : r > 0.75 ? 'Clocked Out' : r > 0.4 ? 'Present' : 'Clocked In',
        leave_flags: { SL: r > 0.9 && r < 0.92, PH: false, AL: r > 0.85 && r < 0.9, CL: false },
        check_in: r > 0.8 ? '09:15' : '08:02',
        check_out: '17:01',
      })
    }
  })
  return recs
})()

export const seedPerformance = seedLearners.slice(0, 12).map((l, i) => ({
  id: `R-${i + 1}`,
  learner_id: l.id,
  learner_name: l.full_name,
  review_date: `2025-${String(6 + (i % 4)).padStart(2, '0')}-${String(10 + i).padStart(2, '0')}`,
  reviewer: 'Thandi Mokoena',
  technical: 3 + (i % 3),
  communication: 3 + ((i + 1) % 3),
  teamwork: 3 + ((i + 2) % 3),
  attitude: 3 + ((i + 1) % 3),
  notes: 'Solid progress this period. Continue to focus on documentation and code reviews.',
}))

export const seedOnboarding = seedLearners.slice(0, 10).map((l, i) => {
  const tasks = [
    { name: 'Site Induction', done: true },
    { name: 'Health & Safety Briefing', done: true },
    { name: 'IT Equipment Issued', done: i % 3 !== 0 },
    { name: 'Email & Slack Access', done: i % 4 !== 0 },
    { name: 'Mentor Assigned', done: i % 5 !== 0 },
    { name: 'First Project Brief', done: i % 2 === 0 },
    { name: 'Probation Review', done: i < 3 },
  ]
  const done = tasks.filter(t => t.done).length
  return {
    learner_id: l.id, learner_name: l.full_name, program: l.program,
    started: l.start_date, tasks, progress: Math.round((done / tasks.length) * 100),
  }
})

export const seedCalendar = [
  { id: 'E1', date: '2026-07-02', time: '09:00', title: 'Learner Induction', type: 'Induction', location: 'Head office', link: '', mandatory_attendance: true, description: 'Welcome and site induction for new intake.' },
  { id: 'E2', date: '2026-07-03', time: '14:00', title: 'Mid-term Performance Reviews', type: 'Review', location: 'Boardroom A', link: '', mandatory_attendance: false, description: 'Quarterly one-on-one reviews.' },
  { id: 'E3', date: '2026-07-05', time: '10:30', title: 'Mentor Sync — Cloud Engineering group', type: 'Meeting', location: 'MS Teams', link: 'https://teams.microsoft.com/meet/xyz', mandatory_attendance: false, description: '' },
  { id: 'E4', date: '2026-07-08', time: '09:00', title: 'Soft Skills Workshop', type: 'Workshop', location: 'Training Room', link: '', mandatory_attendance: false, description: '' },
  { id: 'E5', date: '2026-07-10', time: '13:00', title: 'Absorption Review', type: 'Review', location: 'Boardroom B', link: '', mandatory_attendance: false, description: 'Discuss potential absorption candidates into permanent roles.' },
]

export const seedDocuments = [
  { id: 'D1', name: 'Host Agreement — Cohort 2026.pdf', category: 'Agreement', size: '482 KB', uploaded: '2026-01-12', requires_signature: true, signed: false, review_status: 'Pending', verification: { status: 'Verified', score: 92, reasons: ['Metadata intact'] } },
  { id: 'D2', name: 'Health & Safety Policy v3.pdf', category: 'Policy', size: '210 KB', uploaded: '2026-02-04', requires_signature: true, signed: false, review_status: 'Pending', verification: { status: 'Verified', score: 88, reasons: ['Metadata intact'] } },
  { id: 'D3', name: 'Site Induction Slides.pdf', category: 'Training', size: '3.4 MB', uploaded: '2026-03-22', requires_signature: false, signed: false, review_status: 'N/A', verification: { status: 'Verified', score: 96, reasons: ['Trusted uploader'] } },
  { id: 'D4', name: 'Learner Code of Conduct.pdf', category: 'Policy', size: '180 KB', uploaded: '2026-03-22', requires_signature: true, signed: false, review_status: 'Pending', verification: { status: 'Needs Review', score: 65, reasons: ['Modification date differs from creation date'] } },
  { id: 'D5', name: 'Mentor Handbook.pdf', category: 'Guide', size: '1.1 MB', uploaded: '2026-04-09', requires_signature: false, signed: false, review_status: 'N/A', verification: { status: 'Verified', score: 91, reasons: ['Trusted uploader'] } },
]

export const DOCUMENT_CATEGORIES = ['Agreement', 'Policy', 'Training', 'Guide', 'Contract', 'ID Document', 'Qualification', 'POPIA Consent', 'Medical', 'Other']

export const seedMessages = [
  { id: 'M1', from: 'Head Office', preview: 'Please confirm intake numbers for July.', time: '2h ago', unread: true },
  { id: 'M2', from: 'Sipho Dlamini', preview: 'Can I take Friday off for an exam?', time: '5h ago', unread: true },
  { id: 'M3', from: 'HR Department', preview: 'Mid-quarter progress report is due next week.', time: '1d ago', unread: false },
  { id: 'M4', from: 'Naledi Nkosi', preview: 'Uploaded my latest assignment for review.', time: '2d ago', unread: false },
]

export const dashboardStats = {
  active_learners: 18, capacity: 25, avg_attendance: 92, avg_performance: 78,
  open_reviews: 4, upcoming_events: 5, vacant_positions: 3, interviews_scheduled: 6,
}

// ------- Projects & Tasks -------
export const PROJECT_STATUSES = ['To Do', 'In Progress', 'Review', 'Completed']
export const PROJECT_PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

export const seedProjects = [
  { id: 'P-1', name: 'Customer Portal Rebuild', client: 'Retail SA', description: 'Redesign and rebuild the customer-facing portal using React and a headless CMS.', status: 'In Progress', priority: 'High', start_date: '2026-05-01', end_date: '2026-09-30', lead: 'Thandi Mokoena', assigned_learner_ids: ['L-1001', 'L-1002', 'L-1006'] },
  { id: 'P-2', name: 'Data Warehouse Migration', client: 'Internal', description: 'Migrate on-prem reporting DB to a cloud data warehouse and set up Power BI dashboards.', status: 'To Do', priority: 'Medium', start_date: '2026-07-15', end_date: '2026-12-15', lead: 'Sipho Dlamini', assigned_learner_ids: ['L-1004'] },
  { id: 'P-3', name: 'Security Hardening Sprint', client: 'Kopano Cloud', description: 'Patch, audit and document security controls across the shared infrastructure.', status: 'Review', priority: 'Critical', start_date: '2026-06-10', end_date: '2026-07-31', lead: 'Bongani Zulu', assigned_learner_ids: ['L-1003', 'L-1005'] },
  { id: 'P-4', name: 'Internal Onboarding Rewrite', client: 'Internal', description: 'Streamline onboarding checklists into an automated flow.', status: 'Completed', priority: 'Medium', start_date: '2026-02-01', end_date: '2026-04-30', lead: 'Naledi Nkosi', assigned_learner_ids: ['L-1007'] },
]

export const TASK_STATUSES = ['To Do', 'In Progress', 'Review', 'Completed']
export const seedTasks = [
  { id: 'T-1', title: 'Set up React project scaffolding', project_id: 'P-1', assignee_learner_id: 'L-1001', status: 'Completed', priority: 'High', due_date: '2026-05-10', description: 'Vite + React + Tailwind starter, linting, CI.' },
  { id: 'T-2', title: 'Build authentication screens', project_id: 'P-1', assignee_learner_id: 'L-1002', status: 'In Progress', priority: 'High', due_date: '2026-07-15', description: 'Sign-in, sign-up, password reset UI.' },
  { id: 'T-3', title: 'Data model workshop', project_id: 'P-2', assignee_learner_id: 'L-1004', status: 'To Do', priority: 'Medium', due_date: '2026-07-25', description: 'Facilitate a two-hour workshop with stakeholders.' },
  { id: 'T-4', title: 'Patch all Ubuntu servers', project_id: 'P-3', assignee_learner_id: 'L-1005', status: 'In Progress', priority: 'Critical', due_date: '2026-07-05', description: 'Kernel + package updates + reboot windows.' },
  { id: 'T-5', title: 'Write incident-response playbook', project_id: 'P-3', assignee_learner_id: 'L-1003', status: 'Review', priority: 'High', due_date: '2026-07-20', description: 'Draft the initial playbook for review by the security lead.' },
  { id: 'T-6', title: 'Kick-off meeting summary', project_id: 'P-4', assignee_learner_id: 'L-1007', status: 'Completed', priority: 'Low', due_date: '2026-02-05', description: '' },
]

// ------- HR seed data -------
export const LEAVE_TYPES = ['Annual', 'Sick', 'Family Responsibility', 'Maternity', 'Paternity', 'Study', 'Compassionate']

export const seedEmployees = [
  { id: 'E-1', full_name: 'Thandi Mokoena', role: 'HR & Talent Lead', department: 'People Ops', email: 'thandi@linkora.co.za', phone: '+27 11 555 1234', employment_type: 'Permanent', join_date: '2020-03-15', manager: 'Board', gender: 'Female', age_band: '30-39' },
  { id: 'E-2', full_name: 'Sipho Dlamini', role: 'Senior Cloud Engineer', department: 'Engineering', email: 'sipho@linkora.co.za', phone: '+27 82 555 1122', employment_type: 'Permanent', join_date: '2021-07-01', manager: 'Thandi Mokoena', gender: 'Male', age_band: '30-39' },
  { id: 'E-3', full_name: 'Lerato Khumalo', role: 'Data Analyst', department: 'Data', email: 'lerato@linkora.co.za', phone: '+27 82 555 3344', employment_type: 'Contract', join_date: '2023-01-10', manager: 'Sipho Dlamini', gender: 'Female', age_band: '20-29' },
  { id: 'E-4', full_name: 'Naledi Nkosi', role: 'Product Designer', department: 'Design', email: 'naledi@linkora.co.za', phone: '+27 82 555 5566', employment_type: 'Permanent', join_date: '2022-05-04', manager: 'Thandi Mokoena', gender: 'Female', age_band: '20-29' },
  { id: 'E-5', full_name: 'Bongani Zulu', role: 'Security Engineer', department: 'Engineering', email: 'bongani@linkora.co.za', phone: '+27 82 555 7788', employment_type: 'Permanent', join_date: '2019-10-20', manager: 'Sipho Dlamini', gender: 'Male', age_band: '40-49' },
  { id: 'E-6', full_name: 'Karabo Mthembu', role: 'People Coordinator', department: 'People Ops', email: 'karabo@linkora.co.za', phone: '+27 82 555 9900', employment_type: 'Temporary', join_date: '2025-11-01', manager: 'Thandi Mokoena', gender: 'Female', age_band: '20-29' },
]

export const seedLeaveBalances = seedEmployees.map(e => ({
  employee_id: e.id, employee: e.full_name,
  Annual: 15 + (e.id.charCodeAt(2) % 6),
  Sick: 8, 'Family Responsibility': 3, Study: 5, Compassionate: 2,
}))

export const seedLeave = [
  { id: 'LV-1', employee: 'Thandi Mokoena', type: 'Annual', from: '2026-07-15', to: '2026-07-19', days: 5, status: 'Approved', reason: 'Family holiday' },
  { id: 'LV-2', employee: 'Sipho Dlamini', type: 'Sick', from: '2026-06-28', to: '2026-06-28', days: 1, status: 'Approved', reason: 'Flu' },
  { id: 'LV-3', employee: 'Lerato Khumalo', type: 'Study', from: '2026-08-02', to: '2026-08-04', days: 3, status: 'Pending', reason: 'Certification exam prep' },
]

export const seedLearnerLeaveRequests = [
  { id: 'LLV-1', learner_id: 'L-1001', learner_name: 'Sipho Dlamini', program: 'Software Development NQF5', type: 'Sick', from: '2026-07-02', to: '2026-07-03', days: 2, status: 'Pending', reason: 'Flu with fever, unable to attend site — see attached medical certificate.', submitted_at: '2026-07-01', document_name: 'Medical-Certificate-Sipho.pdf', document_url: null, document_type: 'application/pdf', doc_verification: { status: 'Verified', score: 86, reasons: ['Filename, size, and metadata all consistent'] } },
  { id: 'LLV-2', learner_id: 'L-1005', learner_name: 'Karabo Mthembu', program: 'Cybersecurity NQF5', type: 'Family Responsibility', from: '2026-07-06', to: '2026-07-08', days: 3, status: 'Pending', reason: 'Passing of my grandfather — attending funeral in Limpopo. Death certificate attached.', submitted_at: '2026-07-04', document_name: 'Death-Certificate-Family.pdf', document_url: null, document_type: 'application/pdf', doc_verification: { status: 'Needs Review', score: 62, reasons: ['Filename suggests screenshot rather than original scan'] } },
  { id: 'LLV-3', learner_id: 'L-1004', learner_name: 'Bongani Nkosi', program: 'Cloud Engineering NQF6', type: 'Study', from: '2026-07-10', to: '2026-07-10', days: 1, status: 'Approved', reason: 'AWS Solutions Architect exam — supporting registration attached.', submitted_at: '2026-06-28', document_name: 'AWS-Exam-Registration.pdf', document_url: null, document_type: 'application/pdf', decided_by: 'Thandi Mokoena', decided_at: '2026-06-29', doc_verification: { status: 'Verified', score: 94, reasons: ['Trusted external source'] } },
]

export const ATTENDANCE_STATUSES = ['Present', 'Clocked In', 'On Break', 'Clocked Out', 'On Leave', 'Absent']

export const seedTimesheets = [
  { id: 'TS-1', employee: 'Thandi Mokoena', date: '2026-06-30', clock_in: '08:00', clock_out: '17:00',
    projects: [ { name: 'HR Ops', hours: 4, manager_comment: 'Great progress on the recruitment pipeline.' }, { name: 'Recruitment Drive', hours: 4, manager_comment: 'Shortlisted 3 promising candidates.' } ],
    status: 'Present', notes: '' },
  { id: 'TS-2', employee: 'Sipho Dlamini', date: '2026-06-30', clock_in: '08:15', clock_out: '17:30',
    projects: [ { name: 'Cloud Migration', hours: 3, manager_comment: 'Blocked on IAM policy review.' }, { name: 'Customer Portal Rebuild', hours: 3.25, manager_comment: 'Auth screens delivered.' }, { name: 'Internal Tooling', hours: 2, manager_comment: '' } ],
    status: 'Clocked Out', notes: 'Split across three project streams.' },
  { id: 'TS-3', employee: 'Naledi Nkosi', date: '2026-06-30', clock_in: '09:00', clock_out: '',
    projects: [ { name: 'UX Research', hours: 4, manager_comment: 'User interviews completed.' }, { name: 'Design System', hours: 3, manager_comment: 'Colour tokens finalised.' } ],
    status: 'Clocked In', notes: '' },
  { id: 'TS-4', employee: 'Sipho Dlamini', date: '2026-06-27', clock_in: '08:00', clock_out: '17:00',
    projects: [ { name: 'Cloud Migration', hours: 2, manager_comment: '' }, { name: 'Customer Portal Rebuild', hours: 2, manager_comment: '' }, { name: 'Security Hardening Sprint', hours: 2, manager_comment: 'Ubuntu patches complete.' }, { name: 'Internal Tooling', hours: 1, manager_comment: '' }, { name: 'Data Warehouse Migration', hours: 1, manager_comment: '' } ],
    status: 'Present', notes: 'Very fragmented day — 5 projects.' },
  { id: 'TS-5', employee: 'Karabo Mthembu', date: '2026-06-30', clock_in: '', clock_out: '',
    projects: [], status: 'On Leave', notes: 'Approved family responsibility leave.' },
]

export const seedRelations = [
  { id: 'ER-1', employee: 'Bongani Zulu', type: 'Grievance', severity: 'Medium', date: '2026-06-20', status: 'Open', description: 'Concern about shift schedule fairness.' },
  { id: 'ER-2', employee: 'Karabo Sithole', type: 'Warning', severity: 'Low', date: '2026-06-15', status: 'Closed', description: 'Late arrival — verbal warning issued.' },
]

// Recruitment — restyled like SA Youth / PNet
export const VACANCY_TYPES = ['Full-time', 'Contract', 'Part-time', 'Intern', 'Leanership', 'Temporary']
export const seedVacancies = [
  { id: 'V-1', title: 'Junior Cloud Engineer', department: 'Engineering', type: 'Full-time', location: 'Sandton, JHB', posted: '2026-06-10', applicants: 12, status: 'Open', salary: 'R 18 000 – R 24 000', description: 'Support the cloud engineering team on AWS and Terraform-based projects. You will pair with senior engineers, review pull requests, and rotate through infrastructure, observability, and cost-optimisation tickets.', requirements: ['AWS fundamentals', 'Bash/Python basics', 'Interest in DevOps'], tags: ['AWS','Terraform','DevOps'], closes: '2026-07-31' },
  { id: 'V-2', title: 'UX Designer', department: 'Design', type: 'Contract', location: 'Remote', posted: '2026-06-18', applicants: 7, status: 'Open', salary: 'R 400 – R 550 / hr', description: 'Design accessible, inclusive product surfaces for our banking client. Ownership from research to prototyping.', requirements: ['Figma', 'Portfolio of shipped work', 'Accessibility awareness'], tags: ['Figma','A11y','Fintech'], closes: '2026-08-15' },
  { id: 'V-3', title: 'HR Coordinator', department: 'People Ops', type: 'Full-time', location: 'Sandton, JHB', posted: '2026-05-30', applicants: 22, status: 'Interviewing', salary: 'R 22 000 – R 28 000', description: 'Coordinate onboarding, employee records, and leave workflows across the team.', requirements: ['HR diploma or equivalent', '2+ years HR experience'], tags: ['HRIS','Payroll','People'], closes: '2026-07-10' },
  { id: 'V-4', title: 'Software Development Learnership', department: 'Engineering', type: 'Leanership', location: 'Sandton, JHB', posted: '2026-06-25', applicants: 41, status: 'Open', salary: 'Stipend R 6 000/month', description: '12-month workplace-based learnership for junior software developers. NQF Level 5.', requirements: ['Matric', 'Basic programming'], tags: ['NQF5','Java','Web'], closes: '2026-07-20' },
  { id: 'V-5', title: 'Data Analytics Intern', department: 'Data', type: 'Intern', location: 'Cape Town', posted: '2026-06-22', applicants: 33, status: 'Open', salary: 'Stipend R 8 500/month', description: '6-month internship in the data team. Support dashboarding, SQL, and reporting for the retail client.', requirements: ['Studying towards BSc or similar', 'SQL basics'], tags: ['SQL','Power BI'], closes: '2026-07-25' },
]

export const seedApplicants = [
  { id: 'A-1', name: 'Tebogo Mahlangu', vacancy: 'Junior Cloud Engineer', stage: 'Screening', score: 82, applied: '2026-06-12' },
  { id: 'A-2', name: 'Anele Radebe', vacancy: 'UX Designer', stage: 'Interview', score: 88, applied: '2026-06-19' },
  { id: 'A-3', name: 'Nomvula Sibiya', vacancy: 'HR Coordinator', stage: 'Offer', score: 91, applied: '2026-06-02' },
  { id: 'A-4', name: 'Kagiso Radebe', vacancy: 'Software Development Learnership', stage: 'Screening', score: 76, applied: '2026-06-26' },
]

export const seedTalent = [
  { id: 'T-1', employee: 'Thandi Mokoena', role: 'HR Lead', potential: 'High', readiness: 'Ready now', successor_for: 'HR Director', idp_progress: 75 },
  { id: 'T-2', employee: 'Sipho Dlamini', role: 'Cloud Engineer', potential: 'High', readiness: '1-2 years', successor_for: 'Tech Lead', idp_progress: 45 },
  { id: 'T-3', employee: 'Lerato Khumalo', role: 'Data Analyst', potential: 'Medium', readiness: '2-3 years', successor_for: '—', idp_progress: 30 },
]

export const seedTraining = [
  { id: 'TR-1', title: 'POPIA Awareness', type: 'Compliance', mode: 'Online', duration: '2h', enrolled: 24, completed: 20, deadline: '2026-08-30' },
  { id: 'TR-2', title: 'AWS Cloud Practitioner', type: 'Technical', mode: 'Online', duration: '20h', enrolled: 8, completed: 3, deadline: '2026-10-15' },
  { id: 'TR-3', title: 'Health & Safety Refresher', type: 'Compliance', mode: 'Classroom', duration: '4h', enrolled: 18, completed: 18, deadline: '2026-06-30' },
]

// Contracts
export const seedContracts = [
  { id: 'C-1', title: 'Host Agreement — Cohort 2026', party: 'Mavis Strategic Partners / MerSETA', status: 'Signed', signed_at: '2026-01-15', signed_by: 'Thandi Mokoena', signature_url: null, expires: '2027-01-15' },
  { id: 'C-2', title: 'Learner Placement Contract — Sipho D.', party: 'Mavis Strategic Partners / Sipho Dlamini', status: 'Awaiting Signature', signed_at: null, signed_by: null, signature_url: null, expires: '2027-06-30' },
  { id: 'C-3', title: 'Learner Placement Contract — Ayanda P.', party: 'Mavis Strategic Partners / Ayanda Pillay', status: 'Draft', signed_at: null, signed_by: null, signature_url: null, expires: null },
]

// KPI plans per learner
export const seedKPIs = [
  { id: 'K-1', learner_id: 'L-1001', learner_name: seedLearners[0].full_name, goal: 'Deliver auth module for Customer Portal', kpi: 'Sprint velocity 12+', quarter: 'Q3 2026', progress: 65, status: 'On Track', development_plan: 'Pair with senior full-stack engineer for the next 2 sprints.' },
  { id: 'K-2', learner_id: 'L-1004', learner_name: seedLearners[3].full_name, goal: 'Complete AWS SA Associate cert', kpi: '80%+ practice score', quarter: 'Q3 2026', progress: 40, status: 'At Risk', development_plan: 'Weekly study sessions + mock exam every Friday.' },
  { id: 'K-3', learner_id: 'L-1002', learner_name: seedLearners[1].full_name, goal: 'Deliver Power BI dashboards for retail client', kpi: '5 dashboards live', quarter: 'Q3 2026', progress: 100, status: 'Completed', development_plan: 'Shadow analyst on complex reporting.' },
]

// Coaching notes
export const seedCoaching = [
  { id: 'CN-1', learner_id: 'L-1001', learner_name: seedLearners[0].full_name, date: '2026-06-20', mentor: 'Thandi Mokoena', note: 'Excellent progress on React fundamentals. Encouraged to start pairing on more complex tickets.', mood: 'Positive' },
  { id: 'CN-2', learner_id: 'L-1002', learner_name: seedLearners[1].full_name, date: '2026-06-15', mentor: 'Sipho Dlamini', note: 'Struggling with time management — set up a weekly planning session.', mood: 'Needs Attention' },
]

// Incidents
export const seedIncidents = [
  { id: 'IN-1', date: '2026-06-10', learner: seedLearners[4].full_name, category: 'Health & Safety', severity: 'Low', status: 'Resolved', description: 'Minor slip in the kitchen area. First-aider attended. No injury.' },
  { id: 'IN-2', date: '2026-06-22', learner: seedLearners[6].full_name, category: 'Punctuality', severity: 'Low', status: 'Open', description: 'Three consecutive late arrivals. Escalated to mentor.' },
]

// HR Integrations
export const seedIntegrations = [
  { id: 'INT-1', name: 'Sage Payroll', category: 'Payroll', status: 'Connected', last_sync: '2026-06-30 06:00' },
  { id: 'INT-2', name: 'ZKTeco Biometric', category: 'Time & Attendance', status: 'Connected', last_sync: '2026-07-01 07:15' },
  { id: 'INT-3', name: 'Xero', category: 'Accounting/ERP', status: 'Not Connected', last_sync: null },
  { id: 'INT-4', name: 'Moodle LMS', category: 'LMS', status: 'Connected', last_sync: '2026-06-29 22:00' },
  { id: 'INT-5', name: 'PNet', category: 'Recruitment', status: 'Connected', last_sync: '2026-07-01 04:00' },
  { id: 'INT-6', name: 'SA Youth', category: 'Recruitment', status: 'Connected', last_sync: '2026-07-01 04:00' },
  { id: 'INT-7', name: 'Microsoft 365', category: 'Email & Calendar', status: 'Connected', last_sync: '2026-07-01 08:00' },
  { id: 'INT-8', name: 'Google Workspace', category: 'Email & Calendar', status: 'Not Connected', last_sync: null },
  { id: 'INT-9', name: 'DocuSign', category: 'e-Signature', status: 'Connected', last_sync: '2026-06-28 12:00' },
  { id: 'INT-10', name: 'Okta SSO', category: 'SSO / MFA', status: 'Connected', last_sync: '2026-07-01 06:30' },
  { id: 'INT-11', name: 'Power BI', category: 'BI Platform', status: 'Connected', last_sync: '2026-07-01 05:00' },
]

// HR Announcements
export const seedAnnouncements = [
  { id: 'AN-1', title: 'Public holiday reminder — Youth Day', body: 'Offices will be closed on 16 June. Timesheets should be logged as PH.', posted: '2026-06-10', author: 'HR Department' },
  { id: 'AN-2', title: 'New leave policy v3', body: 'Please acknowledge the updated leave policy in the Documents section.', posted: '2026-06-20', author: 'HR Department' },
]

// HR letters
export const seedLetters = [
  { id: 'HL-1', employee: 'Sipho Dlamini', type: 'Employment Verification', generated: '2026-06-01' },
  { id: 'HL-2', employee: 'Naledi Nkosi', type: 'Promotion Letter', generated: '2026-05-15' },
  { id: 'HL-3', employee: 'Karabo Mthembu', type: 'Contract Renewal', generated: '2026-06-25' },
]

// Audit logs
export const seedAudit = [
  { id: 'AU-1', at: '2026-07-01 09:14', actor: 'Thandi Mokoena', action: 'Approved leave request', target: 'LLV-3 (Bongani Nkosi)' },
  { id: 'AU-2', at: '2026-06-30 17:02', actor: 'Sipho Dlamini', action: 'Clocked out', target: 'Timesheet TS-2' },
  { id: 'AU-3', at: '2026-06-30 08:15', actor: 'Karabo Mthembu', action: 'Uploaded document', target: 'Medical-Certificate.pdf' },
  { id: 'AU-4', at: '2026-06-29 11:00', actor: 'Thandi Mokoena', action: 'Signed contract', target: 'Host Agreement — Cohort 2026' },
]

// Chart series
export const attendanceTrend = [
  { label: 'Mon', value: 88 }, { label: 'Tue', value: 92 }, { label: 'Wed', value: 90 },
  { label: 'Thu', value: 94 }, { label: 'Fri', value: 89 }, { label: 'Mon', value: 91 },
  { label: 'Tue', value: 93 }, { label: 'Wed', value: 92 }, { label: 'Thu', value: 95 },
  { label: 'Fri', value: 96 },
]
export const performanceTrend = [
  { label: 'Q1', value: 71 }, { label: 'Q2', value: 74 }, { label: 'Q3', value: 78 }, { label: 'Q4', value: 82 },
]
export const hostActivityByMonth = [
  { label: 'Feb', value: 12 }, { label: 'Mar', value: 15 }, { label: 'Apr', value: 18 },
  { label: 'May', value: 22 }, { label: 'Jun', value: 26 }, { label: 'Jul', value: 30 },
]

// HR Employee Documents & Folder Access Settings (Strictly Accessible to Human Resources Only)
export const seedFolderSettings = [
  { employee_id: 'E-1', access_level: 'HR Only', restricted: true, allow_employee_view: false, allow_manager_view: false, popia_consent: true, retention_years: 7, notes: 'Confidential HR personnel record. Accessible to Human Resources only.' },
  { employee_id: 'E-2', access_level: 'HR Only', restricted: true, allow_employee_view: false, allow_manager_view: false, popia_consent: true, retention_years: 5, notes: 'Confidential HR personnel record. Accessible to Human Resources only.' },
  { employee_id: 'E-3', access_level: 'HR Only', restricted: true, allow_employee_view: false, allow_manager_view: false, popia_consent: true, retention_years: 5, notes: 'Confidential HR personnel record. Accessible to Human Resources only.' },
  { employee_id: 'E-4', access_level: 'HR Only', restricted: true, allow_employee_view: false, allow_manager_view: false, popia_consent: true, retention_years: 5, notes: 'Confidential HR personnel record. Accessible to Human Resources only.' },
  { employee_id: 'E-5', access_level: 'HR Only', restricted: true, allow_employee_view: false, allow_manager_view: false, popia_consent: true, retention_years: 7, notes: 'Confidential HR personnel record. Accessible to Human Resources only.' },
  { employee_id: 'E-6', access_level: 'HR Only', restricted: true, allow_employee_view: false, allow_manager_view: false, popia_consent: true, retention_years: 5, notes: 'Confidential HR personnel record. Accessible to Human Resources only.' },
]

export const seedHrDocuments = [
  {
    id: 'DOC-101', employee_id: 'E-1', employee_name: 'Thandi Mokoena',
    name: 'Employment_Agreement_Thandi_Mokoena_Executive.pdf', category: 'Contracts',
    type: 'application/pdf', size: 482100, access: 'HR Only',
    uploaded: '2026-01-10', uploaded_by: 'Board of Directors', verified: true,
    notes: 'Signed executive contract of employment with confidentiality schedule.'
  },
  {
    id: 'DOC-102', employee_id: 'E-1', employee_name: 'Thandi Mokoena',
    name: 'RSA_Smart_ID_Thandi_Mokoena_Certified.pdf', category: 'Identification',
    type: 'application/pdf', size: 310400, access: 'HR Only',
    uploaded: '2026-01-11', uploaded_by: 'Thandi Mokoena', verified: true,
    notes: 'Certified copy of South African Smart ID Card (Commissioner of Oaths).'
  },
  {
    id: 'DOC-103', employee_id: 'E-1', employee_name: 'Thandi Mokoena',
    name: 'SARS_Tax_Directive_IRP5_2025.pdf', category: 'Tax & Banking',
    type: 'application/pdf', size: 195200, access: 'HR Only',
    uploaded: '2026-02-14', uploaded_by: 'Payroll Department', verified: true,
    notes: 'SARS tax registration notice & confirmed IRP5 certificate.'
  },
  {
    id: 'DOC-104', employee_id: 'E-2', employee_name: 'Sipho Dlamini',
    name: 'Permanent_Employment_Contract_Sipho_Dlamini.pdf', category: 'Contracts',
    type: 'application/pdf', size: 520000, access: 'HR Only',
    uploaded: '2026-01-15', uploaded_by: 'Thandi Mokoena', verified: true,
    notes: 'Senior Cloud Engineer offer letter and signed contract.'
  },
  {
    id: 'DOC-105', employee_id: 'E-2', employee_name: 'Sipho Dlamini',
    name: 'AWS_Solutions_Architect_Professional_Certificate.pdf', category: 'Qualifications',
    type: 'application/pdf', size: 760000, access: 'HR Only',
    uploaded: '2026-03-01', uploaded_by: 'Sipho Dlamini', verified: true,
    notes: 'AWS Certified Solutions Architect (SAP-C02) verified badge and PDF.'
  },
  {
    id: 'DOC-106', employee_id: 'E-2', employee_name: 'Sipho Dlamini',
    name: 'Nedbank_Account_Confirmation_Letter.pdf', category: 'Tax & Banking',
    type: 'application/pdf', size: 145000, access: 'HR Only',
    uploaded: '2026-01-16', uploaded_by: 'Sipho Dlamini', verified: true,
    notes: 'Official bank stamped account confirmation letter for salary direct deposit.'
  },
  {
    id: 'DOC-107', employee_id: 'E-3', employee_name: 'Lerato Khumalo',
    name: 'Fixed_Term_Contract_Data_Analyst.pdf', category: 'Contracts',
    type: 'application/pdf', size: 410000, access: 'HR Only',
    uploaded: '2026-01-20', uploaded_by: 'Thandi Mokoena', verified: true,
    notes: '12-month fixed-term contract with sales commission addendum.'
  },
  {
    id: 'DOC-108', employee_id: 'E-3', employee_name: 'Lerato Khumalo',
    name: 'BSc_Mathematical_Statistics_Degree_Wits.pdf', category: 'Qualifications',
    type: 'application/pdf', size: 890000, access: 'HR Only',
    uploaded: '2026-01-22', uploaded_by: 'Lerato Khumalo', verified: true,
    notes: 'Degree transcript and certificate from University of the Witwatersrand.'
  },
  {
    id: 'DOC-109', employee_id: 'E-4', employee_name: 'Naledi Nkosi',
    name: 'Employment_Contract_Product_Designer.pdf', category: 'Contracts',
    type: 'application/pdf', size: 440000, access: 'HR Only',
    uploaded: '2026-02-01', uploaded_by: 'Thandi Mokoena', verified: true,
    notes: 'Lead Product Designer full-time contract and IP agreement.'
  },
  {
    id: 'DOC-110', employee_id: 'E-4', employee_name: 'Naledi Nkosi',
    name: 'Design_Portfolio_and_Case_Studies_2026.pdf', category: 'Qualifications',
    type: 'application/pdf', size: 1250000, access: 'HR Only',
    uploaded: '2026-02-05', uploaded_by: 'Naledi Nkosi', verified: true,
    notes: 'Comprehensive design system and product UX portfolio.'
  },
  {
    id: 'DOC-111', employee_id: 'E-5', employee_name: 'Bongani Zulu',
    name: 'Security_Clearance_and_Non_Disclosure_Agreement.pdf', category: 'Contracts',
    type: 'application/pdf', size: 610000, access: 'HR Only',
    uploaded: '2026-01-18', uploaded_by: 'Legal Department', verified: true,
    notes: 'Strict NDA and background vetting clearance certificate.'
  },
  {
    id: 'DOC-112', employee_id: 'E-6', employee_name: 'Karabo Mthembu',
    name: 'Temporary_Appointment_Letter_People_Ops.pdf', category: 'Contracts',
    type: 'application/pdf', size: 320000, access: 'HR Only',
    uploaded: '2026-02-10', uploaded_by: 'Thandi Mokoena', verified: true,
    notes: 'People Ops coordinator temporary contract and scope of work.'
  }
]

// HR Payroll records with basic salary, sales commission %, incentive, gift, deductions
export const seedPayrollRecords = [
  {
    id: 'PAY-2026-07-01',
    employee_id: 'E-1',
    employee: 'Thandi Mokoena',
    department: 'People Ops',
    period: '2026-07',
    pay_date: '2026-07-25',
    status: 'Paid',
    basic_salary: 46000,
    sales_amount: 0,
    sales_percent: 0,
    sales_commission: 0,
    incentive: 4500,
    incentive_type: 'Executive Quarterly Milestone',
    gift: 1200,
    gift_type: 'Winter Wellness Hamper Voucher',
    uif: 177.12,
    paye: 8650,
    loan: 0,
    advance_salary: 0,
    notes: 'Processed on 25 July via Nedbank Corporate EFT batch.'
  },
  {
    id: 'PAY-2026-07-02',
    employee_id: 'E-2',
    employee: 'Sipho Dlamini',
    department: 'Engineering',
    period: '2026-07',
    pay_date: '2026-07-25',
    status: 'Paid',
    basic_salary: 48500,
    sales_amount: 0,
    sales_percent: 0,
    sales_commission: 0,
    incentive: 5000,
    incentive_type: 'Cloud Migration Delivery Bonus',
    gift: 1500,
    gift_type: 'Tech Gear Appreciation Token',
    uif: 177.12,
    paye: 9400,
    loan: 0,
    advance_salary: 0,
    notes: 'Includes project completion delivery bonus for major bank cloud sprint.'
  },
  {
    id: 'PAY-2026-07-03',
    employee_id: 'E-3',
    employee: 'Lerato Khumalo',
    department: 'Data',
    period: '2026-07',
    pay_date: '2026-07-25',
    status: 'Paid',
    basic_salary: 28000,
    sales_amount: 140000,
    sales_percent: 5.0,
    sales_commission: 7000,
    incentive: 2500,
    incentive_type: 'Data Pipeline Target Bonus',
    gift: 750,
    gift_type: 'Woolworths Gift Voucher',
    uif: 177.12,
    paye: 5200,
    loan: 0,
    advance_salary: 0,
    notes: 'Sales commission calculated on R 140,000 analytics software add-on sales @ 5.0%.'
  },
  {
    id: 'PAY-2026-07-04',
    employee_id: 'E-4',
    employee: 'Naledi Nkosi',
    department: 'Design',
    period: '2026-07',
    pay_date: '2026-07-25',
    status: 'Paid',
    basic_salary: 32000,
    sales_amount: 60000,
    sales_percent: 4.0,
    sales_commission: 2400,
    incentive: 3000,
    incentive_type: 'Client UX Review Distinction',
    gift: 1000,
    gift_type: 'Design Excellence Recognition Gift',
    uif: 177.12,
    paye: 5900,
    loan: 0,
    advance_salary: 0,
    notes: 'Design consulting retainer commission included.'
  },
  {
    id: 'PAY-2026-07-05',
    employee_id: 'E-5',
    employee: 'Bongani Zulu',
    department: 'Engineering',
    period: '2026-07',
    pay_date: '2026-07-25',
    status: 'Paid',
    basic_salary: 39000,
    sales_amount: 0,
    sales_percent: 0,
    sales_commission: 0,
    incentive: 2000,
    incentive_type: 'Zero-Security Incident Award',
    gift: 800,
    gift_type: 'Takealot Voucher',
    uif: 177.12,
    paye: 6850,
    loan: 0,
    advance_salary: 0,
    notes: 'Q2 security compliance bonus applied.'
  },
  {
    id: 'PAY-2026-07-06',
    employee_id: 'E-6',
    employee: 'Karabo Mthembu',
    department: 'People Ops',
    period: '2026-07',
    pay_date: '2026-07-25',
    status: 'Paid',
    basic_salary: 19500,
    sales_amount: 0,
    sales_percent: 0,
    sales_commission: 0,
    incentive: 1500,
    incentive_type: 'Intern Onboarding Drive Bonus',
    gift: 1000,
    gift_type: 'Mall of Africa Gift Card',
    uif: 177.12,
    paye: 1800,
    loan: 0,
    advance_salary: 0,
    notes: 'Full onboarding cycle completed on schedule.'
  },
  // June 2026 historical records
  {
    id: 'PAY-2026-06-01',
    employee_id: 'E-1',
    employee: 'Thandi Mokoena',
    department: 'People Ops',
    period: '2026-06',
    pay_date: '2026-06-25',
    status: 'Paid',
    basic_salary: 46000,
    sales_amount: 0,
    sales_percent: 0,
    sales_commission: 0,
    incentive: 3000,
    incentive_type: 'Mid-Year Review Target',
    gift: 500,
    gift_type: 'Staff Recognition Gift',
    uif: 177.12,
    paye: 8400,
    loan: 0,
    advance_salary: 0,
    notes: 'June standard pay run.'
  },
  {
    id: 'PAY-2026-06-03',
    employee_id: 'E-3',
    employee: 'Lerato Khumalo',
    department: 'Data',
    period: '2026-06',
    pay_date: '2026-06-25',
    status: 'Paid',
    basic_salary: 28000,
    sales_amount: 95000,
    sales_percent: 5.0,
    sales_commission: 4750,
    incentive: 2000,
    incentive_type: 'Retail Client KPI Incentive',
    gift: 500,
    gift_type: 'Mid-Year Token',
    uif: 177.12,
    paye: 4800,
    loan: 0,
    advance_salary: 0,
    notes: 'Sales commission on R 95,000 analytics expansion.'
  }
]

export { ZA_PUBLIC_HOLIDAYS, holidayOn } from '../lib/holidays.js'

