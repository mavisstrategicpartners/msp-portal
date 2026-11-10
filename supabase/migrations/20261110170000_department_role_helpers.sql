-- HR and Finance records are confidential to the department's appointed manager.
-- Previously msp_is_hr / msp_is_finance matched any profile whose department or job
-- title mentioned HR or Finance, which gave every HR or Finance employee (including
-- interns and reception) full access to HR records, payroll and finance tables.
-- Access now follows the organisation structure (public.department_leads). The CEO,
-- General Manager and administrators keep their existing separate policies.
CREATE OR REPLACE FUNCTION public.msp_is_hr(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.department_leads l
    JOIN public.profiles p ON p.id = l.user_id
    WHERE l.department_key = 'hr' AND l.user_id = _uid AND coalesce(p.is_active, true)
  )
$$;

CREATE OR REPLACE FUNCTION public.msp_is_finance(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.department_leads l
    JOIN public.profiles p ON p.id = l.user_id
    WHERE l.department_key = 'finance' AND l.user_id = _uid AND coalesce(p.is_active, true)
  )
$$;
