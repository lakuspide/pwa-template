# GitHub automático

Cada proyecto nuevo se publica en su propio repositorio, sin pasar por la web de
GitHub. La plantilla vive en `lakuspide/pwa-template` y el generador crea un repo
privado por proyecto.

## Requisitos (una sola vez)

```bash
# gh en ~/.local/bin (sin sudo)
gh --version

# Autenticación por dispositivo
gh auth login --hostname github.com --git-protocol https --web
```

Scopes necesarios:

| Scope | Para qué |
| --- | --- |
| `repo` | Crear repositorios, hacer push y editar metadatos |
| `workflow` | Subir `.github/workflows/` (CI) |
| `delete_repo` | Borrar repos de prueba (opcional) |
| `read:org` | Crear repos dentro de una organización |

Si falta alguno:

```bash
gh auth refresh -s workflow,delete_repo
```

La identidad de Git se configura una vez:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "ID+usuario@users.noreply.github.com"
```

Comprueba todo con:

```bash
npm run repo:doctor
```

## Crear un proyecto

```bash
npm run new -- \
  --name "Café Central" \
  --slug cafe-central \
  --owner lakuspide \
  --domain cafe.lakuspide.cloud
```

Resultado:

- `~/proyectos/cafe-central` con la plantilla copiada.
- `npm install` y `npm run build` verificados (salvo `--skip-build`).
- Repo privado `https://github.com/lakuspide/cafe-central`.
- `main` con el commit inicial, descripción, homepage y topics.
- `.template.json` con el commit exacto de la plantilla.

Si el repo va a tu cuenta personal, omite `--owner`: se usa la cuenta autenticada.

> `--preset` se aplica de verdad: escribe `ACTIVE_PRESET` y `BRAND_OVERRIDES` en
> `src/site/site.config.ts` y pone `DEMO_MODE = false`. El proyecto arranca con
> el catálogo, las secciones y los flags del sector elegido, sin selector de demo.
> Detalle: [`PRESETS.md`](PRESETS.md).

## Opciones

| Flag | Efecto |
| --- | --- |
| `--name <texto>` | Nombre visible (obligatorio) |
| `--slug <slug>` | Carpeta y nombre por defecto del repo |
| `--owner <cuenta>` | Usuario u organización de GitHub |
| `--repo-name <nombre>` | Nombre del repo si difiere del slug |
| `--domain <dominio>` | Homepage del repo y dominio previsto |
| `--preset <nombre>` | `boutique`, `menu`, `showcase`, `services`, `real-estate`, `market` |
| `--short-name <texto>` | Nombre corto del manifest |
| `--tagline <texto>` | Tagline de la app |
| `--description <texto>` | Descripción de la app y del repo |
| `--lang`, `--locale`, `--currency` | Idioma, locale y moneda |
| `--dir <ruta>` | Carpeta destino (por defecto `~/proyectos/<slug>`) |
| `--public` | Repo público (por defecto privado) |
| `--no-github` | Solo proyecto local |
| `--skip-build` | Omite install/build; solo sincroniza el lockfile |
| `--allow-dirty` | Genera desde una plantilla con cambios sin commitear |
| `--template-ref <ref>` | Tag o commit de la plantilla (por defecto `HEAD`) |
| `--dry-run` | Muestra el plan sin escribir nada |

## Qué hace exactamente

1. Comprueba `gh`, la sesión, los scopes, el owner y que el repo no exista.
2. Copia la plantilla desde `git archive` (solo archivos versionados).
3. Aplica el preset en `src/site/site.config.ts` (`ACTIVE_PRESET`,
   `BRAND_OVERRIDES`, `DEMO_MODE = false`), actualiza manifest, `index.html` y
   `package.json`, y escribe un README propio y `.template.json`.
4. Ejecuta `npm install` y `npm run build` (salvo `--skip-build`).
5. Inicializa `main` y crea el commit inicial.
6. Crea el repo, hace push y ajusta homepage, topics, issues, wiki y projects.
7. Imprime el repo, la carpeta y los siguientes comandos.

## Errores frecuentes

| Error | Solución |
| --- | --- |
| `gh: command not found` | Instala gh en `~/.local/bin` o añade el directorio al `PATH` |
| `HTTP 403` al crear el repo | Revisa el scope `repo` y, en organizaciones, la autorización SSO |
| `refusing to allow a Personal Access Token to create or update workflow` | `gh auth refresh -s workflow` |
| `repository already exists` | Cambia `--repo-name` o borra el repo |
| `La carpeta ya existe y no está vacía` | Usa otro `--dir` o vacía la carpeta |
| `La plantilla tiene cambios sin commitear` | Haz commit o usa `--allow-dirty` (la copia sale de `HEAD`) |
| El build falla | El proyecto queda en disco sin repo; corrige y vuelve a ejecutar |

## Seguridad

- El token lo guarda `gh` en `~/.config/gh/hosts.yml` con permisos restringidos.
  No se escribe en el repo ni se imprime.
- No subas `.env`, `.dev.vars`, `.cloudflare-token` ni `.github-token`; ya están
  en `.gitignore`.
- Para CI, añade `CLOUDFLARE_API_TOKEN` como secret del repositorio, nunca en el
  código.
- Puedes revocar la sesión con `gh auth logout` o desde GitHub → Settings →
  Applications.
