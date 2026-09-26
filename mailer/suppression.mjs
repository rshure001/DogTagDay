import fs from 'node:fs/promises';
import crypto from 'node:crypto';

// Fail closed if the registry is missing or malformed. Do not bypass on errors.
export async function suppressionStatus(email, file = new URL('./suppression-hashes.json', import.meta.url)) {
  const registry = JSON.parse(await fs.readFile(file, 'utf8'));
  if (registry.version !== 1 || !registry.entries || Array.isArray(registry.entries) || typeof registry.entries !== 'object') {
    throw new Error('Invalid suppression registry');
  }
  const digest = crypto.createHash('sha256').update(String(email).trim().toLowerCase()).digest('hex');
  return Object.hasOwn(registry.entries, digest) ? registry.entries[digest] || 'suppressed' : null;
}
