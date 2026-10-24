import { execFileSync, spawnSync } from 'node:child_process';

/**
 * Small wrapper around the GitHub CLI.
 *
 * The generator only needs a handful of operations: check auth, resolve the
 * owner, create an empty repository from the current directory and set its
 * metadata. Keeping them here makes `new-site.mjs` readable and gives us one
 * place to improve error messages.
 */

export function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: 'pipe',
    maxBuffer: 32 * 1024 * 1024,
    ...options,
  });
}

export function runQuiet(command, args, options = {}) {
  try {
    return run(command, args, options).trim();
  } catch {
    return null;
  }
}

export function gh(args, options = {}) {
  return run('gh', args, options);
}

export function ghJson(args, options = {}) {
  return JSON.parse(gh(args, options));
}

export function ghAvailable() {
  return runQuiet('gh', ['--version']) !== null;
}

export function authStatus() {
  const result = spawnSync('gh', ['auth', 'status'], { encoding: 'utf8' });
  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  return {
    authenticated: result.status === 0,
    output: output.trim(),
    scopes: readScopes(output),
  };
}

function readScopes(text) {
  const line = text.match(/Token scopes:\s*(.+)/);
  if (!line) {
    return [];
  }
  return [...line[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
}

export function currentUser() {
  return ghJson(['api', 'user']);
}

/** Returns `{ type: 'user' | 'org', login }`, or `null` when it cannot be resolved. */
export function resolveOwner(owner) {
  if (runQuiet('gh', ['api', `users/${owner}`, '--jq', '.login'])) {
    return { type: 'user', login: owner };
  }
  if (runQuiet('gh', ['api', `orgs/${owner}`, '--jq', '.login'])) {
    return { type: 'org', login: owner };
  }
  return null;
}

export function repoExists(fullName) {
  return runQuiet('gh', ['repo', 'view', fullName, '--json', 'name']) !== null;
}

export function createRepo({
  owner,
  name,
  description,
  homepage,
  visibility = 'private',
  topics = [],
  cwd,
}) {
  const fullName = `${owner}/${name}`;
  const createArgs = [
    'repo',
    'create',
    fullName,
    visibility === 'public' ? '--public' : '--private',
    '--source',
    '.',
    '--remote',
    'origin',
    '--push',
    '--description',
    description,
  ];

  if (homepage) {
    createArgs.push('--homepage', homepage);
  }

  gh(createArgs, { cwd });

  const editArgs = [
    'repo',
    'edit',
    fullName,
    '--delete-branch-on-merge',
    '--enable-issues=false',
    '--enable-wiki=false',
    '--enable-projects=false',
  ];

  if (homepage) {
    editArgs.push('--homepage', homepage);
  }

  for (const topic of topics) {
    editArgs.push('--add-topic', topic);
  }

  gh(editArgs);

  return `https://github.com/${fullName}`;
}

export function deleteRepo(fullName) {
  gh(['repo', 'delete', fullName, '--yes']);
}
