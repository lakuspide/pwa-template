#!/usr/bin/env node
/**
 * Diagnóstico rápido para crear proyectos con repo automático.
 *
 *   npm run repo:doctor
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authStatus, ghAvailable, runQuiet } from './lib/github.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const results = [];

function check(label, fn, { critical = true, hint = '' } = {}) {
  try {
    const detail = fn();
    results.push({ label, ok: true, detail });
  } catch (error) {
    results.push({ label, ok: false, critical, detail: error.message, hint });
  }
}

check('Node.js', () => {
  const major = Number(process.versions.node.split('.')[0]);
  if (major < 20) {
    throw new Error(`v${process.versions.node}; se necesita 20 o superior`);
  }
  return `v${process.versions.node}`;
});

check('GitHub CLI', () => {
  if (!ghAvailable()) {
    throw new Error('no instalado');
  }
  return runQuiet('gh', ['--version'])?.split('\n')[0] ?? 'instalado';
}, { hint: 'Descarga gh en ~/.local/bin: https://github.com/cli/cli/releases' });

check('Sesión de GitHub', () => {
  const auth = authStatus();
  if (!auth.authenticated) {
    throw new Error('sin autenticar');
  }
  const account = runQuiet('gh', ['api', 'user', '--jq', '.login']);
  return `@${account}`;
}, { hint: 'Ejecuta: gh auth login --hostname github.com --git-protocol https --web' });

check('Scopes de GitHub', () => {
  const auth = authStatus();
  const required = ['repo'];
  const missing = required.filter((scope) => !auth.scopes.includes(scope));
  if (missing.length) {
    throw new Error(`faltan: ${missing.join(', ')}`);
  }
  const optional = ['workflow', 'delete_repo'].filter((scope) => !auth.scopes.includes(scope));
  return optional.length
    ? `repo OK; opcionales ausentes: ${optional.join(', ')}`
    : 'repo, workflow, delete_repo';
}, { hint: 'Ejecuta: gh auth refresh -s workflow,delete_repo' });

check('Identidad de Git', () => {
  const name = runQuiet('git', ['config', '--global', 'user.name']);
  const email = runQuiet('git', ['config', '--global', 'user.email']);
  if (!name || !email) {
    throw new Error('user.name o user.email sin configurar');
  }
  return `${name} <${email}>`;
}, { hint: 'git config --global user.name "..." && git config --global user.email "..."' });

check('Presets', () => {
  const source = fs.readFileSync(path.join(ROOT, 'src/site/presets.ts'), 'utf8');
  const ids = [...source.matchAll(/^  id: '([a-z][a-z-]*)',$/gm)].map((match) => match[1]);
  if (ids.length === 0) {
    throw new Error('no encuentro src/site/presets.ts');
  }
  return ids.join(', ');
}, { critical: false, hint: 'El generador valida --preset contra esta lista' });

check('Remoto de la plantilla', () => {
  const remote = runQuiet('git', ['remote', 'get-url', 'origin'], { cwd: ROOT });
  if (!remote) {
    throw new Error('sin remoto origin');
  }
  return remote.replace(/^https:\/\/([^@]+@)?/, 'https://');
});

check('API de GitHub', () => {
  const status = runQuiet('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '10', 'https://api.github.com']);
  if (status !== '200') {
    throw new Error(`HTTP ${status ?? 'sin respuesta'}`);
  }
  return 'https://api.github.com → 200';
});

check('Árbol de trabajo', () => {
  const status = runQuiet('git', ['status', '--porcelain'], { cwd: ROOT });
  if (status) {
    throw new Error('hay cambios sin commitear');
  }
  return 'limpio';
}, { critical: false, hint: 'Haz commit antes de generar proyectos desde HEAD' });

console.log('\nDiagnóstico de la fábrica de proyectos\n');
for (const result of results) {
  const icon = result.ok ? '✓' : result.critical ? '✖' : '!';
  console.log(`${icon} ${result.label.padEnd(22)} ${result.detail}`);
  if (!result.ok && result.hint) {
    console.log(`  → ${result.hint}`);
  }
}

const failed = results.some((result) => !result.ok && result.critical);
console.log(failed ? '\nHay bloqueos que resolver antes de crear proyectos.\n' : '\nTodo listo para crear proyectos.\n');
process.exit(failed ? 1 : 0);
