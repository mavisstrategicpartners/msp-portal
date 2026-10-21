const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envText = fs.readFileSync('.env', 'utf-8');
const getEnv = (key) => {
  const m = envText.match(new RegExp(`^${key}=([^\\r\\n]+)`, 'm'));
  return m ? m[1].trim() : '';
};

const url = getEnv('VITE_SUPABASE_URL');
const key = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');
const client = createClient(url, key);

async function run() {
  console.log('--- Checking ops_tasks ---');
  const { data: opsTasks, error: err1 } = await client.from('ops_tasks').select('*');
  if (err1) console.log('ops_tasks error:', err1.message);
  else console.log(`ops_tasks: ${opsTasks.length} rows`, opsTasks);

  console.log('\n--- Checking audit_logs for staff / task actions ---');
  const { data: staffLogs, error: err2 } = await client
    .from('audit_logs')
    .select('id, action, target_id, details, created_at')
    .or('action.like.staff_%,action.like.task_%');
  if (err2) console.log('audit_logs error:', err2.message);
  else {
    console.log(`audit_logs (staff/task actions): ${staffLogs.length} rows`);
    staffLogs.forEach(l => console.log(` - [${l.action}] ID: ${l.id}, Target: ${l.target_id}, Created: ${l.created_at}`));
  }
}

run();
