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

async function cleanTaskData() {
  console.log('1. Querying synthetic staff/task records from audit_logs...');
  const { data: records, error: fetchErr } = await client
    .from('audit_logs')
    .select('*')
    .or('action.like.staff_%,action.like.task_%');

  if (fetchErr) {
    console.error('Error fetching records:', fetchErr);
    process.exit(1);
  }

  console.log(`Found ${records.length} synthetic staff/task audit log records.`);

  const backupPath = 'C:/Users/cashc/.gemini/antigravity-ide/brain/2a5db150-1ede-490a-88a7-422e2f29e4de/scratch/pre-task-cleanup-backup.json';
  fs.writeFileSync(backupPath, JSON.stringify(records, null, 2), 'utf-8');
  console.log(`Saved backup to ${backupPath}`);

  if (records.length > 0) {
    const ids = records.map(r => r.id);
    console.log(`Deleting ${ids.length} synthetic records from audit_logs...`);
    const { error: delErr } = await client
      .from('audit_logs')
      .delete()
      .in('id', ids);

    if (delErr) {
      console.error('Error deleting records:', delErr);
      process.exit(1);
    }
    console.log('Successfully purged synthetic task records from audit_logs.');
  }

  const { data: remaining } = await client
    .from('audit_logs')
    .select('id, action')
    .or('action.like.staff_%,action.like.task_%');

  console.log(`Remaining synthetic task records in audit_logs (must be 0): ${remaining?.length || 0}`);
}

cleanTaskData().catch(console.error);
