# Arquitectura

## Vista general

Una sola pantalla (`CarouselCylinderComponent`) orquesta la experiencia; el resto
son componentes de presentación que emiten eventos. No hay router: el estado de
navegación son señales.

```text
App
└── CarouselCylinderComponent        ← shell: estado y coordinación
    ├── HeroSectionComponent         ← intro; swipe up / botón
    ├── TopHeaderComponent           ← menú, marca, tema
    ├── Carousel3dComponent          ← carrusel de categorías (identidad)
    ├── HistorySectionComponent      ← teaser + panel "about"
    ├── LocationsSectionComponent    ← tiendas + detalle
    ├── TermsSectionComponent        ← legales
    ├── ProductModalComponent        ← ficha + cantidad
    ├── CheckoutDrawerComponent      ← carrito, total, pedido, éxito
    ├── SidebarMenuComponent         ← navegación por rol
    └── LoginModalComponent          ← selección de rol (mock)
```

## Estado

Todo vive en señales; no hay `NgRx` ni `BehaviorSubject`.

| Señal | Dueño | Para qué |
| --- | --- | --- |
| `appMode` | shell | `intro` o `catalog` |
| `activeBox` | shell | panel abierto (`about`, `catalog`, `terms`, `location-1…4`, `null`) |
| `viewState` | shell | `categories` o `items` dentro del catálogo |
| `activeCategory` | shell | categoría cuyas fichas se están viendo |
| `showCheckout`, `showSidebar`, `showLoginModal`, `isProductModalOpen` | shell | overlays |
| `categories` | `CatalogService` | catálogo; mock o API |
| `items`, `totalPrice`, `totalItems`, `orderLines` | `CartService` | carrito derivado |
| `currentUser` | `AuthService` | rol y perfil |
| `theme` | `ThemeService` | claro/oscuro + `theme-color` |
| `updateReady` | `PwaUpdateService` | nueva versión esperando |

`PanelId` (`models/panel.ts`) es la única fuente de ids de panel: si añades una
sección, amplía ese union y la rama correspondiente en el shell.

## Flujos

**Entrar al catálogo.** `HeroSectionComponent` emite `enterCatalog` (botón o
swipe), el shell pone `appMode = 'catalog'` y la sección del héroe se desplaza.

**Categoría → ítems.** El carrusel emite `cardSelected`; el shell guarda la
categoría y cambia `viewState`, con una transición de 300 ms que espera al fade.

**Añadir al carrito.** El modal emite `addedToCart`; el shell limpia/cierra y
muestra el toast. `CartService` fusiona líneas por `id`.

**Checkout.** El drawer pide el pedido a `OrderService`. En mock simula 1,2 s y
devuelve `orderId`; con API hace `POST /orders`. Si falla, muestra el error y
mantiene el carrito; si va bien, el shell lo vacía y abre la barra lateral.

**Actualizaciones.** El service worker avisa (`VERSION_READY`), el shell enseña
el aviso y `applyUpdate()` activa la versión y recarga.

## Decisiones que conviene conocer

- **Prerender estático**, no SSR en runtime: `outputMode: "static"` +
  `prerender: true`. El despliegue es un montón de ficheros; `src/server.ts`
  (Express) se eliminó porque no hace falta en producción.
- **Sin `@angular/material`**: los `<mat-icon>` los resuelve `IconComponent`
  con la fuente autoalojada. Cambiar a otro set de iconos es sustituir ese
  componente.
- **Estilos globales para el movimiento**: las animaciones (`animate-fade-in`,
  `animate-slide-up`, `perspective-[1200px]`…) están en `styles.css` porque
  Angular las aislaría al componente y varios overlays las comparten.
- **Precios numéricos**: `CatalogItem.price: number` + pipe `appPrice`. Nada de
  parsear cadenas de precio.
