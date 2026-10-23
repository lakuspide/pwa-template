import { TestBed } from '@angular/core/testing';
import { ProductModalComponent } from './product-modal.component';
import { CartService } from '../services/cart.service';
import { CatalogItem } from '../models/catalog';

describe('ProductModalComponent', () => {
  let component: ProductModalComponent;
  let cartService: CartService;

  const testProduct: CatalogItem = {
    id: 'P1',
    name: 'Test Product',
    price: 15,
    description: 'A product used in tests',
    image: 'images/catalog-1.svg',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductModalComponent],
    });
    const fixture = TestBed.createComponent(ProductModalComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService);
    fixture.componentRef.setInput('product', testProduct);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with a quantity of 1', () => {
    expect(component.orderQuantity()).toBe(1);
  });

  it('should increase quantity', () => {
    component.increaseQuantity();
    expect(component.orderQuantity()).toBe(2);
  });

  it('should decrease quantity but never below 1', () => {
    component.increaseQuantity(); // now 2
    component.decreaseQuantity(); // back to 1
    expect(component.orderQuantity()).toBe(1);
    component.decreaseQuantity(); // should stay at 1, not go to 0
    expect(component.orderQuantity()).toBe(1);
  });

  it('should add the selected product and quantity to the cart on addToOrder', () => {
    component.increaseQuantity(); // quantity = 2
    const fakeEvent = {
      stopPropagation: vi.fn(),
      currentTarget: document.createElement('button'),
    } as unknown as MouseEvent;

    component.addToOrder(fakeEvent);

    expect(cartService.items().length).toBe(1);
    expect(cartService.items()[0].id).toBe('P1');
    expect(cartService.items()[0].quantity).toBe(2);
  });

  it('should emit addedToCart and closeModal when an order is placed', () => {
    const addedSpy = vi.fn();
    const closeSpy = vi.fn();
    component.addedToCart.subscribe(addedSpy);
    component.closeModal.subscribe(closeSpy);

    const fakeEvent = {
      stopPropagation: vi.fn(),
      currentTarget: document.createElement('button'),
    } as unknown as MouseEvent;
    component.addToOrder(fakeEvent);

    expect(addedSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should not throw when addToOrder is called with no product set', () => {
    const fixture = TestBed.createComponent(ProductModalComponent);
    const emptyComponent = fixture.componentInstance;
    fixture.detectChanges();

    const fakeEvent = {
      stopPropagation: vi.fn(),
      currentTarget: document.createElement('button'),
    } as unknown as MouseEvent;

    expect(() => emptyComponent.addToOrder(fakeEvent)).not.toThrow();
  });
});
