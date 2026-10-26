import type { CatalogCategory } from '../app/models/catalog';
import type { LocationPanelId } from '../app/models/panel';

/**
 * Site configuration types.
 *
 * A "preset" is a complete, self-contained sector demo: identity, feature
 * flags, editorial content and a sample catalog. Presets are selected at build
 * time (`ACTIVE_PRESET`) and, only in demo mode, switched at runtime by the
 * sector switcher.
 */

/** The sectors bundled with the template. Add one here and in `presets.ts`. */
export const PRESET_IDS = [
  'boutique',
  'menu',
  'showcase',
  'services',
  'real-estate',
  'market',
] as const;

export type SectorPresetId = (typeof PRESET_IDS)[number];

/**
 * What the app is allowed to do. Every screen checks these flags, so a catalog
 * without commerce never renders a cart, a checkout or a price.
 */
export interface SiteFeatures {
  /** Show prices in the carousel, item cards and product detail. */
  prices: boolean;
  /** Show quantity controls and the floating cart button. */
  cart: boolean;
  /** Enable the checkout drawer and order submission. Requires `cart`. */
  checkout: boolean;
  /** Show the mock sign-in, profile and role-gated navigation. */
  auth: boolean;
  /** Show the store / office directory. */
  locations: boolean;
  /** Show the about panel and its home teaser. */
  about: boolean;
  /** Show the promotional teaser inside the about panel. Requires `about`. */
  promo: boolean;
  /** Show the legal terms panel and its sidebar link. */
  terms: boolean;
  /** Show customer reviews on the order confirmation screen. */
  reviews: boolean;
}

/** Brand and metadata shown across the app, manifest and install prompts. */
export interface SiteIdentity {
  appName: string;
  shortName: string;
  tagline: string;
  description: string;
  lang: string;
  locale: string;
  currency: string;
  version: string;
  themeColorDark: string;
  themeColorLight: string;
  backgroundColor: string;
  /** localStorage namespace, so several apps can share a domain. */
  storagePrefix: string;
  /** Accent used in dark mode; applied as a CSS custom property at runtime. */
  accentDark: string;
  /** Accent used in light mode. */
  accentLight: string;
}

/** Fields a generated project replaces without touching the preset itself. */
export interface BrandOverrides {
  appName?: string;
  shortName?: string;
  tagline?: string;
  description?: string;
  lang?: string;
  locale?: string;
  currency?: string;
  version?: string;
  storagePrefix?: string;
}

/** Intro screen copy. The title always comes from the identity. */
export interface SiteHero {
  meta: string;
  swipeHint: string;
  enterLabel: string;
}

export interface SitePromo {
  label: string;
  detail: string;
}

export interface SiteAbout {
  title: string;
  lead: string;
  paragraphs: string[];
}

export interface SiteLocation {
  id: LocationPanelId;
  eyebrow: string;
  name: string;
  address: string;
  area: string;
  phone: string;
  hours: string;
  hoursLabel?: string;
}

/** Public contact details; also used by the "ask about this item" action. */
export interface SiteContact {
  email: string;
  phone: string;
}

export interface SiteTermsSection {
  heading: string;
  body: string;
}

export interface SiteTerms {
  title: string;
  intro: string;
  sections: SiteTermsSection[];
  updated: string;
}

export interface SiteContent {
  hero: SiteHero;
  promo: SitePromo;
  about: SiteAbout;
  locations: SiteLocation[];
  contact: SiteContact;
  terms: SiteTerms;
}

/** One bundled sector demo. */
export interface SitePreset {
  id: SectorPresetId;
  label: string;
  description: string;
  /** Material Icons ligature used by the switcher. */
  icon: string;
  /** Sector emblem shown on the intro screen. */
  heroImage: string;
  features: SiteFeatures;
  identity: SiteIdentity;
  content: SiteContent;
  catalog: CatalogCategory[];
}

/** Resolved configuration the app reads at runtime. */
export interface SiteConfig {
  preset: SectorPresetId;
  demoMode: boolean;
  /** Sector emblem shown on the intro screen. */
  heroImage: string;
  identity: SiteIdentity;
  features: SiteFeatures;
  content: SiteContent;
  catalog: CatalogCategory[];
}

/** Compact preset info for the demo switcher. */
export interface PresetSummary {
  id: SectorPresetId;
  label: string;
  description: string;
  icon: string;
}
