#!/usr/bin/env node
/**
 * Deploys the static build to Cloudflare Pages.
 *
 *   npm run build
 *   npm run deploy
 *
 * Credentials, in order of precedence:
 *   1. CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID in the environment
 *   2. ~/.cloudflare-token (and ~/.cloudflare-account, optional)
 *
 * The token is never printed and never written to the repository.
 *
 *   npm run deploy -- --project app-lakuspide --branch main
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DEFAULT_PROJECT = 'app-lakuspide';
const BUILD_DIR = 'dist/app/browser';

function readArg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? fallback : process.argv[index + 1];
}

function readFileTrimmed(file) {
  try {
    return fs.readFileSync(file, 'utf8').trim();
  } catch {
    return '';
  }
}

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

const generatedProject = fs.existsSync('.template.json');
const project =
  readArg('project', '') ||
  process.env['CLOUDFLARE_PAGES_PROJECT'] ||
  (generatedProject ? '' : DEFAULT_PROJECT);
const branch = readArg('branch', 'main');
const accountId =
  process.env['CLOUDFLARE_ACCOUNT_ID'] ||
  readFileTrimmed(path.join(os.homedir(), '.cloudflare-account'));
const token =
  process.env['CLOUDFLARE_API_TOKEN'] ||
  readFileTrimmed(path.join(os.homedir(), '.cloudflare-token'));

if (!fs.existsSync(path.join(BUILD_DIR, 'index.html'))) {
  fail(`No hay build en ${BUILD_DIR}. Ejecuta primero: npm run build`);
}

if (!project) {
  fail(
    'Indica el proyecto de Pages: --project <nombre>, o define CLOUDFLARE_PAGES_PROJECT.',
  );
}

if (!token) {
  fail(
    'Falta CLOUDFLARE_API_TOKEN. Expórtalo en el entorno o guárdalo en ~/.cloudflare-token ' +
      '(permisos 600). No lo escribas en el repositorio.',
  );
}

if (!accountId) {
  fail(
    'Falta CLOUDFLARE_ACCOUNT_ID. Expórtalo o guárdalo en ~/.cloudflare-account ' +
      '(el id de cuenta no es secreto, pero conviene tenerlo a mano).',
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
      CLOUDFLARE_API_TOKEN: token,
      CLOUDFLARE_ACCOUNT_ID: accountId,
      WRANGLER_LOG_SANITIZE: 'true',
    },
  },
);

process.exit(result.status ?? 1);
