import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { CatalogItem } from '../models/catalog';

describe('CartService', () => {
  let service: CartService;

  const item = (overrides: Partial<CatalogItem> = {}): CatalogItem => ({
    id: '1',
    name: 'Test Item',
    price: 24,
    description: 'A test item',
    image: 'images/catalog-1.svg',
    ...overrides,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  it('should be created with an empty cart', () => {
    expect(service).toBeTruthy();
    expect(service.items()).toEqual([]);
    expect(service.totalItems()).toBe(0);
    expect(service.totalPrice()).toBe(0);
  });

  it('should add a new item with the given quantity', () => {
    service.addItem(item(), 2);
    expect(service.items().length).toBe(1);
    expect(service.items()[0].quantity).toBe(2);
    expect(service.totalItems()).toBe(2);
  });

  it('should merge quantities when adding the same item twice', () => {
    service.addItem(item({ id: 'A' }), 1);
    service.addItem(item({ id: 'A' }), 3);
    expect(service.items().length).toBe(1);
    expect(service.items()[0].quantity).toBe(4);
  });

  it('should keep distinct items separate', () => {
    service.addItem(item({ id: 'A' }), 1);
    service.addItem(item({ id: 'B' }), 1);
    expect(service.items().length).toBe(2);
  });

  it('should remove an item entirely regardless of quantity', () => {
    service.addItem(item({ id: 'A' }), 5);
    service.removeItem('A');
    expect(service.items().length).toBe(0);
  });

  it('should increase and decrease quantity with updateQuantity', () => {
    service.addItem(item({ id: 'A' }), 2);
    service.updateQuantity('A', 1);
    expect(service.items()[0].quantity).toBe(3);
    service.updateQuantity('A', -1);
    expect(service.items()[0].quantity).toBe(2);
  });

  it('should drop the item once its quantity reaches 0', () => {
    service.addItem(item({ id: 'A' }), 1);
    service.updateQuantity('A', -1);
    expect(service.items().length).toBe(0);
  });

  it('should never let quantity go negative', () => {
    service.addItem(item({ id: 'A' }), 1);
    service.updateQuantity('A', -10);
    expect(service.items().length).toBe(0);
  });

  it('should clear all items', () => {
    service.addItem(item({ id: 'A' }), 1);
    service.addItem(item({ id: 'B' }), 2);
    service.clearCart();
    expect(service.items()).toEqual([]);
    expect(service.totalPrice()).toBe(0);
  });

  describe('totals', () => {
    it('multiplies unit price by quantity', () => {
      service.addItem(item({ id: 'A', price: 10 }), 3);
      expect(service.totalPrice()).toBeCloseTo(30, 2);
    });

    it('sums across multiple distinct items', () => {
      service.addItem(item({ id: 'A', price: 10 }), 1);
      service.addItem(item({ id: 'B', price: 5 }), 2);
      expect(service.totalPrice()).toBeCloseTo(20, 2);
    });

    it('keeps decimal precision for prices like 12.50', () => {
      service.addItem(item({ id: 'A', price: 12.5 }), 2);
      expect(service.totalPrice()).toBeCloseTo(25, 2);
    });
  });

  describe('orderLines', () => {
    it('maps the cart to the shape the order endpoint expects', () => {
      service.addItem(item({ id: 'A', name: 'First', price: 10 }), 2);

      expect(service.orderLines()).toEqual([
        { itemId: 'A', name: 'First', unitPrice: 10, quantity: 2 },
      ]);
    });
  });
});
