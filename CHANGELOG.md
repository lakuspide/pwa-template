# Changelog

Cambios relevantes de la plantilla. El formato sigue
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y las versiones,
[SemVer](https://semver.org/lang/es/).

## [1.4.0] — 2026-10-26

### Añadido

- Todo el copy visible de la app y de los seis presets está en castellano
  (es-ES): navegación, carrito, checkout, paneles, avisos y catálogos. Los
  precios usan el formato español (`24,00 €`) y la tipografía editorial emplea
  comillas «».
- 28 ilustraciones SVG propias por sector en `public/images/`: un emblema para
  la portada (`heroImage`) y una imagen por categoría. Las fichas de ítem
  heredan el arte de su categoría.
- Tokens `--art-surface`, `--art-border`, `--art-text`, `--art-text-muted` y
  `--art-text-dim` para mostrar el arte oscuro con línea marfil en ambos temas.

### Cambiado

- La identidad base pasa a «Plantilla Base» / «Plantilla», con `lang: 'es'`,
  `locale: 'es-ES'` y prefijo de almacenamiento `plantilla-base`.
- Las tarjetas del carrusel, las miniaturas y la cabecera de la ficha usan la
  paleta de arte en vez de `grayscale opacity-30`, que borraba el dibujo.
- El selector de sector se oculta mientras hay un panel u overlay abierto para
  no tapar su contenido.

### Corregido

- Los overlays de checkout, barra lateral y login usan `position: fixed` y
  quedan dentro del viewport y por encima de la cabecera; los enlaces del pie de
  la barra lateral vuelven a ser alcanzables en móvil y escritorio.
- El modal de login se limita a `100dvh` y hace scroll cuando no cabe.
- Las filas del carrito y los controles de cantidad usan la paleta de arte: el
  texto ya no queda negro sobre fondo oscuro en tema claro.

## [1.3.0] — 2026-10-26

### Añadido

- Almacén permanente de credenciales de Cloudflare en
  `~/.config/lakuspide/cloudflare.env` (permisos 600, fuera del repositorio).
  `npm run deploy`, `repo:doctor` y el generador lo leen sin volver a pedir el
  token.
- Despliegue automático de la demo en cada push a `main` mediante GitHub
  Actions.
- El generador crea el proyecto de Cloudflare Pages de cada proyecto, despliega
  la primera versión, engancha `<slug>.lakuspide.cloud`, crea el CNAME, guarda
  los secretos en el repo nuevo y escribe su workflow de despliegue.
- `--deploy` / `--no-deploy` y `--pages-project` en el generador.

### Cambiado

- `wrangler` pasa a ser dependencia de desarrollo, para que el despliegue local
  funcione también en proyectos generados.

## [1.2.0] — 2026-10-25

### Añadido

- El catálogo se pagina de **16 en 16** ítems, sin scroll infinito. La página
  se cambia con un gesto horizontal, las flechas o los puntos, y dentro de la
  página solo hay un scroll vertical corto. Las páginas enlazan en bucle.
- El carrusel de categorías ajusta su geometría al número de categorías: el
  diseño de 3–4 se mantiene, y con 5 o más las vecinas lejanas asoman con menor
  opacidad.
- Puntos de posición y contador (`3/9`) bajo el carrusel; con una sola categoría
  el arrastre se desactiva.
- Cada tarjeta de categoría muestra cuántos ítems contiene.
- La demo de `market` amplía *Fruit & veg* a 18 ítems para poder ver la
  paginación.

### Cambiado

- La rejilla de ítems pasa a 2 columnas en móvil, 3 en tablet pequeña y 4 en
  tablet grande, para que 16 ítems pidan solo un scroll leve.
- La geometría del carrusel y la paginación salen a funciones puras
  (`carousel-layout.ts`, `paginate.ts`) con tests.

## [1.1.1] — 2026-10-24

### Corregido

- Los proyectos generados ya no nacen con tests en rojo: `SiteService` y
  `CatalogService` derivan sus expectativas de `SITE_CONFIG` y solo prueban el
  cambio de preset cuando `DEMO_MODE` está activo.

## [1.1.0] — 2026-10-24

### Añadido

- Motor de presets en `src/site/`: tipos, seis sectores (`boutique`, `menu`,
  `showcase`, `services`, `real-estate`, `market`) y configuración de proyecto.
- `SiteService` expone identidad, flags, contenido y catálogo como señales.
- Selector de sector solo en modo demo, con reinicio de carrito y paneles.
- Precios opcionales (`null`) y CTA de contacto para catálogos informativos.
- Flags de funcionalidad: precios, carrito, checkout, auth, locales, about,
  promo, términos y reseñas.
- Generador `npm run new` con `--preset`, que fija el preset, desactiva el modo
  demo y escribe `BRAND_OVERRIDES`; crea el repo privado en GitHub con homepage
  y topics.
- `npm run repo:doctor` valida entorno, sesión, scopes y presets.
- Documentación: `docs/PRESETS.md`, `docs/GITHUB.md`, arquitectura, integración
  y roadmap.
- `appName` se propaga al copy editorial del preset (about, locales, términos)
  en proyectos generados.

### Corregido

- Las tarjetas laterales del carrusel 3D vuelven a ser pulsables y el título de
  la tarjeta frontal usa el color de máximo contraste en ambos temas.
- El generador encuentra `gh` aunque no esté en `PATH`.

### Cambiado

- El dominio se lee del preset activo, no de constantes globales.
- `APP_COPY` se mantiene como alias de compatibilidad sobre `SiteService`.

## [1.0.x] — 2026-10

Base inicial: carrusel 3D, catálogo, carrito y checkout, auth mock, temas
claro/oscuro, prerender estático, service worker y despliegue en Cloudflare
Pages (`app.lakuspide.cloud`).
