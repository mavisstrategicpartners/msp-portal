import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

/**
 * The company's real, active employees (public.profiles) for HR form pickers.
 * Shape matches what the HR pages used before: { id, full_name, role, department, email }.
 */
export function useCompanyEmployees() {
  const [employees, setEmployees] = useState([])
  useEffect(() => {
    let cancelled = false
    supabase
      .from('profiles')
      .select('id, full_name, email, job_title, department, is_active')
      .order('full_name')
      .then(({ data }) => {
        if (cancelled || !Array.isArray(data)) return
        setEmployees(
          data
            .filter((p) => p.is_active !== false && p.full_name)
            .map((p) => ({ id: p.id, full_name: p.full_name, role: p.job_title || '', department: p.department || '', email: p.email || '' })),
        )
      })
    return () => { cancelled = true }
  }, [])
  return employees
}
