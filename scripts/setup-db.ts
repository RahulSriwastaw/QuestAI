import { Client } from 'pg';

const connectionString = 'postgresql://postgres:cC9A7oesMlCUKyGV@db.xwkbrjihkidgdoblyyms.supabase.co:5432/postgres';

async function setupDatabase() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    await client.query(`
      CREATE TABLE IF NOT EXISTS bank_questions (
        id TEXT PRIMARY KEY,
        folder_id TEXT,
        saved_at BIGINT,
        question_data JSONB
      );
    `);
    console.log('Created bank_questions table.');

  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await client.end();
  }
}

setupDatabase();
