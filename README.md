# App Skeleton — Generic Frontend Wireframe Template

A mobile-first PWA wireframe built with Angular (standalone components + Signals,
zoneless). It ships with a working catalog → item → cart → checkout flow, a
role-based auth mock, a light/dark theme system, and a real Apple-inspired
design system — all using placeholder content so it can be re-skinned into
a new project quickly.

## Stack

- Angular 21 (standalone components, zoneless change detection, SSR-ready)
- Angular Signals for state management
- Angular `HttpClient` (behind an `environment.useMockData` flag — see `INTEGRATION.md`)
- Vitest for unit tests
- Tailwind CSS v4
- `motion` for animations
- Angular Service Worker (installable PWA)

## Run locally

**Prerequisites:** Node.js

```bash
npm install
npm start        # dev server on http://localhost:4200
npm run build     # production build
npm test          # unit tests (Vitest)
```

## Project structure

```text
src/
├── environments/                    # environment.ts (dev) / environment.prod.ts — mock vs real API
└── app/
    ├── carousel-cylinder.component.ts   # Root screen: hero, catalog, floating actions
    ├── auth.service.ts                  # Mock role-based auth (guest/user/manager/operator/admin)
    ├── components/                      # Hero, header, sidebar, modals, sections (+ *.spec.ts tests)
    ├── services/                        # Cart, menu (catalog), reservations, PWA updates (+ *.spec.ts tests)
    └── shared/particle-effect.ts        # Shared "confirm action" click feedback (used by 2+ components)
```

## Making this your own

1. **Content** — replace the `{placeholder}` strings in `services/menu.service.ts`
   (categories/items) with real content.
2. **Branding** — edit `src/styles.css`:
   - `--color-accent` controls the single accent color used across CTAs and highlights.
   - `:root` / `.light-theme` control the dark/light surface and text colors.
   - `--font-display` controls the typeface (defaults to the OS system font stack).
   - `--radius-*` / `--blur-*` control the corner rounding and glass-blur intensity app-wide.
3. **Currency** — set `currencySymbol` in `services/cart.service.ts`.
4. **Backend** — see `INTEGRATION.md` for the full guide (API shape, auth, error states).
   Short version: flip `environment.useMockData` to `false` and point `apiBaseUrl`
   at your API; `MenuService`/`ReservationService` switch to real `HttpClient` calls automatically.
5. **PWA** — update `public/manifest.webmanifest` and the icons in `public/icons/`
   with your app's name and artwork before shipping.

## Testing

Unit tests live next to the code they cover (`*.spec.ts`) and run on Vitest
via `npm test`. Coverage focuses on the services (cart math, catalog loading,
mock auth, reservation submission) and the product modal's cart-adding flow.

See `ARQUITECTURA.md` for a deeper look at the window/state architecture,
and `PLAN_MAESTRO.md` for the longer-term product roadmap (note: it describes
a future desktop-OS-style concept that is **not** implemented in this codebase yet).

