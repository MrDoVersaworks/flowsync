import { loginUser } from './src/services/auth.service.js';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    console.log('Attempting login...');
    const result = await loginUser('mrdoofficial1@gmail.com', 'password');
    console.log('Login result:', result);
  } catch (err) {
    console.error('Login error:', err);
  }
}

test();
