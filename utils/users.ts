import fs from 'node:fs';
import { CREDENTIALS_FILE } from './paths';

export interface TestUser {
  username: string;
  email: string;
  password: string;
}

/** Short unique token so parallel workers and repeated runs never collide on the shared public site. */
export function uniqueId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function newUser(): TestUser {
  const id = uniqueId();
  return {
    username: `qa_${id}`,
    email: `qa_${id}@example.com`,
    password: process.env.TEST_PASSWORD ?? 'Passw0rd!123',
  };
}

/** The user registered by auth.setup.ts; used by tests that need an existing account. */
export function registeredUser(): TestUser {
  if (!fs.existsSync(CREDENTIALS_FILE)) {
    throw new Error(`${CREDENTIALS_FILE} not found - the "setup" project must run first.`);
  }
  return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8')) as TestUser;
}
