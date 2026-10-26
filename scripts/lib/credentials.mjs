import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Cloudflare credentials for the project factory.
 *
 * They live outside the repository so the same machine can create and deploy
 * projects for as long as the token stays valid:
 *
 *   ~/.config/lakuspide/cloudflare.env   (chmod 600)
 *
 * Environment variables win, so CI can inject its own token. The legacy
 * `~/.cloudflare-token` / `~/.cloudflare-account` files are still read.
 *
 * This module never logs a token.
 */

const STORE = path.join(os.homedir(), '.config', 'lakuspide', 'cloudflare.env');

function parseEnvFile(file) {
  const values = {};
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    return values;
  }

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const separator = line.indexOf('=');
    if (separator === -1) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }

  return values;
}

function readFileTrimmed(file) {
  try {
    return fs.readFileSync(file, 'utf8').trim();
  } catch {
    return '';
  }
}

export function loadCloudflareCredentials() {
  const stored = parseEnvFile(STORE);

  const token =
    process.env['CLOUDFLARE_API_TOKEN'] ||
    stored['CLOUDFLARE_API_TOKEN'] ||
    readFileTrimmed(path.join(os.homedir(), '.cloudflare-token'));

  const accountId =
    process.env['CLOUDFLARE_ACCOUNT_ID'] ||
    stored['CLOUDFLARE_ACCOUNT_ID'] ||
    readFileTrimmed(path.join(os.homedir(), '.cloudflare-account'));

  const zoneId =
    process.env['CLOUDFLARE_ZONE_ID'] || stored['CLOUDFLARE_ZONE_ID'] || '';

  const zoneName =
    process.env['CLOUDFLARE_ZONE_NAME'] ||
    stored['CLOUDFLARE_ZONE_NAME'] ||
    'lakuspide.cloud';

  return {
    token,
    accountId,
    zoneId,
    zoneName,
    store: STORE,
    configured: Boolean(token && accountId),
  };
}

/** Reads the store file directly, for `gh secret set` style commands. */
export function readCredential(key) {
  const stored = parseEnvFile(STORE);
  return process.env[key] || stored[key] || '';
}
