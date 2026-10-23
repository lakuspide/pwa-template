import { TestBed } from '@angular/core/testing';
import { CarouselCylinderComponent } from './carousel-cylinder.component';
import { CatalogService } from './services/catalog.service';
import { CartService } from './services/cart.service';
import { DisplayCard } from './components/carousel-3d.component';

/**
 * Smoke tests for the one component that orchestrates the whole screen.
 * They deliberately stay at the state level: the visual identity (the 3D
 * carousel) is not asserted here, only the transitions around it.
 */
describe('CarouselCylinderComponent', () => {
  let component: CarouselCylinderComponent;
  let catalog: CatalogService;
  let cart: CartService;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [CarouselCylinderComponent] });
    await TestBed.compileComponents();
    component = TestBed.createComponent(CarouselCylinderComponent).componentInstance;
    catalog = TestBed.inject(CatalogService);
    cart = TestBed.inject(CartService);
  });

  it('starts on the intro screen with the categories view', () => {
    expect(component.appMode()).toBe('intro');
    expect(component.viewState()).toBe('categories');
  });

  it('enters the catalog and exposes one card per category', () => {
    component.enterCatalog();

    expect(component.appMode()).toBe('catalog');
    expect(component.categoryCards().length).toBe(catalog.categories().length);
  });

  it('moves from categories to items and back', () => {
    vi.useFakeTimers();
    try {
      const card: DisplayCard = component.categoryCards()[0];

      component.onCardSelect(card);
      expect(component.isTransitioning()).toBe(true);
      vi.advanceTimersByTime(300);

      expect(component.viewState()).toBe('items');
      expect(component.activeCategory()?.id).toBe(card.id);
      expect(component.itemCards().length).toBeGreaterThan(0);

      component.goBack();
      vi.advanceTimersByTime(300);

      expect(component.viewState()).toBe('categories');
      expect(component.activeCategory()).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('opening a panel closes the sidebar', () => {
    component.showSidebar.set(true);

    component.openPanel('terms');

    expect(component.showSidebar()).toBe(false);
    expect(component.activeBox()).toBe('terms');
  });

  it('clears the cart once the order is confirmed', () => {
    cart.addItem(
      { id: 'A', name: 'Item A', price: 10, description: 'd', image: 'images/catalog-1.svg' },
      2,
    );

    component.onOrderConfirmed();

    expect(cart.items().length).toBe(0);
  });
});
