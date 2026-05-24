/**
 * Copies sql-wasm.wasm from node_modules → public/ after npm install.
 * Run automatically via the "postinstall" npm script.
 */
import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const src = resolve(root, 'node_modules/sql.js/dist/sql-wasm.wasm');
const destDir = resolve(root, 'public');
const dest = resolve(destDir, 'sql-wasm.wasm');

if (!existsSync(src)) {
  console.warn('⚠  sql.js WASM not found – run npm install first');
  process.exit(0);
}

if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

if (!existsSync(dest)) {
  cpSync(src, dest);
  console.log('✓ Copied sql-wasm.wasm to public/');
} else {
  console.log('✓ public/sql-wasm.wasm already present');
}
