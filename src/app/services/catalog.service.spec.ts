import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SITE_CONFIG } from '../../site/site.config';
import type { SectorPresetId } from '../../site/site.types';
import { CatalogService } from './catalog.service';
import { SiteService } from './site.service';

describe('CatalogService', () => {
  let service: CatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CatalogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start populated with the active preset catalog (useMockData is true by default)', () => {
    expect(service.categories().length).toBe(SITE_CONFIG.catalog.length);
  });

  it('every category should expose id, name and a non-empty items array', () => {
    for (const category of service.categories()) {
      expect(category.id).toBeTruthy();
      expect(category.name).toBeTruthy();
      expect(Array.isArray(category.items)).toBe(true);
      expect(category.items.length).toBeGreaterThan(0);
    }
  });

  it('every item should have the fields the cart and the UI rely on', () => {
    const allItems = service.categories().flatMap(c => c.items);
    for (const item of allItems) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.price === null || typeof item.price === 'number').toBe(true);
      expect(item.image).toBeTruthy();
    }
  });

  it('load() in mock mode resolves without touching the network and keeps the preset data', async () => {
    await service.load();
    expect(service.categories().length).toBe(SITE_CONFIG.catalog.length);
    expect(service.isLoading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('only follows another preset while the project is in demo mode', () => {
    const site = TestBed.inject(SiteService);
    const target: SectorPresetId =
      SITE_CONFIG.preset === 'showcase' ? 'menu' : 'showcase';
    const changed = site.applyPreset(target);

    if (site.demoMode) {
      const expected = site.catalog();

      expect(changed).toBe(true);
      expect(service.categories().map((category) => category.id)).toEqual(
        expected.map((category) => category.id),
      );
    } else {
      expect(changed).toBe(false);
      expect(service.categories().map((category) => category.id)).toEqual(
        SITE_CONFIG.catalog.map((category) => category.id),
      );
    }
  });
});
