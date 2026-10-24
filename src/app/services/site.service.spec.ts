import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { SITE_CONFIG } from '../../site/site.config';
import type { SectorPresetId } from '../../site/site.types';
import { SiteService } from './site.service';

describe('SiteService', () => {
  let service: SiteService;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SiteService);
    document = TestBed.inject(DOCUMENT);
  });

  it('starts on the configured preset', () => {
    expect(service.demoMode).toBe(SITE_CONFIG.demoMode);
    expect(service.preset()).toBe(SITE_CONFIG.preset);
    expect(service.identity().appName).toBe(SITE_CONFIG.identity.appName);
    expect(service.features()).toEqual(SITE_CONFIG.features);
    expect(service.catalog().length).toBe(SITE_CONFIG.catalog.length);
  });

  it('ignores the preset that is already active', () => {
    expect(service.applyPreset(SITE_CONFIG.preset)).toBe(false);
    expect(service.preset()).toBe(SITE_CONFIG.preset);
  });

  it('formats prices with the active locale and currency', () => {
    expect(service.formatPrice(12.5)).toContain('12.50');
    expect(service.formatPrice(null)).toBe('');
  });

  it('applies the identity to the document', () => {
    const identity = SITE_CONFIG.identity;

    expect(document.title).toBe(identity.appName);
    expect(document.documentElement.lang).toBe(identity.lang);
    expect(document.documentElement.style.getPropertyValue('--accent-dark')).toBe(
      identity.accentDark,
    );
    expect(document.documentElement.style.getPropertyValue('--accent-light')).toBe(
      identity.accentLight,
    );
  });

  it('builds contact links from the active preset', () => {
    const contact = SITE_CONFIG.content.contact;
    const phone = contact.phone.replace(/[^\d+]/g, '');

    expect(service.contactLink('email')).toBe(
      contact.email ? `mailto:${contact.email}` : null,
    );
    expect(service.contactLink('phone')).toBe(phone ? `tel:${phone}` : null);
  });

  /** Any preset other than the active one; used to check switching rules. */
  const otherPreset: SectorPresetId =
    SITE_CONFIG.preset === 'showcase' ? 'menu' : 'showcase';

  if (SITE_CONFIG.demoMode) {
    it('switches identity, features and catalog together', () => {
      const changed = service.applyPreset(otherPreset);

      expect(changed).toBe(true);
      expect(service.preset()).toBe(otherPreset);
      expect(service.identity().appName).not.toBe(SITE_CONFIG.identity.appName);
      expect(document.title).toBe(service.identity().appName);
    });
  } else {
    it('stays pinned to the configured preset', () => {
      expect(service.applyPreset(otherPreset)).toBe(false);
      expect(service.preset()).toBe(SITE_CONFIG.preset);
      expect(service.identity().appName).toBe(SITE_CONFIG.identity.appName);
    });
  }
});
