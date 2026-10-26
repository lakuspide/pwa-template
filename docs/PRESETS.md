# Presets y sectores

Un **preset** es una demo de sector completa y autocontenida: identidad, flags
de funcionalidad, textos editoriales y un catálogo de ejemplo. La app lee todo
desde el preset activo; ningún componente tiene copy de sector incrustado.

La plantilla trae seis presets, con todo el copy visible en castellano (es-ES)
y precios en euros:

| Preset | Para qué | Precios | Carrito | Checkout |
| --- | --- | --- | --- | --- |
| `boutique` | Tienda pequeña con local | Sí | Sí | Sí |
| `menu` | Restaurante o cafetería con pedidos | Sí | Sí | Sí |
| `showcase` | Portfolio o galería informativa | No | No | No |
| `services` | Estudio o consultora | No | No | No |
| `real-estate` | Inmobiliaria con visitas | Sí | No | No |
| `market` | Mercado o ultramarinos con reparto | Sí | Sí | Sí |

## Archivos

```text
src/site/
├── site.types.ts    tipos, flags y lista de ids
├── presets.ts       los seis presets y el catálogo de ejemplo
└── site.config.ts   configuración del proyecto (lo edita el generador)
```

`src/app/services/site.service.ts` expone el preset activo como señales:

```ts
site.identity()   // nombre, tagline, idioma, moneda, colores
site.features()   // qué está habilitado
site.content()    // about, promo, locations, contacto, legales
site.catalog()    // categorías e ítems del carrusel
site.heroImage()  // emblema del sector para la portada
site.preset()     // id activo
site.demoMode     // true solo en la plantilla
```

## Configuración del proyecto

Todo lo específico del proyecto vive en `src/site/site.config.ts`:

```ts
export const DEMO_MODE = true;
export const ACTIVE_PRESET: SectorPresetId = 'boutique';
export const BRAND_OVERRIDES: BrandOverrides = {
  // lo rellena `npm run new`
};
```

- **`DEMO_MODE = true`** muestra el selector de sector flotante y permite
  cambiar de preset en caliente. Es el modo de la plantilla.
- **`DEMO_MODE = false`** oculta el selector y fija el proyecto a
  `ACTIVE_PRESET`. El generador lo pone así.
- **`BRAND_OVERRIDES`** gana sobre la identidad de la demo: nombre, nombre corto,
  tagline, descripción, idioma, locale, moneda, versión y `storagePrefix`. Es lo
  que permite que un proyecto generado se llame «Café Central» sin editar el
  preset `menu`.

`BRAND_OVERRIDES.appName` no se queda en la cabecera: `resolveSiteConfig` lo
sustituye también dentro del copy editorial del preset (`about`, `locations` y
la introducción de los términos). Así un proyecto generado nunca menciona a la
marca de la demo. Los datos de contacto (`email` y `phone`) **no** se sustituyen:
siguen siendo los de ejemplo del preset, y hay que cambiarlos a mano en
`src/site/presets.ts` → `content.contact` antes de publicar.

La identidad resuelta se reexporta como `APP_COPY` en
`src/app/shared/copy.ts` por compatibilidad, pero el código nuevo debe inyectar
`SiteService` para reaccionar a los cambios.

## Cambiar de sector en la demo

```bash
npm start
```

1. Entra al catálogo (swipe o botón).
2. Pulsa el botón **Sector · demo** de la esquina inferior izquierda.
3. Elige otro sector.

El cambio es inmediato: catálogo, precios, moneda, acentos y secciones
habilitadas. El shell limpia el carrito y cierra paneles para no mezclar estados
de dos sectores.

## Flags de funcionalidad

| Flag | Controla |
| --- | --- |
| `prices` | Precio en carrusel, fichas y modal |
| `cart` | Controles de cantidad y botón flotante del carrito |
| `checkout` | Drawer de pedido y envío a `OrderService` |
| `auth` | Login mock, perfil y navegación por rol |
| `locations` | Directorio de tiendas u oficinas |
| `about` | Panel «Sobre nosotros» y su tarjeta en la home |
| `promo` | Oferta destacada dentro del panel «Sobre nosotros» |
| `terms` | Panel legal en fichas apiladas y enlace en la barra lateral |
| `reviews` | Reseñas en la confirmación del pedido |

Reglas prácticas:

- `checkout` requiere `cart`.
- `promo` requiere `about`.
- Si `cart` está apagado, la ficha muestra acciones de contacto (`mailto:` y
  `tel:`) en lugar de cantidad y «Añadir al carrito».
- Si `prices` está apagado o el ítem tiene `price: null`, no se muestra precio.

## Catálogo

