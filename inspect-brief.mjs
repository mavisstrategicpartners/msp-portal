import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tkjytjaerfjpghusrwom.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "sb_secret_1Jk2CqcjaVE7ZsSkgrYdpg_UE-90ZXH";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function inspectBrief() {
  const { data: profiles } = await supabase.from('profiles').select('*');
  console.log("PROFILES (" + profiles.length + "):");
  for (const p of profiles) {
    console.log(`- ID: ${p.id}, Email: ${p.email}, Name: ${p.full_name}, Dept: ${p.department}, RoleTier: ${p.role_tier}, Job: ${p.job_title}, Active: ${p.is_active}`);
  }

  const { data: userRoles } = await supabase.from('user_roles').select('*');
  console.log("\nUSER ROLES (" + userRoles.length + "):");
  for (const r of userRoles) {
    console.log(`- UserID: ${r.user_id}, Role: ${r.role}`);
  }

  const { data: clients } = await supabase.from('clients').select('*');
  console.log("\nCLIENTS (" + clients.length + "):");
  for (const c of clients) {
    console.log(`- ID: ${c.id}, Name: ${c.name}, Industry: ${c.industry}, Package: ${c.active_package}, AM: ${c.account_manager_id}`);
  }

  const { data: tasks } = await supabase.from('ops_tasks').select('*');
  console.log("\nOPS TASKS (" + tasks.length + "):");
  for (const t of tasks) {
    console.log(`- Title: ${t.title}, Client/Team: ${t.client_or_team}, Status: ${t.status}, Deadline: ${t.deadline}, Owner: ${t.owner_name}`);
  }

  const { data: escalations } = await supabase.from('ops_escalations').select('*');
  console.log("\nOPS ESCALATIONS (" + escalations.length + "):");
  for (const e of escalations) {
    console.log(`- Title: ${e.title}, Level: ${e.escalation_level}, Status: ${e.status}, Client/Team: ${e.client_or_team}`);
  }

  const { data: leads } = await supabase.from('ops_leads').select('*');
  console.log("\nOPS LEADS (" + leads.length + "):");
  for (const l of leads) {
    console.log(`- Business: ${l.business_name}, Stage: ${l.stage}, Value: ${l.estimated_value}, Rep: ${l.assigned_salesperson}`);
  }

  const { data: onboarding } = await supabase.from('ops_onboarding').select('*');
  console.log("\nOPS ONBOARDING (" + onboarding.length + "):");
  for (const o of onboarding) {
    console.log(`- Client: ${o.client_name}, Stage: ${o.current_stage}, Progress: ${o.progress}%`);
  }

  const { data: approvals } = await supabase.from('ops_approvals').select('*');
  console.log("\nOPS APPROVALS (" + approvals.length + "):");
  for (const a of approvals) {
    console.log(`- Title: ${a.title}, Requester: ${a.requester}, Status: ${a.status}`);
  }

  const { data: leaves } = await supabase.from('leave_requests').select('*');
  console.log("\nLEAVE REQUESTS (" + leaves.length + "):");
  for (const l of leaves) {
    console.log(`- User: ${l.user_id}, Status: ${l.status}, Start: ${l.start_date}, End: ${l.end_date}`);
  }

  const { data: reports } = await supabase.from('monthly_reports').select('id, client_id, title, status, report_type');
  console.log("\nMONTHLY REPORTS (" + reports.length + "):");
  for (const r of reports) {
    console.log(`- Title: ${r.title}, Status: ${r.status}, Type: ${r.report_type}`);
  }
}

inspectBrief().catch(console.error);
