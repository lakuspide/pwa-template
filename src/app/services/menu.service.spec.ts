import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MenuService } from './menu.service';

describe('MenuService', () => {
  let service: MenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start populated with the bundled mock catalog (useMockData is true by default)', () => {
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

  it('every item should have the fields CartService/UI rely on', () => {
    const allItems = service.categories().flatMap(c => c.items);
    for (const item of allItems) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.price).toBeTruthy();
      expect(item.image).toBeTruthy();
    }
  });

  it('fetchCategories() in mock mode resolves without touching the network and keeps the mock data', async () => {
    await service.fetchCategories();
    expect(service.categories().length).toBe(4);
    expect(service.isLoading()).toBe(false);
    expect(service.error()).toBeNull();
  });
});
