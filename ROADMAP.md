# Roadmap de la plantilla

Lo que esta base **no** trae todavía, en orden de utilidad para un proyecto real.

## 1. Internacionalización

Los textos están en inglés y centralizados solo parcialmente (`src/site/presets.ts`
para marca, contenido y catálogo; el resto vive en las plantillas). Falta:

- extraer cadenas a un diccionario (`@angular/localize` o Transloco),
- selector de idioma funcional (el anterior era decorativo y se eliminó),
- formateo de fechas y moneda por locale.

## 2. Persistencia del carrito

`CartService` vive en memoria: recargar la página vacía el carrito. Guardarlo en
`IndexedDB`/`localStorage` con versión de esquema es el siguiente paso natural.

## 3. Cola de pedidos offline

Hoy, sin red, el checkout falla con un mensaje claro. Falta encolar el pedido
(IndexedDB + `Background Sync`) y reintentarlo al recuperar conexión.

## 4. Instalación guiada

No se intercepta `beforeinstallprompt`. Un botón discreto "Instalar app" en la
barra lateral, con estado (`instalada`, `disponible`, `iOS → instrucciones`),
mejoraría la conversión de instalación.

## 5. Splash screens de iOS

El manifest cubre Android; iOS necesita `apple-touch-startup-image` por
resolución. Se puede generar con `pwa-asset-generator`.

## 6. Accesibilidad fina

Hay `role`, `tabindex` y `aria-label` en los puntos principales, el toast ya es
`aria-live`, y las secciones ocultas quedan `inert`. Falta:

- trampa de foco y devolución del foco al abridor en modales/drawers,
- revisión con lector de pantalla del carrusel (hoy navegable con teclado).

## 7. Presupuesto de rendimiento

Los budgets de `angular.json` son los de partida (500 kB warning / 1 MB error).
Tras el primer build real, ajústalos al tamaño medido y añade Lighthouse en CI.

## 8. Tests

Cubiertos: carrito, catálogo, pedidos, auth, presets y cambio de sector, modal de
producto, checkout (éxito y error) y smoke test del shell con el carrusel.
Falta: `ThemeService` (persistencia y preferencia del sistema).

## 9. Analítica y errores

`shared/logger.ts` es el punto único para enchufar Sentry/LogRocket y eventos de
producto (añadir al carrito, pedido enviado).
