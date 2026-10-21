import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RealProfile {
  id: string;
  email: string;
  full_name: string | null;
  department: string | null;
  role_tier: string;
  job_title: string | null;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
}

export interface RealClient {
  id: string;
  name: string;
  industry: string | null;
  active_package: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RealMonthlyReport {
  id: string;
  client_id: string;
  report_type: string;
  title: string;
  reporting_month: string;
  prepared_by_name: string | null;
  status: "draft" | "internal_review" | "sent_to_client";
  created_at: string;
  updated_at: string;
  data: any;
}

export interface RealLeaveRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: "pending" | "approved" | "declined";
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
}

export interface RealExecutiveData {
  loading: boolean;
  error: string | null;
  employees: RealProfile[];
  allProfiles: RealProfile[];
  clients: RealClient[];
  deliverables: RealMonthlyReport[];
  leaveRequests: RealLeaveRequest[];
  refresh: () => Promise<void>;
}

export function useRealExecutiveData(): RealExecutiveData {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allProfiles, setAllProfiles] = useState<RealProfile[]>([]);
  const [employees, setEmployees] = useState<RealProfile[]>([]);
  const [clients, setClients] = useState<RealClient[]>([]);
  const [deliverables, setDeliverables] = useState<RealMonthlyReport[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<RealLeaveRequest[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profilesRes, clientsRes, reportsRes, leaveRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: true }),
        supabase.from("clients").select("*").order("name", { ascending: true }),
        supabase.from("monthly_reports").select("*").order("created_at", { ascending: false }),
        supabase.from("leave_requests").select("*").order("created_at", { ascending: false }),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (reportsRes.error) throw reportsRes.error;
      if (leaveRes.error) throw leaveRes.error;

      const rawProfiles = (profilesRes.data || []) as RealProfile[];
      setAllProfiles(rawProfiles);

      // Filter to actual active business employees (excludes system root admins)
      const actualStaff = rawProfiles.filter(
        (p) =>
          p.role_tier !== "root_admin" &&
          p.email !== "superadmin@mavisstrategicpartners.co.za" &&
          p.email !== "admin@mavisstrategicpartners.co.za" &&
          p.is_active
      );
      setEmployees(actualStaff);

      setClients((clientsRes.data || []) as RealClient[]);
      setDeliverables((reportsRes.data || []) as RealMonthlyReport[]);
      setLeaveRequests((leaveRes.data || []) as RealLeaveRequest[]);
    } catch (err: any) {
      console.error("Failed to load real executive data from Supabase:", err);
      setError(err?.message || "Failed to load database records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    error,
    employees,
    allProfiles,
    clients,
    deliverables,
    leaveRequests,
    refresh: fetchData,
  };
}
