/**
 * Remove the SQLite database file (and WAL/SHM sidecars) so the next server start
 * recreates an empty DB and reapplies migrations.
 *
 * Run from repo root: pnpm db:reset
 *
 * Resolves `DATABASE_URL` the same way as the server when it runs from `packages/server`:
 * relative paths are resolved against `packages/server/`.
 */
import { config } from 'dotenv';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
config({ path: path.join(repoRoot, '.env') });

const serverPkg = path.join(repoRoot, 'packages/server');
const raw = process.env.DATABASE_URL?.trim();
const dbPath = raw
  ? path.isAbsolute(raw)
    ? raw
    : path.resolve(serverPkg, raw)
  : path.join(serverPkg, 'forkverse.db');

const extras = [`${dbPath}-wal`, `${dbPath}-shm`, `${dbPath}-journal`];
const targets = [dbPath, ...extras];

let removed = 0;
for (const p of targets) {
  if (existsSync(p)) {
    rmSync(p, { force: true });
    console.log(`removed: ${p}`);
    removed++;
  }
}

if (removed === 0) {
  console.log(`no database files found at:\n  ${dbPath}`);
  console.log('(WAL/SHM/journal sidecars are removed if present.)');
} else {
  console.log(`\nremoved ${removed} file(s).`);
}

console.log('\nNext: start the server (`pnpm dev` or `pnpm dev:server`) to run migrations on a fresh DB.');
console.log('Optional: `pnpm seed` for mock users and posts.\n');
