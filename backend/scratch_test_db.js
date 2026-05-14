import pkg from 'pg';
const { Pool } = pkg;
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function test() {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables in public schema:', res.rows.map(r => r.table_name));
    
    if (res.rows.find(r => r.table_name === 'users')) {
      const columns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
      console.log('Columns in users table:', columns.rows.map(r => r.column_name));
    }
  } catch (err) {
    console.error('Error connecting to DB:', err);
  } finally {
    await pool.end();
  }
}

test();
