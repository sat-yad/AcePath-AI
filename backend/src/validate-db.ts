import { db } from './db/client';

async function validateSchema() {
  const tables = [
    'users', 'skill_profiles', 'roadmaps', 'weekly_plans', 
    'daily_tasks', 'mock_interviews', 'resume_versions', 
    'chat_memory', 'skill_gap_reports', 'user_achievements', 
    'achievements', 'notifications', 'user_streaks'
  ];

  console.log('--- Database Schema Validation ---');
  
  for (const table of tables) {
    try {
      const res = await db.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)`, [table]);
      const exists = res.rows[0].exists;
      console.log(`${exists ? '✅' : '❌'} Table: ${table}`);
    } catch (err: any) {
      console.log(`❌ Table: ${table} (Error: ${err.message})`);
    }
  }

  // Check pgvector
  try {
    const res = await db.query(`SELECT * FROM pg_extension WHERE extname = 'vector'`);
    console.log(`${res.rows.length > 0 ? '✅' : '❌'} Extension: pgvector`);
  } catch (err) {
    console.log(`❌ Extension: pgvector (Not installed)`);
  }

  console.log('--- Validation Complete ---');
}

validateSchema().then(() => process.exit(0));
