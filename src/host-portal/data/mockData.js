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

// Live attendance starts clean for go-live
export const seedAttendance = []

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
  { id: '27dcc3a8-4721-4646-87cb-770fe721ee5a', full_name: 'MSP Human Resources', role: 'HR Manager', department: 'Human Resources', email: 'hr@mavisstrategicpartners.co.za', employment_type: 'Permanent', join_date: '2026-09-16', manager: 'Board' },
  { id: 'a8657388-806a-4034-aba9-cdfec879e58a', full_name: 'Siphelele Malotana', role: 'Developer', department: 'IT Department', email: 'siphelele.malotana@mavisstrategicpartners.co.za', employment_type: 'Intern', join_date: '2026-09-29', manager: 'MSP Human Resources' },
]

export const seedLeaveBalances = seedEmployees.map(e => ({
  employee_id: e.id, employee: e.full_name,
  Annual: 15, Sick: 8, 'Family Responsibility': 3, Study: 5, Compassionate: 2,
}))

export const seedLeave = []

export const seedLearnerLeaveRequests = []

export const ATTENDANCE_STATUSES = ['Present', 'Clocked In', 'On Break', 'Clocked Out', 'On Leave', 'Absent']

export const seedTimesheets = []

export const seedRelations = []


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
export const seedLetters = []

// Audit logs
export const seedAudit = []

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
export const seedFolderSettings = []

export const seedHrDocuments = []

// HR Payroll records (live data starts clean)
export const seedPayrollRecords = []

export { ZA_PUBLIC_HOLIDAYS, holidayOn } from '../lib/holidays.js'

