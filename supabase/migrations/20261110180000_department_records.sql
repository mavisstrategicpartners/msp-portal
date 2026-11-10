-- Department module records (IT support requests, campaigns, design briefs, keyword tracking,
-- bugs, client cases, automation workflows, report schedules, initiatives, training…).
-- One table, typed by department_key + record_type; the fields of each type are defined in
-- src/lib/department-modules.ts. Read and written only through the server, which enforces
-- department permissions (manager, members, GM/CEO/admin oversight). Starts empty.
CREATE TABLE IF NOT EXISTS public.department_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_key text NOT NULL,
  record_type text NOT NULL,
  title text NOT NULL,
  status text NOT NULL,
  priority text,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_name text,
  due_date date,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  task_id text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS department_records_dept_type ON public.department_records (department_key, record_type);
CREATE INDEX IF NOT EXISTS department_records_assignee ON public.department_records (assigned_to);

ALTER TABLE public.department_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.department_records FROM anon, authenticated;
