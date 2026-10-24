import { resolveSiteConfig } from './presets';
import type { BrandOverrides, SectorPresetId } from './site.types';

/**
 * Site configuration — the only file a generated project needs to change.
 *
 * - `DEMO_MODE` enables the sector switcher and runtime preset changes. The
 *   generator sets it to `false`, so a production project pins one preset.
 * - `ACTIVE_PRESET` is the sector this project starts with.
 * - `BRAND_OVERRIDES` replaces name, tagline and formatting without touching
 *   the preset's demo copy. The generator writes these values.
 *
 * Generated projects keep this file as the source of truth for branding.
 */

/** Demo mode: the sector switcher is visible and presets can change at runtime. */
export const DEMO_MODE = true;

/** Sector this app starts with. In production, the generator pins it. */
export const ACTIVE_PRESET: SectorPresetId = 'boutique';

/** Brand values that win over the preset's demo identity. */
export const BRAND_OVERRIDES: BrandOverrides = {
  // Generated projects fill this object through `npm run new`.
};

/** Fully resolved configuration consumed by `SiteService`. */
export const SITE_CONFIG = resolveSiteConfig(ACTIVE_PRESET, BRAND_OVERRIDES, DEMO_MODE);
