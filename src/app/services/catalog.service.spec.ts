import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CatalogService } from './catalog.service';

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

  it('should start populated with the bundled placeholder catalog (useMockData is true by default)', () => {
    expect(service.categories().length).toBe(4);
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
      expect(typeof item.price).toBe('number');
      expect(item.image).toBeTruthy();
    }
  });

  it('load() in mock mode resolves without touching the network and keeps the placeholder data', async () => {
    await service.load();
    expect(service.categories().length).toBe(4);
    expect(service.isLoading()).toBe(false);
    expect(service.error()).toBeNull();
  });
});
