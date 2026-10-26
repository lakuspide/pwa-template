import { spawnSync } from 'node:child_process';
import { loadCloudflareCredentials } from './credentials.mjs';
import { ghBin } from './github.mjs';

/**
 * Small Cloudflare API client for the project factory.
 *
 * Only what a generated project needs: create its Pages project, attach the
 * custom domain and deploy the first build. Credentials come from the
 * permanent store; nothing is written to the repository.
 */

const API = 'https://api.cloudflare.com/client/v4';

async function api(path, { method = 'GET', body, credentials } = {}) {
  const creds = credentials ?? loadCloudflareCredentials();
  if (!creds.token) {
    throw new Error('Falta el token de Cloudflare.');
  }

  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${creds.token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  return { status: response.status, ok: response.ok, data };
}

/** Returns the Pages project, or null when it does not exist yet. */
export async function findPagesProject(name, credentials) {
  const creds = credentials ?? loadCloudflareCredentials();
  const result = await api(
    `/accounts/${creds.accountId}/pages/projects/${encodeURIComponent(name)}`,
    { credentials: creds },
  );

  if (result.status === 404) {
    return null;
  }
  if (!result.ok) {
    throw new Error(cloudflareError('No se pudo leer el proyecto de Pages', result));
  }
  return result.data.result;
}

/** Creates the Pages project when needed and returns it. */
export async function ensurePagesProject(name, credentials) {
  const creds = credentials ?? loadCloudflareCredentials();
  const existing = await findPagesProject(name, creds);
  if (existing) {
    return existing;
  }

  const created = await api(`/accounts/${creds.accountId}/pages/projects`, {
    method: 'POST',
    credentials: creds,
    body: { name, production_branch: 'main' },
  });

  if (!created.ok) {
    throw new Error(cloudflareError('No se pudo crear el proyecto de Pages', created));
  }
  return created.data.result;
}

/**
 * Attaches `domain` to the project. Cloudflare creates the CNAME when the zone
 * belongs to the same account. An existing domain is not an error.
 */
export async function attachDomain(projectName, domain, credentials) {
  const creds = credentials ?? loadCloudflareCredentials();
  const result = await api(
    `/accounts/${creds.accountId}/pages/projects/${encodeURIComponent(projectName)}/domains`,
    { method: 'POST', credentials: creds, body: { name: domain } },
  );

  if (result.ok) {
    return { status: 'attached', domain };
  }

  const messages = (result.data?.errors ?? []).map((error) => error.message).join(' ');
  if (/already|exists|duplicate/i.test(messages)) {
    return { status: 'exists', domain };
  }

  throw new Error(cloudflareError(`No se pudo enganchar ${domain}`, result));
}

/** Uploads `dist/app/browser` to the project. */
export function deployDirectory(directory, projectName, credentials) {
  const creds = credentials ?? loadCloudflareCredentials();
  const result = spawnSync(
    'npx',
    [
      '--no-install',
      'wrangler',
      'pages',
      'deploy',
      directory,
      `--project-name=${projectName}`,
      '--branch=main',
    ],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        CLOUDFLARE_API_TOKEN: creds.token,
        CLOUDFLARE_ACCOUNT_ID: creds.accountId,
        WRANGLER_LOG_SANITIZE: 'true',
      },
    },
  );

  if (result.status !== 0) {
    throw new Error('wrangler pages deploy falló.');
  }
}

/** Mirrors the Cloudflare credentials into the repository secrets. */
export function setRepoSecrets(repoFullName, credentials) {
  const creds = credentials ?? loadCloudflareCredentials();
  const secrets = {
    CLOUDFLARE_API_TOKEN: creds.token,
    CLOUDFLARE_ACCOUNT_ID: creds.accountId,
  };

  for (const [name, value] of Object.entries(secrets)) {
    const result = spawnSync(ghBin(), ['secret', 'set', name, '--repo', repoFullName], {
      input: value,
      encoding: 'utf8',
    });
    if (result.status !== 0) {
      throw new Error(
        `No se pudo guardar el secreto ${name} en ${repoFullName}: ${result.stderr ?? ''}`,
      );
    }
  }
}

function cloudflareError(prefix, result) {
  const detail = (result.data?.errors ?? [])
    .map((error) => `${error.code ?? ''} ${error.message ?? ''}`.trim())
    .filter(Boolean)
    .join(' · ');
  return `${prefix} (HTTP ${result.status})${detail ? `: ${detail}` : ''}`;
}
