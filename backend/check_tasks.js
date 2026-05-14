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

async function checkTasks() {
  const workspaceId = 'e061b8b6-8990-41b4-97d7-35bb7ae4c9e7';
  try {
    const columns = await pool.query("SELECT * FROM columns WHERE workspace_id = $1", [workspaceId]);
    console.log('Columns found:', columns.rows);
    
    const tasks = await pool.query("SELECT * FROM tasks WHERE workspace_id = $1", [workspaceId]);
    console.log('Tasks found:', tasks.rows.length);
    tasks.rows.forEach(t => console.log(`- ${t.title} (Col: ${t.column_id})`));
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkTasks();