Cada preset declara su catálogo con el helper `catalog()` de `presets.ts`:

```ts
catalog: catalog('menu', [
  {
    name: 'Desayunos',
    subtitle: 'Hasta las 11:30',
    icon: 'breakfast_dining',
    description: 'Horneado esa misma mañana y servido con café o té.',
    image: 'images/menu/breakfast.svg',
    items: [
      { name: 'Tostada de masa madre', price: 6.5 },
      { name: 'Bol de temporada', price: 9.5 },
    ],
  },
])
```

- `icon` es una ligadura de Material Icons.
- `price` es un número o `null` para catálogos informativos.
- `image` es el arte de la categoría, relativo a `public/`; los ítems heredan
  esa misma imagen salvo que se les pase una propia.
- El orden de las categorías es el orden del carrusel.

### Arte por sector

Cada preset trae su propio juego de ilustraciones SVG en `public/images/`:

```text
public/images/
├── sectors/<sector>.svg        # emblema de la portada (heroImage)
└── <sector>/
    ├── <categoría>.svg         # una por categoría del catálogo
    └── …
```

Los SVG son 800×800, con fondo oscuro, retícula sutil y línea marfil; el color
de acento coincide con el del preset. Las tarjetas del carrusel, las miniaturas
de los ítems y la cabecera de la ficha los muestran siempre sobre
`--art-surface`, también en tema claro, para que la línea clara no se pierda.

Para un proyecto nuevo, cambia los SVG por los de su marca manteniendo las
rutas, o apunta `heroImage` e `image` a otras rutas locales o URLs. Los antiguos
`catalog-1…4.svg` se conservan como ejemplo de imagen única para catálogos
pequeños.

### Páginas de 16 ítems

El catálogo de una categoría se parte en páginas de **16 ítems** como máximo.
Las páginas se cambian con un gesto horizontal (o las flechas y los puntos), y
dentro de cada página solo hay scroll vertical. No hay scroll infinito: el
usuario siempre sabe cuántas páginas quedan (`1/2`) y el contenido es local, así
que la paginación funciona sin conexión.

`paginate()` y `wrapPage()` viven en `src/app/shared/paginate.ts`; el tamaño de
página es la constante `ITEMS_PER_PAGE` de `carousel-cylinder.component.ts`.
La última página muestra los ítems que queden y el pager enlaza la última con la
primera, igual que el carrusel de categorías.

### Carrusel adaptativo

La geometría del carrusel vive en `src/app/shared/carousel-layout.ts`. Con 3–4
categorías se mantiene el diseño original; a partir de 5, las vecinas lejanas
asoman con más separación y menos opacidad, de modo que se intuye que la rueda
sigue. Debajo del carrusel aparecen un punto por categoría y un contador
(`3/9`); con una sola categoría se desactiva el arrastre y no se muestra el
pager.

### Panel legal

`content.terms` (título, introducción, cláusulas y fecha) se muestra en el panel
«Términos y condiciones». Cada cláusula es una ficha numerada que se fija al
hacer scroll y sobre la que se apila la siguiente, así que la baraja se cierra
con la última ficha y la fecha de actualización. La altura de cada ficha se
adapta al viewport; si añades muchas cláusulas, las fichas se acortan para que
la baraja siga cabiendo.

## Añadir un preset

1. Añade el id a `PRESET_IDS` en `src/site/site.types.ts`.
2. Crea el objeto `SitePreset` en `src/site/presets.ts` con `id`, `label`,
   `description`, `icon`, `heroImage`, `features`, `identity`, `content` y
   `catalog`.
3. Regístralo en `SECTOR_PRESETS`.
4. Añade el arte del sector en `public/images/sectors/` y
   `public/images/<sector>/`, y enlázalo desde `heroImage` e `image`.
5. Añade el caso a la tabla de este documento y a los ejemplos del README.
6. Ejecuta `npm run build`, `npm test`, `npm run lint` y `npm run repo:doctor`.

El generador lee los ids directamente de `presets.ts`, así que
`--preset <nuevo-id>` funciona sin tocar `scripts/new-site.mjs`.

## Proyecto generado

```bash
npm run new -- --name "Café Central" --slug cafe-central --preset menu
```

El generador:

1. Copia la plantilla.
2. Escribe `DEMO_MODE = false` y `ACTIVE_PRESET = 'menu'`.
3. Rellena `BRAND_OVERRIDES` con el nombre, slug, descripción e idioma.
4. Actualiza `index.html`, el manifest y `package.json`.
5. Compila, crea el commit inicial y publica el repo.

El resultado no muestra el selector de sector y arranca directamente en el
catálogo del preset elegido con la marca del proyecto.
