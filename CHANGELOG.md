# Changelog

Cambios relevantes de la plantilla. El formato sigue
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y las versiones,
[SemVer](https://semver.org/lang/es/).

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
