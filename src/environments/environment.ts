/**
 * Development environment configuration.
 *
 * `useMockData: true` keeps the app fully working with in-memory
 * placeholder data — no backend required. Flip it to `false` once
 * `apiBaseUrl` points at a real API and the services will switch to
 * making real HTTP calls (see MenuService / ReservationService).
 */
export const environment = {
  production: false,
  useMockData: true,
  apiBaseUrl: 'http://localhost:3000/api',
};
