-- Migration to create HR Portal Tables

CREATE TABLE IF NOT EXISTS public.hr_employees (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT,
    department TEXT,
    email TEXT,
    phone TEXT,
    employment_type TEXT,
    join_date DATE,
    manager TEXT,
    gender TEXT,
    age_band TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_vacancies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    department TEXT,
    type TEXT,
    location TEXT,
    posted DATE,
    applicants INTEGER DEFAULT 0,
    status TEXT,
    salary TEXT,
    description TEXT,
    requirements JSONB,
    tags JSONB,
    closes DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_applicants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    vacancy TEXT,
    stage TEXT,
    score INTEGER,
    applied DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_leave (
    id TEXT PRIMARY KEY,
    employee TEXT NOT NULL,
    type TEXT,
    "from" DATE,
    "to" DATE,
    days INTEGER,
    status TEXT,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_training (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT,
    mode TEXT,
    duration TEXT,
    enrolled INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    deadline DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_attendance (
    id TEXT PRIMARY KEY,
    learner_id TEXT,
    learner_name TEXT,
    sponsor TEXT,
    host TEXT,
    mentor TEXT,
    mentor_phone TEXT,
    contact TEXT,
    date DATE,
    status TEXT,
    leave_flags JSONB,
    check_in TEXT,
    check_out TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_reviews (
    id TEXT PRIMARY KEY,
    employee TEXT NOT NULL,
    period TEXT,
    overall NUMERIC,
    goals_met INTEGER,
    goals_total INTEGER,
    feedback TEXT,
    pip BOOLEAN DEFAULT FALSE,
    promotion BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_documents (
    id TEXT PRIMARY KEY,
    employee_id TEXT,
    employee_name TEXT,
    name TEXT,
    type TEXT,
    size INTEGER,
    access TEXT,
    uploaded DATE,
    data_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT,
    posted DATE,
    author TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_letters (
    id TEXT PRIMARY KEY,
    employee TEXT NOT NULL,
    type TEXT,
    generated DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_audit (
    id TEXT PRIMARY KEY,
    at TEXT,
    actor TEXT,
    action TEXT,
    target TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_integrations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    status TEXT,
    last_sync TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_payroll_records (
    id TEXT PRIMARY KEY,
    employee_id TEXT,
    employee TEXT,
    basic_salary NUMERIC,
    sales_amount NUMERIC,
    sales_percent NUMERIC,
    incentive NUMERIC,
    gift NUMERIC,
    uif NUMERIC,
    loan NUMERIC,
    advance_salary NUMERIC,
    period TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_relations (
    id TEXT PRIMARY KEY,
    employee TEXT NOT NULL,
    type TEXT,
    severity TEXT,
    date DATE,
    status TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_talent (
    id TEXT PRIMARY KEY,
    employee TEXT NOT NULL,
    role TEXT,
    potential TEXT,
    readiness TEXT,
    successor_for TEXT,
    idp_progress INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_timesheets (
    id TEXT PRIMARY KEY,
    employee TEXT NOT NULL,
    date DATE,
    clock_in TEXT,
    clock_out TEXT,
    projects JSONB,
    status TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
