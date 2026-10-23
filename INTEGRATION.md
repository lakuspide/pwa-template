# Integración con un backend

La plantilla funciona sin servidor (`environment.useMockData = true`). Para
conectarla a una API real hay dos pasos: apuntar `apiBaseUrl` y poner el flag a
`false`. Los componentes no cambian: leen siempre de los mismos servicios.

```ts
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  useMockData: false,
  apiBaseUrl: 'https://api.tudominio.com',
};
```

Recuerda que `angular.json` ya reemplaza `environment.ts` por
`environment.prod.ts` en la configuración de producción.

## Contrato de la API

### `GET {apiBaseUrl}/categories`

Devuelve el catálogo agrupado. El orden del array es el orden del carrusel.

```json
[
  {
    "id": "category-1",
    "name": "Category One",
    "subtitle": "Short category subtitle",
    "icon": "category",
    "image": "https://cdn.tudominio.com/category-1.jpg",
    "items": [
      {
        "id": "C1-1",
        "name": "Item 1.1",
        "price": 12.5,
        "description": "What the item is and why it matters.",
        "image": "https://cdn.tudominio.com/item-1-1.jpg"
      }
    ]
  }
]
```

Reglas:

- `price` es un **número** en la moneda configurada en `shared/copy.ts`.
- `icon` es un nombre de ligadura de Material Icons (`category`, `widgets`…).
- `id` debe ser estable: el carrito y las líneas de pedido se apoyan en él.
- `image` admite ruta relativa (`images/catalog-1.svg`) o URL absoluta.

`CatalogService` expone `isLoading` y `error`; conecta un skeleton o un aviso de
reintento a esas señales si tu API puede tardar.

### `POST {apiBaseUrl}/orders`

Lo llama `CheckoutDrawerComponent` a través de `OrderService.submitOrder()`.

```json
{
  "customer": { "name": "jane", "email": "jane@example.com" },
  "lines": [
    { "itemId": "C1-1", "name": "Item 1.1", "unitPrice": 12.5, "quantity": 2 }
  ],
  "total": 25
}
```

Respuesta esperada: `{ "orderId": "AB12CD" }` (opcional; si no llega, el cliente
genera una referencia). Cualquier error HTTP se traduce en
`{ ok: false, error }` y el checkout muestra el mensaje sin perder el carrito.

`dataGroups` en `ngsw-config.json` cachea `GET /api/**` con estrategia
`freshness` (red primero, 3 s de margen, 1 h de vida). Las peticiones `POST` no
se cachean nunca.

## Autenticación

`AuthService` es un mock: acepta cualquier email y rol. Para producción,
sustituye `login()` por tu proveedor (Supabase, Auth0, Firebase, JWT propio) y
guarda el token en una cookie `HttpOnly` emitida por el servidor — no en
`localStorage`. Los roles (`guest`, `user`, `operator`, `manager`, `admin`) solo
controlan qué enlaces enseña la barra lateral; la autorización real debe vivir
en el backend.

## Errores y estados

- Catálogo: `CatalogService.error` + `isLoading`.
- Pedido: `OrderService` devuelve `{ ok, error }`; el drawer muestra el mensaje
  y reactiva el botón.
- Sin red: la app sigue funcionando con el catálogo cacheado y las imágenes del
  precache; los pedidos fallan con un mensaje claro (no hay cola offline:
  ver `ROADMAP.md`).
