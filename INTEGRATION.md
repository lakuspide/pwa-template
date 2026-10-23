# Backend Integration Guide

This template ships fully functional with in-memory mock data — no backend
required to develop, demo, or style the UI. This doc covers what to do when
you're ready to connect it to a real one.

## 1. The switch: `environment.useMockData`

`src/environments/environment.ts` (dev) and `environment.prod.ts` (prod build)
both export a `useMockData` flag. `MenuService` and `ReservationService`
already branch on it:

- `true` (default) — everything runs off in-memory data, nothing leaves the browser.
- `false` — `MenuService.fetchCategories()` issues `GET {apiBaseUrl}/categories`
  and `ReservationService.createReservation()` issues `POST {apiBaseUrl}/reservations`
  via Angular's `HttpClient` (already provided in `app.config.ts` via `provideHttpClient(withFetch())`).

No component code needs to change either way — they only ever read from
signals (`menuService.categories()`, `cartService.items()`, etc.), never from
the service's internal fetch logic directly.

## 2. Expected API shape

`GET /categories` should return `Category[]`:

```json
[
  {
    "id": "1",
    "name": "Starters",
    "subtitle": "Small plates to share",
    "icon": "category",
    "image": "https://.../category-1.jpg",
    "items": [
      {
        "id": "C1-1",
        "name": "Item name",
        "price": "12.00",
        "description": "Item description",
        "image": "https://.../item-1.jpg"
      }
    ]
  }
]
```

`POST /reservations` should accept a `Reservation` body and return any 2xx
status on success:

```json
{ "name": "Jane Doe", "email": "jane@example.com", "location": "Main Branch", "guests": "2" }
```

Both interfaces are defined in `menu.service.ts` (`Category`) and
`reservation.service.ts` (`Reservation`) — change the shape there first if
your API differs, TypeScript will then flag every call site that needs updating.

## 3. Authentication

`AuthService` (`src/app/auth.service.ts`) is intentionally a mock: `login()`
accepts any email/role pair with no validation. Replace its body with a call
to your identity provider — a few common options:

- **Supabase Auth / Firebase Auth** — call their SDK's sign-in method, then
  set `currentUser` from the returned session.
- **Custom JWT API** — `POST /auth/login`, store the token server-side via
  an `HttpOnly` cookie (not `localStorage` — this template deliberately
  avoids browser storage APIs so it works safely in all environments), then
  hydrate `currentUser` from a `GET /auth/me` call on app start.

Whichever you choose, keep `currentUser` as the single source of truth the
rest of the app already reads from — no other file needs to change.

## 4. Error & loading states

`MenuService` already exposes `isLoading` and `error` signals for the
catalog fetch — bind them in `carousel-cylinder.component.ts` to show a
skeleton/spinner and a retry action instead of an empty screen while
`useMockData` is `false` and the request is in flight or has failed.

## 5. Realistic data volumes

The mock catalog is small (4 categories × 4 items) on purpose, for a fast
wireframe demo. Once real data is wired in, if any list grows into the
hundreds of items, consider adding virtual scrolling (e.g. Angular CDK's
`ScrollingModule`) to the catalog view — not needed at the current scale,
but worth flagging before it becomes a performance problem.
