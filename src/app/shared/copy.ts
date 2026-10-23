/**
 * Single place to re-brand the template.
 *
 * Everything user-facing that is *not* catalog content is here: the app name,
 * the tagline, the currency used by the price pipe and the theme colours.
 * Change this file (plus `public/manifest.webmanifest` and the icons in
 * `public/icons/`) and the app reads as a different product.
 */
export const APP_COPY = {
  /** Display name. Split on spaces to render the multi-line hero title. */
  appName: 'App Skeleton',
  /** Short name for the home screen / install prompt. */
  shortName: 'Skeleton',
  /** One-line description used in the hero eyebrow and the manifest. */
  tagline: 'Generic commerce template',
  /** Longer description for metadata / social previews. */
  description:
    'A mobile-first PWA template for any commercial sector: catalog, cart, checkout, roles and offline support.',
  /** Language + locale used for date/number formatting. */
  lang: 'en',
  locale: 'en-US',
  /** ISO 4217 currency code used by the `appPrice` pipe. */
  currency: 'EUR',
  /** Version shown in the sidebar footer. */
  version: '1.0.0',
  /** Theme colours, also mirrored in `index.html` and the web manifest. */
  themeColorDark: '#050505',
  themeColorLight: '#f2f2f7',
  backgroundColor: '#050505',
  /** Namespace for localStorage keys, so several apps can share a domain. */
  storagePrefix: 'app-skeleton',
} as const;
