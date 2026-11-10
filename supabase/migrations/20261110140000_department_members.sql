-- Department membership: which department each employee reports into (primary)
-- and any other department they also do work for. With public.department_leads
-- this is the organisation structure used for task assignment:
--   department manager (department_leads) -> employees (department_members).
-- Written only by the server (CEO / administrators); readable by signed-in staff.
CREATE TABLE IF NOT EXISTS public.department_members (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  department_key text NOT NULL,
  is_primary boolean NOT NULL DEFAULT true,
  -- 'recorded' = taken from the department already on the employee's profile; 'manual' = set by CEO/admin
  source text NOT NULL DEFAULT 'manual',
  recorded_department text,
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, department_key)
);
CREATE UNIQUE INDEX IF NOT EXISTS department_members_one_primary
  ON public.department_members (user_id) WHERE is_primary;
CREATE INDEX IF NOT EXISTS department_members_dept ON public.department_members (department_key);

ALTER TABLE public.department_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS department_members_read ON public.department_members;
CREATE POLICY department_members_read ON public.department_members FOR SELECT TO authenticated USING (true);
REVOKE ALL ON public.department_members FROM anon;

-- Seed primary membership from the department already recorded on each active
-- employee profile. Only unambiguous department names are mapped; the CEO,
-- administrators and the General Manager ("Managing Director") are not
-- department employees and are not seeded.
INSERT INTO public.department_members (user_id, department_key, is_primary, source, recorded_department)
SELECT p.id, m.key, true, 'recorded', p.department::text
FROM public.profiles p
JOIN (VALUES
  ('IT Department', 'it'),
  ('Marketing Team', 'marketing'),
  ('Sales Team', 'sales'),
  ('Human Resources', 'hr'),
  ('Admin Department', 'finance'),
  ('Operations Manager', 'operations'),
  ('Social Media Manager', 'creative')
) AS m(recorded, key) ON m.recorded = p.department::text
WHERE coalesce(p.is_active, true)
  AND coalesce(p.role_tier::text, '') <> 'root_admin'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles r WHERE r.user_id = p.id AND r.role::text IN ('ceo', 'admin')
  )
ON CONFLICT DO NOTHING;

-- Department managers confirmed by existing records: an active manager-tier
-- account whose job title is that department's manager role. Departments
-- without such a record stay "Manager not assigned" for the CEO/admin to set.
INSERT INTO public.department_leads (department_key, user_id, note)
SELECT v.key, p.id, 'Confirmed from profile: manager tier, job title "' || p.job_title || '"'
FROM public.profiles p
JOIN (VALUES
  ('hr', 'HR Manager', 'Human Resources'),
  ('finance', 'Finance & Administration Manager', 'Admin Department'),
  ('media-buying', 'Media Buying Lead & Department Manager', 'Marketing Team')
) AS v(key, title, recorded) ON v.title = p.job_title AND v.recorded = p.department::text
WHERE p.role_tier::text = 'manager' AND coalesce(p.is_active, true)
ON CONFLICT (department_key) DO NOTHING;
