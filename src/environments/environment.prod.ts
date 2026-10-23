/**
 * Production environment configuration.
 *
 * Set `useMockData: false` and point `apiBaseUrl` at your real API
 * before shipping. Wire this file into `angular.json`'s production
 * `fileReplacements` for the `build` configuration (standard Angular
 * CLI pattern) so `environment.ts` is swapped for this file at build time.
 */
export const environment = {
  production: true,
  useMockData: false,
  apiBaseUrl: 'https://api.example.com/api',
};
