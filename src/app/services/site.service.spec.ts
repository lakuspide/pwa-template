import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { SiteService } from './site.service';

describe('SiteService', () => {
  let service: SiteService;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SiteService);
    document = TestBed.inject(DOCUMENT);
  });

  it('starts on the bundled demo preset', () => {
    expect(service.demoMode).toBe(true);
    expect(service.preset()).toBe('boutique');
    expect(service.identity().appName).toBe('Maison Lumière');
    expect(service.features().checkout).toBe(true);
    expect(service.catalog().length).toBeGreaterThan(0);
  });

  it('switches identity, features and catalog together', () => {
    const changed = service.applyPreset('showcase');

    expect(changed).toBe(true);
    expect(service.preset()).toBe('showcase');
    expect(service.identity().appName).toBe('Atelier North');
    expect(service.features().prices).toBe(false);
    expect(service.features().cart).toBe(false);
    expect(service.catalog().every((category) => category.items.every((item) => item.price === null))).toBe(true);
  });

  it('ignores the preset that is already active', () => {
    expect(service.applyPreset('boutique')).toBe(false);
    expect(service.preset()).toBe('boutique');
  });

  it('formats prices with the active locale and currency', () => {
    expect(service.formatPrice(12.5)).toContain('12.50');
    expect(service.formatPrice(null)).toBe('');
  });

  it('updates the document title, language and accent when the sector changes', () => {
    service.applyPreset('menu');

    expect(document.title).toBe('Casa Verde');
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.style.getPropertyValue('--accent-dark')).toBe('#7cb518');
    expect(document.documentElement.style.getPropertyValue('--accent-light')).toBe('#4f772d');
  });

  it('builds contact links from the active preset', () => {
    service.applyPreset('services');

    expect(service.contactLink('email')).toBe('mailto:hello@pulsestudio.example');
    expect(service.contactLink('phone')).toBe('tel:+34910000404');
  });
});
