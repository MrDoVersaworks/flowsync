import 'dotenv/config';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { config } from '../config/index.js';

async function runMigrations(): Promise<void> {
  console.log('[MIGRATE] Running database migrations...');

  const pool = new pg.Pool({
    connectionString: config.databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  const db = drizzle(pool);

  await migrate(db, { migrationsFolder: './drizzle' });

  console.log('[MIGRATE] Migrations completed successfully.');
  await pool.end();
  process.exit(0);
}

runMigrations().catch((error: unknown) => {
  console.error('[ERR_MIGRATION_FAILED] Migration failed:', error);
  process.exit(1);
});
