import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { formatPrice } from '../shared/price';
import { PRESET_SUMMARIES, resolveSiteConfig } from '../../site/presets';
import { BRAND_OVERRIDES, SITE_CONFIG } from '../../site/site.config';
import type { SectorPresetId, SiteConfig } from '../../site/site.types';

/**
 * Runtime access to the active site preset.
 *
 * Components read `identity`, `features`, `content` and `catalog` from here;
 * nothing else hard-codes sector copy. In demo mode `applyPreset()` swaps the
 * whole configuration and updates the document accent, title and language.
 */
@Injectable({ providedIn: 'root' })
export class SiteService {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  private readonly configState = signal<SiteConfig>(SITE_CONFIG);

  /** Active configuration. Read-only; change it through `applyPreset()`. */
  readonly config = this.configState.asReadonly();
  readonly identity = computed(() => this.configState().identity);
  readonly features = computed(() => this.configState().features);
  readonly content = computed(() => this.configState().content);
  readonly catalog = computed(() => this.configState().catalog);
  readonly preset = computed(() => this.configState().preset);

  /** True only in the template demo; generated projects pin a preset. */
  readonly demoMode = SITE_CONFIG.demoMode;
  readonly presets = PRESET_SUMMARIES;

  constructor() {
    this.applyIdentity(SITE_CONFIG.identity);
  }

  /**
   * Switches the sector in demo mode. Returns `false` when the app is pinned or
   * the preset is already active, so callers can decide whether to reset state.
   */
  applyPreset(preset: SectorPresetId): boolean {
    if (!this.demoMode || preset === this.preset()) {
      return false;
    }

    const next = resolveSiteConfig(preset, BRAND_OVERRIDES, this.demoMode);
    this.configState.set(next);
    this.applyIdentity(next.identity);
    return true;
  }

  /** Formats a price with the active locale and currency. */
  formatPrice(value: number | null | undefined): string {
    return formatPrice(value, this.identity().currency, this.identity().locale);
  }

  /** Builds a `mailto:` / `tel:` link from the active contact details. */
  contactLink(kind: 'email' | 'phone'): string | null {
    const contact = this.content().contact;
    if (kind === 'email') {
      return contact.email ? `mailto:${contact.email}` : null;
    }
    const phone = contact.phone.replace(/[^\d+]/g, '');
    return phone ? `tel:${phone}` : null;
  }

  private applyIdentity(identity: SiteConfig['identity']): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const root = this.document.documentElement;
    root.style.setProperty('--accent-dark', identity.accentDark);
    root.style.setProperty('--accent-light', identity.accentLight);
    root.lang = identity.lang;

    this.document.title = identity.appName;
    this.setMeta('name="description"', identity.description);
    this.setMeta('name="apple-mobile-web-app-title"', identity.shortName);
  }

  private setMeta(selector: string, content: string): void {
    const element = this.document.querySelector(`meta[${selector}]`);
    element?.setAttribute('content', content);
  }
}
