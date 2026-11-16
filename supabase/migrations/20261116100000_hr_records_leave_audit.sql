-- HR administration: extends the existing HR tables (no new tables, nothing dropped).
-- leave_requests: the single leave record (employees apply, HR decides).
alter type public.leave_status add value if not exists 'info_requested';
alter table public.leave_requests add column if not exists leave_type text;
alter table public.leave_requests add column if not exists days integer;
alter table public.leave_requests add column if not exists hr_note text;
alter table public.leave_requests add column if not exists employee_response text;
alter table public.leave_requests add column if not exists reviewed_by_name text;
alter table public.leave_requests add column if not exists updated_at timestamptz default now();

-- hr_documents: each employee's HR folder. Files live in the private "hr-documents" bucket.
alter table public.hr_documents add column if not exists storage_path text;
alter table public.hr_documents add column if not exists category text;
alter table public.hr_documents add column if not exists document_date date;
alter table public.hr_documents add column if not exists mime_type text;
alter table public.hr_documents add column if not exists uploaded_by uuid;
alter table public.hr_documents add column if not exists uploaded_by_name text;
alter table public.hr_documents add column if not exists notes text;
alter table public.hr_documents add column if not exists source text;
alter table public.hr_documents add column if not exists source_id text;
alter table public.hr_documents add column if not exists updated_at timestamptz default now();
create index if not exists hr_documents_employee_idx on public.hr_documents (employee_id);

-- hr_employees: employment details for each employee profile (one row per profile).
alter table public.hr_employees add column if not exists profile_id uuid references public.profiles(id) on delete cascade;
alter table public.hr_employees add column if not exists employee_number text;
alter table public.hr_employees add column if not exists id_number text;
alter table public.hr_employees add column if not exists date_of_birth date;
alter table public.hr_employees add column if not exists address text;
alter table public.hr_employees add column if not exists emergency_contact_name text;
alter table public.hr_employees add column if not exists emergency_contact_phone text;
alter table public.hr_employees add column if not exists end_date date;
alter table public.hr_employees add column if not exists notes text;
alter table public.hr_employees add column if not exists updated_at timestamptz default now();
create unique index if not exists hr_employees_profile_uidx on public.hr_employees (profile_id);

-- hr_audit: HR audit log, linked to the employee concerned.
alter table public.hr_audit add column if not exists employee_id text;
alter table public.hr_audit add column if not exists details text;
create index if not exists hr_audit_employee_idx on public.hr_audit (employee_id, created_at desc);
