-- Documents HR asks employees to sign, complete or upload. One row per employee per request.
-- Written only by the server API (service role); employees read their own rows, HR and
-- administrators read all, the CEO reads all (oversight). Files live in the private
-- "hr-documents" storage bucket; links are issued by the server.
create table if not exists public.hr_document_requests (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null,
  employee_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('sign', 'complete', 'upload', 'declaration')),
  category text,
  instructions text,
  due_date date,
  audience text,
  template jsonb,
  status text not null default 'Outstanding' check (status in ('Outstanding', 'Submitted', 'Signed', 'Accepted', 'Returned', 'Cancelled')),
  submission jsonb not null default '[]'::jsonb,
  response text,
  signature_name text,
  acknowledged boolean,
  signed_at timestamptz,
  submitted_at timestamptz,
  review_note text,
  reviewed_by uuid,
  reviewed_by_name text,
  reviewed_at timestamptz,
  requested_by uuid,
  requested_by_name text,
  declaration_id uuid references public.employee_declarations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hr_document_requests_employee_idx on public.hr_document_requests (employee_id, status);
create index if not exists hr_document_requests_batch_idx on public.hr_document_requests (batch_id);
alter table public.hr_document_requests enable row level security;
drop policy if exists hr_doc_requests_own on public.hr_document_requests;
create policy hr_doc_requests_own on public.hr_document_requests for select to authenticated using (employee_id = auth.uid());
drop policy if exists hr_doc_requests_hr on public.hr_document_requests;
create policy hr_doc_requests_hr on public.hr_document_requests for select to authenticated using (public.msp_is_hr(auth.uid()) or public.msp_is_admin(auth.uid()) or public.msp_is_ceo(auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit)
values ('hr-documents', 'hr-documents', false, 26214400)
on conflict (id) do nothing;
