-- Department manager appointments awaiting (or having had) account provisioning.
-- The CEO or an administrator records the verified person appointed to manage a
-- department; an administrator then runs the one-time provisioning, which links
-- an existing account or creates a new one with a temporary password.
-- Server-only: no client policies. Passwords are never stored here.
CREATE TABLE IF NOT EXISTS public.manager_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_key text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  job_title text,
  -- pending | provisioned (new account) | linked (existing account) | failed | cancelled
  status text NOT NULL DEFAULT 'pending',
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  failure_reason text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  processed_at timestamptz
);
-- One open appointment per department, and one per person.
CREATE UNIQUE INDEX IF NOT EXISTS manager_appointments_one_pending_per_dept
  ON public.manager_appointments (department_key) WHERE status = 'pending';
CREATE UNIQUE INDEX IF NOT EXISTS manager_appointments_one_open_per_email
  ON public.manager_appointments (lower(email)) WHERE status IN ('pending', 'provisioned', 'linked');

ALTER TABLE public.manager_appointments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.manager_appointments FROM anon, authenticated;
