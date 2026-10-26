#!/usr/bin/env node
/**
 * Deploys the static build to Cloudflare Pages.
 *
 *   npm run build
 *   npm run deploy
 *
 * Credentials are read, in order, from the environment, the permanent store
 * `~/.config/lakuspide/cloudflare.env` (chmod 600) or the legacy
 * `~/.cloudflare-token` files. The token is never printed and never written
 * to the repository.
 *
 *   npm run deploy -- --project app-lakuspide --branch main
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { loadCloudflareCredentials } from './lib/credentials.mjs';

const DEFAULT_PROJECT = 'app-lakuspide';
const BUILD_DIR = 'dist/app/browser';

function readArg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
}

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

const credentials = loadCloudflareCredentials();
const generatedProject = fs.existsSync('.template.json');
const project =
  readArg('project', '') ||
  process.env['CLOUDFLARE_PAGES_PROJECT'] ||
  (generatedProject ? '' : DEFAULT_PROJECT);
const branch = readArg('branch', 'main');

if (!fs.existsSync(`${BUILD_DIR}/index.html`)) {
  fail(`No hay build en ${BUILD_DIR}. Ejecuta primero: npm run build`);
}

if (!project) {
  fail(
    'Indica el proyecto de Pages: --project <nombre>, o define CLOUDFLARE_PAGES_PROJECT.',
  );
}

if (!credentials.token) {
  fail(
    `Falta CLOUDFLARE_API_TOKEN. Guárdalo en ${credentials.store} (chmod 600) ` +
      'o expórtalo en el entorno. No lo escribas en el repositorio.',
  );
}

if (!credentials.accountId) {
  fail(
    'Falta CLOUDFLARE_ACCOUNT_ID. Expórtalo o guárdalo en ' +
      `${credentials.store}.`,
  );
}

console.log(`→ Desplegando ${BUILD_DIR} en Cloudflare Pages`);
console.log(`  proyecto: ${project}`);
console.log(`  rama:     ${branch}`);

const result = spawnSync(
  'npx',
  [
    '--no-install',
    'wrangler',
    'pages',
    'deploy',
    BUILD_DIR,
    `--project-name=${project}`,
    `--branch=${branch}`,
  ],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      CLOUDFLARE_API_TOKEN: credentials.token,
      CLOUDFLARE_ACCOUNT_ID: credentials.accountId,
      WRANGLER_LOG_SANITIZE: 'true',
    },
  },
);

process.exit(result.status ?? 1);
