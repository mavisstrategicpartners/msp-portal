-- Confirmed department managers/leads. One row per department; a department
-- with no row shows "Manager not assigned". Written only by the server
-- (administrators), readable by signed-in staff.
CREATE TABLE IF NOT EXISTS public.department_leads (
  department_key text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  note text
);

ALTER TABLE public.department_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS department_leads_read ON public.department_leads;
CREATE POLICY department_leads_read ON public.department_leads FOR SELECT TO authenticated USING (true);
REVOKE ALL ON public.department_leads FROM anon;

-- Only lead confirmed by existing records: the manager-tier account in the
-- Operations department (Xongile Mhlari). Every other department is left
-- unassigned for an administrator to confirm.
INSERT INTO public.department_leads (department_key, user_id, note)
SELECT 'operations', p.id, 'Seeded from profile: manager tier, Operations department'
FROM public.profiles p
WHERE lower(p.email) = 'xongile@mavisstrategicpartners.co.za'
  AND p.role_tier = 'manager'
  AND coalesce(p.is_active, true)
ON CONFLICT (department_key) DO NOTHING;
