/**
 * tests/setup.js — Global Vitest setup.
 * Configures TextEncoder/TextDecoder (required by sql.js in jsdom)
 * and sets up the sql.js locateFile path for Node.
 */
import { TextEncoder, TextDecoder } from 'util';

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = /** @type {typeof globalThis.TextDecoder} */ (TextDecoder);
}
