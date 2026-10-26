#!/usr/bin/env node
/**
 * Create a new independent PWA from this template and publish it to GitHub.
 *
 * Usage:
 *   npm run new -- --name "Café Central" --slug cafe-central \
 *     --owner lakuspide --domain cafe.lakuspide.cloud
 *
 * The generated project is a full copy (no workspace dependency): its own git
 * repository, its own manifest, its own package.json and, optionally, its own
 * Cloudflare Pages project later on.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  authStatus,
  createRepo,
  currentUser,
  ghAvailable,
  ghBin,
  repoExists,
  resolveOwner,
} from './lib/github.mjs';
import { loadCloudflareCredentials } from './lib/credentials.mjs';
import {
  attachDomain,
  deployDirectory,
  ensurePagesProject,
  setRepoSecrets,
} from './lib/cloudflare.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_ROOT = path.resolve(__dirname, '..');
const TEMPLATE_REPO = 'lakuspide/pwa-template';
const PRESETS_SOURCE = path.join(TEMPLATE_ROOT, 'src/site/presets.ts');
const TEMPLATE_ONLY_FILES = [
  'ARQUITECTURA.md',
  'CHANGELOG.md',
  'INTEGRACION.md',
  'INTEGRATION.md',
  'ROADMAP.md',
  'docs/GITHUB.md',
];
const FACTORY_ONLY_FILES = [
  '.github/workflows/deploy-demo.yml',
  'scripts/new-site.mjs',
  'scripts/deploy.mjs',
  'scripts/lib/github.mjs',
  'scripts/lib/cloudflare.mjs',
  'scripts/lib/credentials.mjs',
  'scripts/doctor.mjs',
];
const FACTORY_ONLY_DIRS = ['.opencode'];

const rawArgs = parseArgs(process.argv.slice(2));

if (rawArgs.help || rawArgs.h) {
  printUsage();
  process.exit(0);
}

main().catch((error) => {
  console.error(`\n✖ ${error.message}`);
  process.exit(1);
});

async function main() {
  const options = buildOptions(rawArgs);
  printPlan(options);

  if (options.dryRun) {
    console.log('\nDry run: no se ha creado nada.');
    return;
  }

  ensureTargetIsFree(options.dir);
  ensureTemplateIsClean(options.allowDirty);

  const templateCommit = run('git', ['rev-parse', 'HEAD'], { cwd: TEMPLATE_ROOT }).trim();
  console.log(`\n→ Copiando plantilla (${templateCommit.slice(0, 7)}) en ${options.dir}`);
  extractTemplate(options.dir, options.templateRef);

  console.log('→ Aplicando marca y contenido');
  applyBranding(options, templateCommit);

  if (!options.skipBuild) {
    console.log('→ Instalando dependencias (npm install)');
    runLive('npm', ['install', '--no-audit', '--no-fund'], options.dir);
    console.log('→ Verificando el build de producción');
    runLive('npm', ['run', 'build'], options.dir);
  } else {
    console.log('→ Sincronizando package-lock.json');
    runLive(
      'npm',
      ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund'],
      options.dir,
    );
  }

  console.log('→ Inicializando git');
  initialiseGit(options);

  if (options.noGithub) {
    console.log(`\n✓ Proyecto creado sin repo remoto: ${options.dir}`);
    printNextSteps(options, null);
    return;
  }

  console.log('→ Creando repositorio en GitHub');
  const repoUrl = createRepo({
    owner: options.owner,
    name: options.repoName,
    description: options.description,
    homepage: options.domain ? `https://${options.domain}` : undefined,
    visibility: options.visibility,
    topics: ['pwa', 'angular', 'catalog', 'offline', options.preset],
    cwd: options.dir,
  });

  console.log(`\n✓ Proyecto creado y publicado: ${repoUrl}`);

  if (options.deploy) {
    const credentials = loadCloudflareCredentials();
    const dir = options.dir;

    console.log('→ Creando proyecto de Cloudflare Pages');
    await ensurePagesProject(options.pagesProject, credentials);

    console.log('→ Desplegando el primer build');
    deployDirectory(path.join(dir, 'dist/app/browser'), options.pagesProject, credentials);

    if (options.domain) {
      console.log(`→ Enganchando el dominio ${options.domain}`);
      const domain = await attachDomain(options.pagesProject, options.domain, credentials);
      const dnsLabel = {
        created: 'CNAME creado',
        updated: 'CNAME actualizado',
        exists: 'CNAME ya existente',
        skipped: 'DNS gestionado fuera de la zona',
      }[domain.dns] ?? domain.dns;
      console.log(
        `  ${domain.status === 'exists' ? 'dominio ya enganchado' : 'dominio enganchado'} · ${dnsLabel}`,
      );
    }

    console.log('→ Guardando los secretos de Cloudflare en el repositorio');
    setRepoSecrets(`${options.owner}/${options.repoName}`, credentials);

    console.log(`\n✓ Desplegado: https://${options.domain ?? `${options.pagesProject}.pages.dev`}`);
  } else if (options.deploySkipped) {
    console.log('\n! Despliegue omitido; el proyecto quedó solo en GitHub.');
  }

  printNextSteps(options, repoUrl);
}

function buildOptions(args) {
  const name = String(args.name ?? '').trim();
  if (!name) {
    throw new Error('Falta --name. Ejemplo: --name "Café Central"');
  }

  const slug = String(args.slug ?? slugify(name)).trim();
  assertSlug(slug);

  const repoName = String(args['repo-name'] ?? slug).trim();
  if (!/^[A-Za-z0-9._-]{1,100}$/.test(repoName)) {
    throw new Error(`Nombre de repositorio no válido: ${repoName}`);
  }

  const domain = args.domain ? String(args.domain).trim().toLowerCase() : null;
  if (domain && !/^(?!-)[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    throw new Error(`Dominio no válido: ${domain}`);
  }

  const noGithub = Boolean(args['no-github']);
  const owner = String(args.owner ?? '').trim();
  const shortName = String(args['short-name'] ?? deriveShortName(name)).trim();
  const tagline = String(args.tagline ?? 'Catálogo digital').trim();
  const description = String(
    args.description ?? `${name} — PWA de catálogo digital`,
  ).trim();

  const presetIds = readPresetIds();
  const preset = String(args.preset ?? 'boutique').trim();
  if (!presetIds.includes(preset)) {
    throw new Error(
      `Preset no válido: "${preset}". Disponibles: ${presetIds.join(', ')}.`,
    );
  }

  const skipBuild = Boolean(args['skip-build']);
  const credentials = loadCloudflareCredentials();
  const deployRequested = Boolean(args.deploy);
  const deploy =
    !noGithub &&
    !skipBuild &&
    !args['no-deploy'] &&
    (deployRequested || credentials.configured);

  if (deploy && !credentials.configured) {
    throw new Error(
      'Para desplegar hace falta el token de Cloudflare en ~/.config/lakuspide/cloudflare.env ' +
        'o usa --no-deploy.',
    );
  }

  const pagesProject = String(args['pages-project'] ?? slug).trim();
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(pagesProject)) {
    throw new Error(`Nombre de proyecto de Pages no válido: ${pagesProject}`);
  }

  const options = {
    name,
    slug,
    repoName,
    shortName,
    tagline,
    description,
    owner,
    domain,
    preset,
    lang: args.lang ? String(args.lang) : null,
    locale: args.locale ? String(args.locale) : null,
    currency: args.currency ? String(args.currency).toUpperCase() : null,
    dir: path.resolve(String(args.dir ?? path.join(os.homedir(), 'proyectos', slug))),
    visibility: args.public ? 'public' : 'private',
    noGithub,
    dryRun: Boolean(args['dry-run']),
    skipBuild,
    allowDirty: Boolean(args['allow-dirty']),
    templateRef: String(args['template-ref'] ?? 'HEAD'),
    deploy,
    deploySkipped: !deploy && (deployRequested || credentials.configured),
    pagesProject,
  };

  if (!noGithub) {
    if (!ghAvailable()) {
      throw new Error(
        'GitHub CLI (gh) no está instalado. Instálalo en ~/.local/bin o usa --no-github.',
      );
    }

    const auth = authStatus();
    if (!auth.authenticated) {
      throw new Error('GitHub CLI no está autenticado. Ejecuta: gh auth login');
    }
    if (!auth.scopes.includes('repo')) {
      throw new Error(
        'El token de GitHub no tiene el scope "repo". Ejecuta: gh auth refresh -s repo,workflow',
      );
    }

    const user = currentUser();
    options.owner = options.owner || user.login;

    const resolved = resolveOwner(options.owner);
    if (!resolved) {
      throw new Error(
        `No encuentro la cuenta u organización "${options.owner}". Revisa --owner.`,
      );
    }

    if (repoExists(`${options.owner}/${options.repoName}`)) {
      throw new Error(
        `El repositorio ${options.owner}/${options.repoName} ya existe. Usa --repo-name con otro nombre.`,
      );
    }
  }

  return options;
}

function printPlan(options) {
  console.log('Plan del proyecto');
  console.log(`  Nombre        ${options.name}`);
  console.log(`  Slug          ${options.slug}`);
  console.log(`  Repo          ${options.noGithub ? '(sin GitHub)' : `${options.owner}/${options.repoName}`} (${options.visibility})`);
  console.log(`  Carpeta       ${options.dir}`);
  console.log(`  Preset        ${options.preset} (aplicado; DEMO_MODE = false)`);
  console.log(`  Dominio       ${options.domain ?? '(sin dominio todavía)'}`);
  console.log(`  Build         ${options.skipBuild ? 'omitido' : 'npm install + npm run build'}`);
  console.log(
    `  Despliegue    ${
      options.deploy
        ? `Cloudflare Pages → ${options.pagesProject}${options.domain ? ` (${options.domain})` : ''}`
        : options.deploySkipped
          ? 'omitido (sin credenciales, --no-deploy o --skip-build)'
          : 'no (sin GitHub)'
    }`,
  );
}

function ensureTargetIsFree(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  const entries = fs.readdirSync(dir);
  if (entries.length > 0) {
    throw new Error(`La carpeta ${dir} ya existe y no está vacía.`);
  }
}

function ensureTemplateIsClean(allowDirty) {
  const status = run('git', ['status', '--porcelain'], { cwd: TEMPLATE_ROOT }).trim();
  if (status && !allowDirty) {
    throw new Error(
      'La plantilla tiene cambios sin commitear. La copia se hace desde HEAD; ' +
        'haz commit o pasa --allow-dirty si sabes lo que haces.',
    );
  }
}

function extractTemplate(destination, ref) {
  fs.mkdirSync(destination, { recursive: true });
  const archive = run('git', ['archive', '--format=tar', ref], {
    cwd: TEMPLATE_ROOT,
    encoding: null,
  });
  execFileSync('tar', ['-x', '-C', destination], { input: archive });
}

function applyBranding(options, templateCommit) {
  const dir = options.dir;

  const siteConfigFile = path.join(dir, 'src/site/site.config.ts');
  replaceRequired(
    siteConfigFile,
    /export const DEMO_MODE = (?:true|false);/,
    'export const DEMO_MODE = false;',
  );
  replaceRequired(
    siteConfigFile,
    /export const ACTIVE_PRESET: SectorPresetId = '[^']*';/,
    `export const ACTIVE_PRESET: SectorPresetId = ${sq(options.preset)};`,
  );

  const overrides = {
    appName: options.name,
    shortName: options.shortName,
    tagline: options.tagline,
    description: options.description,
    version: '0.1.0',
    storagePrefix: options.slug,
  };
  if (options.lang) {
    overrides.lang = options.lang;
  }
  if (options.locale) {
    overrides.locale = options.locale;
  }
  if (options.currency) {
    overrides.currency = options.currency;
  }
  replaceRequired(
    siteConfigFile,
    /export const BRAND_OVERRIDES: BrandOverrides = \{[\s\S]*?\n\};/,
    [
      'export const BRAND_OVERRIDES: BrandOverrides = {',
      ...Object.entries(overrides).map(([key, value]) => `  ${key}: ${sq(value)},`),
      '};',
    ].join('\n'),
  );

  const indexFile = path.join(dir, 'src/index.html');
  replaceRequired(indexFile, /<title>[^<]*<\/title>/, `<title>${html(options.name)}</title>`);
  if (options.lang) {
    replaceRequired(indexFile, /<html lang="[^"]*">/, `<html lang="${html(options.lang)}">`);
  }
  replaceRequired(
    indexFile,
    /name="description"\s*\n\s*content="[^"]*"/,
    `name="description"\n      content="${html(options.description)}"`,
  );
  replaceRequired(
    indexFile,
    /name="apple-mobile-web-app-title" content="[^"]*"/,
    `name="apple-mobile-web-app-title" content="${html(options.shortName)}"`,
  );

  const manifestFile = path.join(dir, 'public/manifest.webmanifest');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  manifest.name = options.name;
  manifest.short_name = options.shortName;
  manifest.description = options.description;
  if (options.lang) {
    manifest.lang = options.lang;
  }
  fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);

  const packageFile = path.join(dir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  pkg.name = options.repoName;
  pkg.version = '0.1.0';
  pkg.description = options.description;
  delete pkg.scripts.new;
  delete pkg.scripts['repo:doctor'];
  delete pkg.scripts.deploy;
  fs.writeFileSync(packageFile, `${JSON.stringify(pkg, null, 2)}\n`);

  if (options.deploy) {
    writeDeployWorkflow(options);
  }

  for (const file of [...TEMPLATE_ONLY_FILES, ...FACTORY_ONLY_FILES, 'README.md']) {
    fs.rmSync(path.join(dir, file), { force: true });
  }
  for (const directory of FACTORY_ONLY_DIRS) {
    fs.rmSync(path.join(dir, directory), { recursive: true, force: true });
  }
  for (const directory of ['scripts/lib', 'scripts', 'docs']) {
    removeIfEmpty(path.join(dir, directory));
  }

  fs.writeFileSync(
    path.join(dir, 'README.md'),
    `# ${options.name}\n\n${options.description}\n\n` +
      `PWA creada desde [\`${TEMPLATE_REPO}\`](https://github.com/${TEMPLATE_REPO}) ` +
      `(commit \`${templateCommit.slice(0, 7)}\`, preset aplicado: \`${options.preset}\`, demo desactivado).\n\n` +
      `## Desarrollo\n\n` +
      '```bash\nnpm install\nnpm run dev    # http://localhost:4200\nnpm test\nnpm run build\n```\n\n' +
      `## Despliegue\n\nEl build estático queda en \`dist/app/browser\`.\n` +
      (options.domain ? `\nDominio previsto: **${options.domain}**\n` : ''),
  );

  fs.writeFileSync(
    path.join(dir, '.template.json'),
    `${JSON.stringify(
      {
        template: TEMPLATE_REPO,
        ref: options.templateRef,
        commit: templateCommit,
        preset: options.preset,
        demoMode: false,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );
}

function writeDeployWorkflow(options) {
  const dir = options.dir;
  const workflowFile = path.join(dir, '.github/workflows/deploy.yml');
  fs.mkdirSync(path.dirname(workflowFile), { recursive: true });
  fs.writeFileSync(
    workflowFile,
    `name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: deploy
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
      CLOUDFLARE_ACCOUNT_ID: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
      PAGES_PROJECT: ${options.pagesProject}
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --watch=false
      - run: npm run build
      - name: Deploy to Cloudflare Pages
        if: env.CLOUDFLARE_API_TOKEN != ''
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: \${{ env.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ env.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist/app/browser --project-name=\${{ env.PAGES_PROJECT }} --branch=main
`,
  );
}

function initialiseGit(options) {
  const dir = options.dir;
  run('git', ['init', '-b', 'main'], { cwd: dir });

  let user = null;
  if (ghAvailable()) {
    const auth = authStatus();
    if (auth.authenticated) {
      user = currentUser();
    }
  }

  const name =
    runQuiet('git', ['config', '--global', 'user.name']) ??
    user?.name ??
    user?.login ??
    'Lakuspide';
  const email =
    runQuiet('git', ['config', '--global', 'user.email']) ??
    (user ? `${user.id}+${user.login}@users.noreply.github.com` : 'noreply@localhost');

  run('git', ['config', 'user.name', name], { cwd: dir });
  run('git', ['config', 'user.email', email], { cwd: dir });
  run('git', ['add', '-A'], { cwd: dir });
  run('git', ['commit', '-m', `feat: initial project ${options.name}`], { cwd: dir });
}

function printNextSteps(options, repoUrl) {
  console.log('\nSiguientes pasos:');
  if (repoUrl) {
    console.log(`  Repo:  ${repoUrl}`);
  }
  console.log(`  cd ${options.dir}`);
  if (options.skipBuild) {
    console.log('  npm install');
  }
  console.log('  npm run dev');
  if (options.domain) {
    console.log(`  Web:   https://${options.domain}`);
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function readPresetIds() {
  const source = fs.readFileSync(PRESETS_SOURCE, 'utf8');
  const ids = [...source.matchAll(/^  id: '([a-z][a-z-]*)',$/gm)].map((match) => match[1]);
  if (ids.length === 0) {
    throw new Error('No encuentro los presets en src/site/presets.ts.');
  }
  return ids;
}

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      continue;
    }
    const [key, inlineValue] = arg.slice(2).split('=');
    if (inlineValue !== undefined) {
      result[key] = inlineValue;
      continue;
    }
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      result[key] = next;
      i += 1;
    } else {
      result[key] = true;
    }
  }
  return result;
}

function printUsage() {
  console.log(`Uso:
  npm run new -- --name "Café Central" [opciones]

Opciones:
  --name <texto>          Nombre visible (obligatorio)
  --slug <slug>           Identificador y carpeta (por defecto, del nombre)
  --owner <cuenta>        Usuario u organización de GitHub (por defecto, el autenticado)
  --repo-name <nombre>    Nombre del repo si difiere del slug
  --domain <dominio>      Dominio previsto; se guarda como homepage del repo
  --preset <nombre>       boutique | menu | showcase | services | real-estate | market
  --short-name <texto>    Nombre corto para el manifest
  --tagline <texto>       Tagline de la app
  --description <texto>   Descripción del proyecto y del repo
  --lang <código>         Idioma (ej. es)
  --locale <locale>       Locale de Intl (ej. es-ES)
  --currency <ISO>        Moneda (ej. EUR)
  --dir <ruta>            Carpeta destino (por defecto ~/proyectos/<slug>)
  --public                Repo público (por defecto privado)
  --no-github             Solo crea el proyecto local, sin repo remoto
  --pages-project <n>     Nombre del proyecto de Cloudflare Pages (por defecto, el slug)
  --deploy                Fuerza el despliegue (por defecto, si hay credenciales)
  --no-deploy             No crea Pages ni despliega
  --skip-build            Omite npm install + build (solo sincroniza el lockfile)
  --allow-dirty           Permite generar desde una plantilla con cambios sin commitear
  --template-ref <ref>    Commit/tag de la plantilla (por defecto HEAD)
  --dry-run               Muestra el plan y no escribe nada
  --help                  Muestra esta ayuda
`);
}

function assertSlug(slug) {
  if (!/^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/.test(slug) || slug.includes('--')) {
    throw new Error(
      `Slug no válido: "${slug}". Usa minúsculas, números y guiones simples (2–50 caracteres).`,
    );
  }
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 50)
    .replace(/-+$/g, '');
}

function deriveShortName(name) {
  const clean = name.trim().replace(/\s+/g, ' ');
  if (clean.length <= 12) {
    return clean;
  }
  const twoWords = clean.split(' ').slice(0, 2).join(' ');
  if (twoWords.length <= 12) {
    return twoWords;
  }
  return clean.slice(0, 12).trim();
}

function sq(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function html(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function replaceRequired(file, pattern, replacement) {
  const before = read(file);
  const after = before.replace(pattern, replacement);
  if (after === before) {
    throw new Error(`No se pudo actualizar ${path.relative(TEMPLATE_ROOT, file)}`);
  }
  fs.writeFileSync(file, after);
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: 'pipe',
    maxBuffer: 32 * 1024 * 1024,
    ...options,
  });
}

function runQuiet(command, args, options = {}) {
  try {
    return run(command, args, options).trim();
  } catch {
    return null;
  }
}

function runLive(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: 'inherit' });
}

function removeIfEmpty(directory) {
  if (fs.existsSync(directory) && fs.readdirSync(directory).length === 0) {
    fs.rmdirSync(directory);
  }
}
