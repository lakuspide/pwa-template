---
name: pwa-factory
description: Create, brand, verify and publish an independent Angular PWA from the Lakuspide template, including automatic GitHub repository creation. Use when the user wants a new PWA/project, a sector demo, or to publish a template-derived site.
---

# PWA Factory

Cada proyecto nace de `lakuspide/pwa-template` y es independiente: su carpeta,
su repo, su manifest, sus iconos y su despliegue. No hay runtime compartido.

## Antes de crear

```bash
npm run repo:doctor
```

Debe pasar `gh`, la sesión, el scope `repo`, la identidad de Git y el remoto de
la plantilla. Si falta `gh`:

```bash
gh auth login --hostname github.com --git-protocol https --web
```

## Crear el proyecto

```bash
npm run new -- \
  --name "Nombre visible" \
  --slug nombre-slug \
  --owner lakuspide \
  --domain nombre.lakuspide.cloud \
  --preset menu
```

- Sin `--owner`, usa la cuenta autenticada.
- Sin `--public`, el repo es privado.
- `--no-github` crea solo la carpeta local.
- `--skip-build` acelera la prueba, pero el proyecto queda sin verificar.
- `--dry-run` muestra el plan sin escribir.

El generador verifica el build, crea `main`, hace el commit inicial y publica el
repo con homepage y topics.

## Verificación mínima

1. El repo existe y es privado (o público si se pidió).
2. `main` tiene el commit inicial y el remoto `origin`.
3. `npm run build`, `npm test` y `npm run lint` pasan en el proyecto generado.
4. No hay secretos: `.env`, `.dev.vars`, `.cloudflare-token`, `.github-token`.
5. Manifest e `index.html` llevan el nombre del proyecto.
6. El carrusel 3D sigue intacto.

## Guardarraíles

- No sobrescribir un repo existente: el generador aborta; usa otro `--repo-name`.
- No copiar `node_modules`, `dist`, `.angular`, `.wrangler` ni tokens.
- Código y copy de la plantilla en inglés; documentación en español.
- Precios como números; formato con `appPrice`.
- No tocar la geometría del carrusel ni el flujo de paneles sin pedirlo.
- Probar en 390×844 y 820×1180; el usuario trabaja en tablet, sin depender de Escape.

## Documentación

- `docs/GITHUB.md`: autenticación, flags, errores y seguridad.
- `README.md`: arranque y estructura.
- `ARQUITECTURA.md`, `INTEGRATION.md`, `ROADMAP.md`: diseño y siguientes pasos.
