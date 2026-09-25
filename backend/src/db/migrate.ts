import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';
import { config } from '../config/index.js';

async function runMigrations(): Promise<void> {
  console.log('[MIGRATE] Running database migrations...');

  const pool = new pg.Pool({
    connectionString: config.databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  const migrationsDir = path.resolve(process.cwd(), 'drizzle');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id varchar(255) PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const files = (await fs.readdir(migrationsDir))
      .filter((file) => /^\\d+_.*\\.sql$/.test(file))
      .sort();

    for (const file of files) {
      const existing = await pool.query(
        'SELECT 1 FROM schema_migrations WHERE id = $1',
        [file],
      );

      if (existing.rowCount) {
        console.log(`[MIGRATE] Skipping ${file}; already applied.`);
        continue;
      }

      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      const client = await pool.connect();

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (id) VALUES ($1)',
          [file],
        );
        await client.query('COMMIT');
        console.log(`[MIGRATE] Applied ${file}.`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    console.log('[MIGRATE] Migrations completed successfully.');
  } finally {
    await pool.end();
  }
}

runMigrations().catch((error: unknown) => {
  console.error('[ERR_MIGRATION_FAILED] Migration failed:', error);
  process.exit(1);
});
