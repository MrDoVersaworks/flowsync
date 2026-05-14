import { db } from './src/db/connection.js';
import { users } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function test() {
  try {
    console.log('Testing login query...');
    const email = 'mrdoofficial1@gmail.com';
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    console.log('Query successful, result length:', result.length);
    if (result.length > 0) {
      console.log('User found:', result[0].email);
    } else {
      console.log('User not found');
    }
  } catch (err) {
    console.error('Query failed:', err);
  } finally {
    process.exit(0);
  }
}

test();
