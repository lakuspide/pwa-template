/**
 * Development environment configuration.
 *
 * `useMockData: true` keeps the app fully working with bundled placeholder
 * data — no backend required. Flip it to `false` once `apiBaseUrl` points at a
 * real API and `CatalogService` / `OrderService` switch to live HTTP calls.
 */
export const environment = {
  production: false,
  useMockData: true,
  apiBaseUrl: 'http://localhost:3000/api',
};
