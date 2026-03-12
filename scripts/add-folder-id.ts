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
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS folder_id TEXT;
    `);
    console.log('Added folder_id column.');

  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await client.end();
  }
}

setupDatabase();
