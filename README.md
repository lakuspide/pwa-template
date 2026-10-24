# App Skeleton — plantilla PWA para cualquier sector comercial

Base mobile-first en Angular 21 para montar tiendas, catálogos, cartas o
servicios sin empezar de cero. La identidad del wireframe es el **carrusel 3D**
del catálogo: se conserva intacto, y todo lo demás está pensado para reemplazar.

Incluye seis presets de sector (`boutique`, `menu`, `showcase`, `services`,
`real-estate`, `market`), un selector de demo para cambiarlos en caliente, el
flujo completo catálogo → ficha → carrito → checkout, autenticación de mentira
con roles, temas claro/oscuro, prerender estático y service worker.

La plantilla arranca en **modo demo**. Un proyecto generado fija un solo preset
y arranca con su propia marca.

Historial de versiones: [`CHANGELOG.md`](CHANGELOG.md).

## Stack

- Angular 21 (standalone, signals, zoneless, prerender estático)
- Tailwind CSS v4
- `motion` para las animaciones del carrusel
- Vitest para tests unitarios
- Service Worker de Angular (PWA instalable y offline)

Sin dependencias de UI externas: los iconos son la fuente Material Icons
**autoalojada** en `src/fonts/` (se empaqueta en `dist/app/browser/media/`), y
las imágenes del catálogo son SVG locales en `public/images/`.

## Arrancar

```bash
npm install
npm start          # http://localhost:4200
npm run dev        # igual, pero accesible desde la red local (móvil/tablet)
npm run build      # build de producción + prerender en dist/app/browser
npm test           # tests con Vitest
npm run lint
```

Para probar el build: `npm run preview` (sirve `dist/app/browser`).

## Presets y sectores

Cada preset define identidad, flags de funcionalidad, textos y catálogo. La app
los lee a través de `SiteService`; no hay copy de sector en los componentes.

```bash
npm start          # modo demo: entra al catálogo y usa el botón «Sector · demo»
```

| Preset | Precios | Carrito | Checkout | Para qué |
| --- | --- | --- | --- | --- |
| `boutique` | Sí | Sí | Sí | Tienda pequeña con local |
| `menu` | Sí | Sí | Sí | Restaurante o cafetería con pedidos |
| `showcase` | No | No | No | Portfolio o galería informativa |
| `services` | No | No | No | Estudio o consultora |
| `real-estate` | Sí | No | No | Inmobiliaria con visitas |
| `market` | Sí | Sí | Sí | Mercado con reparto |

La configuración del proyecto vive en `src/site/site.config.ts`:

```ts
export const DEMO_MODE = true;                    // false en proyectos generados
export const ACTIVE_PRESET: SectorPresetId = 'boutique';
export const BRAND_OVERRIDES: BrandOverrides = { appName: 'Mi proyecto' };
```

`appName` se aplica en toda la app, incluido el copy editorial del preset
(`about`, `locations`, términos): un proyecto generado no menciona la marca de
la demo. El email y el teléfono de ejemplo no se sustituyen; cámbialos en
`src/site/presets.ts` → `content.contact`.

Detalle completo: [`docs/PRESETS.md`](docs/PRESETS.md).

## Crear un proyecto nuevo

Cada proyecto es independiente: su carpeta, su repo de GitHub y su despliegue.
El generador comprueba el entorno, copia la plantilla, aplica la marca y publica
el repositorio automáticamente.

```bash
npm run repo:doctor        # comprueba gh, scopes, Git y la plantilla

npm run new -- \
  --name "Café Central" \
  --slug cafe-central \
  --domain cafe.lakuspide.cloud \
  --preset menu
```

Sin `--owner` se usa la cuenta autenticada en `gh`. El repo se crea privado por
defecto; añade `--public` si debe ser público. Para un proyecto solo local:
`--no-github`.

Detalles, flags y errores frecuentes: [`docs/GITHUB.md`](docs/GITHUB.md).

## Qué tocar para convertirlo en tu app

| Quiero cambiar | Dónde |
| --- | --- |
| Nombre, tagline, moneda, idioma, acentos | `src/site/site.config.ts` → `BRAND_OVERRIDES` |
| Sector activo y modo demo | `src/site/site.config.ts` |
| Catálogo de ejemplo (categorías, ítems, precios) | `src/site/presets.ts` |
| Backend real (catálogo y pedidos) | `src/environments/environment*.ts` + `INTEGRATION.md` |
| Marca, iconos e instalación | `public/manifest.webmanifest`, `public/icons/` (iconos de ejemplo), `src/index.html` |
| Secciones de la home (ofertas, tiendas, legales) | `src/site/presets.ts` → `content` |
| Colores, tipografía, radios, blur | `src/styles.css` (custom properties en `:root`) |
| Nombre y descripción del paquete | `package.json` |

Los precios son **números o `null`** (`CatalogItem.price`) y se formatean con el
pipe `appPrice`, que usa el `locale` y la `currency` del preset activo.

## Estructura

```text
src/
├── index.html                  # metadatos, manifest, theme-color
├── styles.css                  # tokens de diseño, Tailwind y utilidades globales
├── site/                       # presets, tipos y configuración del proyecto
└── app/
    ├── app.ts                  # shell raíz
    ├── carousel-cylinder.component.ts  # pantalla principal (intro + catálogo)
    ├── models/                 # CatalogItem/Category, ids de paneles
    ├── services/               # site, catalog, cart, order, auth, theme, pwa-update
    ├── shared/                 # copy.ts (reexport), icon, price, logger, particle-effect
    └── components/             # hero, header, sidebar, modales, secciones, carrusel 3D
```

`ARQUITECTURA.md` explica el flujo de estado; `INTEGRATION.md` el contrato con
el backend, `docs/PRESETS.md` el motor de sectores y `ROADMAP.md` lo que queda
pendiente en la plantilla.

## PWA

- `ngsw-config.json`: precache de la app, caché diferida de fuentes/iconos/imágenes
  y `dataGroups` con estrategia `freshness` para `/api/**`.
- `PwaUpdateService` comprueba versiones cada 6 h y muestra un aviso discreto
  para recargar (sin `confirm()` bloqueante).
- Manifest con iconos `any` y `maskable` separados, `scope`, `id` y `lang`.
- `ThemeService` sincroniza `<meta name="theme-color">` con el tema elegido y lo
  recuerda en `localStorage`.

## Tipos y tests

`npm test` (51 tests en 10 archivos) cubre carrito (totales, cantidades, líneas
de pedido), catálogo, pedidos (incluida la latencia simulada), auth, presets y
cambio de sector, el modal de producto, el checkout (éxito y error) y un smoke
test del shell con el carrusel.

## Despliegue

El build es estático: sube `dist/app/browser` a cualquier hosting (Nginx,
Netlify, Vercel, Cloudflare Pages, S3…). No necesita Node en producción.
Recuerda servir `index.html` para rutas desconocidas y no cachear
`ngsw-worker.js` de forma agresiva.
