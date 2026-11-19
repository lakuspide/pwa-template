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

## Presets

Presets disponibles: `boutique`, `menu`, `showcase`, `services`, `real-estate`,
`market`. Cada uno trae catálogo, textos y flags de funcionalidad.

- El generador escribe `ACTIVE_PRESET`, `BRAND_OVERRIDES` y `DEMO_MODE = false`
  en `src/site/site.config.ts`. No edites `src/app/shared/copy.ts` para marcar un
  proyecto: es solo un reexport de compatibilidad.
- En la plantilla (`DEMO_MODE = true`) el botón «Sector · demo» cambia de preset
  en caliente. No lo desactives en el proyecto generado.
- Catálogo y contenido por sector: `src/site/presets.ts`.
- Tipos y flags: `src/site/site.types.ts`.
- Guía completa en español: `docs/PRESETS.md`.

## Verificación mínima

1. El repo existe y es privado (o público si se pidió).
2. `main` tiene el commit inicial y el remoto `origin`.
3. `npm run build`, `npm test` y `npm run lint` pasan en el proyecto generado.
4. No hay secretos: `.env`, `.dev.vars`, `.cloudflare-token`, `.github-token`.
5. Manifest e `index.html` llevan el nombre del proyecto.
6. `DEMO_MODE = false`, `ACTIVE_PRESET` es el pedido y `BRAND_OVERRIDES` tiene la
   marca; el selector de sector no aparece.
7. El carrusel 3D sigue intacto.

## Guardarraíles

- No sobrescribir un repo existente: el generador aborta; usa otro `--repo-name`.
- No copiar `node_modules`, `dist`, `.angular`, `.wrangler` ni tokens.
- Código y copy de la plantilla en inglés; documentación en español.
- Precios como números o `null` para catálogos informativos; formato con `appPrice`.
- No tocar la geometría del carrusel ni el flujo de paneles sin pedirlo.
- Probar en 390×844 y 820×1180; el usuario trabaja en tablet, sin depender de Escape.

## Documentación

- `docs/GITHUB.md`: autenticación, flags, errores y seguridad.
- `docs/PRESETS.md`: motor de presets, flags y cómo añadir un sector.
- `README.md`: arranque, presets y estructura.
- `ARQUITECTURA.md`, `INTEGRATION.md`, `ROADMAP.md`: diseño y siguientes pasos.

## Sitio de captación multiidioma (receta Pauronexpress)

Cuando el encargo no es un catálogo sino captar presupuestos, el carrusel sobra.
Así se montó `pauronexpress` y así se repite:

1. **La URL manda.** Un `LOCALES`/`PAGE_IDS`/`PATHS` en un único módulo
   (`src/site/<marca>.ts`) genera las rutas del router, el conmutador de idioma,
   el sitemap y la lista de prerender. El idioma y la página se deducen de la
   URL (`localeFromUrl`, `pageFromUrl`), no de un signal que haya que sincronizar.
2. **Barra final.** Cloudflare Pages sirve cada página como carpeta
   (`/presupuesto/index.html`) y redirige `/presupuesto` → `/presupuesto/`. Si
   canonical, hreflang y enlaces internos usan la forma sin barra, cada visita
   arrastra un 308 y el canonical apunta a una URL que redirige. Genera siempre
   `/${slug}/` y normaliza al comparar.
3. **Head por ruta, también al prerenderizar.** Un `SeoService` que escribe
   `title`, `description`, `canonical`, los cuatro `hreflang` y OG, invocado
   desde `provideAppInitializer`. Sin él, las 18 páginas heredan el título de
   `index.html`. Test: recorrer `dist/app/browser/**/index.html` y comprobar
   canonical == URL del fichero y `<html lang>` correcto.
4. **Hidratación.** `provideClientHydration(withEventReplay())`: sin esto
   Angular tira el HTML prerenderizado y vuelve a renderizar (se ve en el
   Lighthouse móvil y en el CLS).
5. **Presupuesto de bundle.** La home importada directa y el resto con
   `loadComponent`; el wizard es el único que necesita `@angular/forms`. En
   Pauronexpress el inicial bajó de 519 kB a 387 kB.
6. **El lead es el producto.** El mensaje de WhatsApp se construye con funciones
   puras (`services/quote-message.ts`) fuera del componente: idioma de la web en
   la primera línea, etiquetas traducidas, isla solo si aplica, y test por
   idioma. La validación por paso vive en la misma función y se reutiliza antes
   de enviar.
7. **Copy sin afirmar lo que no está confirmado.** Todo el texto en un fichero
   por idioma y un test de paridad (mismas opciones, mismas islas, mismas
   secciones legales). Direcciones, tránsitos y fiscalidad se dejan fuera hasta
   que el dueño los confirme.

### Trampas que costaron tiempo

- **`ngsw.json` con `index: /index.csr.html`.** Ese fichero debe estar en
  `assets.files` de `ngsw-config.json`; si no, la navegación offline devuelve
  504 aunque el resto de la caché esté bien.
- **Contraste con rojo de marca.** Rojo puro sobre negro (#e8212b / #0b0b0d) da
  4.38:1 y falla AA en textos pequeños. Separa relleno (`--accent`, blanco
  encima) y tinta sobre oscuro (`--accent-ink`, aclarado); blancos al 30–45 % de
  opacidad tampoco pasan, mínimo ~60 %.
- **Logo con `aria-label`.** Si el enlace lleva `aria-label="Volver al inicio"`
  pero el texto visible es «PAURONEXPRESS», axe marca
  `label-content-name-mismatch`: el nombre accesible debe contener el texto
  visible.
- **`robots.txt` gestionado por Cloudflare.** Cloudflare inyecta su bloque
  «Content-Signal» delante del fichero; Google lo ignora, pero Lighthouse lo
  cuenta como directiva desconocida y baja SEO a 92. Se desactiva en el panel de
  la zona, no desde el repo.
- **Lighthouse local engaña.** Un `http-server` sin compresión da 60 donde el
  dominio real da 86; mide siempre contra el despliegue.
- **Playwright sin Chrome del sistema.** `--browser chromium` más
  `LD_LIBRARY_PATH` a las libs descargadas; el canal `chrome` falla si no hay
  `/opt/google/chrome/chrome`.

### Cerrar la plantilla

Si el proyecto no usa el catálogo, borra el demo entero: componentes del
carrusel, `site/auth/cart/catalog/order`, `presets`, `site.config`, iconos
Material y `public/images` de presets. Antes de borrar, comprueba alcance real
con un script que siga los `import` desde `main.ts` (los `loadComponent` no
aparecen como `from`, añádelos a mano). En Pauronexpress fueron 132 kB de JS y
1,6 MB de assets menos.
