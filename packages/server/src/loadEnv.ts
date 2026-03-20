/**
 * Must be imported before any other local modules that read process.env at load time.
 * ES modules hoist `import` above inline code in index.ts, so dotenv cannot run there first.
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
config({ path: resolve(__dirname, '../../../.env') });
