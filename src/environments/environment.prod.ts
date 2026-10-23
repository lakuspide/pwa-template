/**
 * Production environment configuration.
 *
 * `useMockData: true` keeps the built app self-contained: the catalog and the
 * checkout resolve locally, so `npm run build` produces something you can
 * deploy and demo immediately. Set it to `false` and point `apiBaseUrl` at your
 * API (see INTEGRATION.md) to go live.
 */
export const environment = {
  production: true,
  useMockData: true,
  apiBaseUrl: 'https://api.example.com/api',
};
