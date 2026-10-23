# App Skeleton — plantilla PWA para cualquier sector comercial

Base mobile-first en Angular 21 para montar tiendas, catálogos, cartas o
servicios sin empezar de cero. La identidad del wireframe es el **carrusel 3D**
del catálogo: se conserva intacto, y todo lo demás está pensado para reemplazar.

Incluye el flujo completo catálogo → ficha → carrito → checkout, autenticación
de mentira con roles, temas claro/oscuro, prerender estático y service worker.

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

## Qué tocar para convertirlo en tu app

| Quiero cambiar | Dónde |
| --- | --- |
| Nombre, tagline, moneda, colores de tema | `src/app/shared/copy.ts` |
| Datos del catálogo (categorías, ítems, precios) | `src/app/services/catalog.service.ts` |
| Backend real (catálogo y pedidos) | `src/environments/environment*.ts` + `INTEGRATION.md` |
| Marca, iconos e instalación | `public/manifest.webmanifest`, `public/icons/` (iconos de ejemplo), `src/index.html` |
| Secciones de la home (ofertas, tiendas, legales) | `src/app/components/*` |
| Colores, tipografía, radios, blur | `src/styles.css` (custom properties en `:root`) |
| Nombre y descripción del paquete | `package.json` |

Los precios son **números** (`CatalogItem.price`) y se formatean con el pipe
`appPrice`, que usa `locale` y `currency` de `copy.ts`.

## Estructura

```text
src/
├── index.html                  # metadatos, manifest, theme-color
├── styles.css                  # tokens de diseño, Tailwind y utilidades globales
└── app/
    ├── app.ts                  # shell raíz
    ├── carousel-cylinder.component.ts  # pantalla principal (intro + catálogo)
    ├── models/                 # CatalogItem/Category, ids de paneles
    ├── services/               # catalog, cart, order, auth, theme, pwa-update
    ├── shared/                 # copy.ts, icon, price, logger, particle-effect
    └── components/             # hero, header, sidebar, modales, secciones, carrusel 3D
```

`ARQUITECTURA.md` explica el flujo de estado; `INTEGRATION.md` el contrato con
el backend y `ROADMAP.md` lo que queda pendiente en la plantilla.

## PWA

- `ngsw-config.json`: precache de la app, caché diferida de fuentes/iconos/imágenes
  y `dataGroups` con estrategia `freshness` para `/api/**`.
- `PwaUpdateService` comprueba versiones cada 6 h y muestra un aviso discreto
  para recargar (sin `confirm()` bloqueante).
- Manifest con iconos `any` y `maskable` separados, `scope`, `id` y `lang`.
- `ThemeService` sincroniza `<meta name="theme-color">` con el tema elegido y lo
  recuerda en `localStorage`.

## Tipos y tests

`npm test` (41 tests en 8 archivos) cubre carrito (totales, cantidades, líneas
de pedido), catálogo, pedidos (incluida la latencia simulada), auth, el modal de
producto, el checkout (éxito y error) y un smoke test del shell con el carrusel.

## Despliegue

El build es estático: sube `dist/app/browser` a cualquier hosting (Nginx,
Netlify, Vercel, Cloudflare Pages, S3…). No necesita Node en producción.
Recuerda servir `index.html` para rutas desconocidas y no cachear
`ngsw-worker.js` de forma agresiva.
