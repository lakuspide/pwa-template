import { TestBed } from '@angular/core/testing';
import { CartService, MenuItem } from './cart.service';

describe('CartService', () => {
  let service: CartService;

  const item = (overrides: Partial<MenuItem> = {}): MenuItem => ({
    id: '1',
    name: 'Test Item',
    price: '24.00 €',
    description: 'A test item',
    image: 'https://example.com/img.jpg',
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

  describe('totalPrice parsing', () => {
    it('parses "24.00 €" (dot as decimal separator)', () => {
      service.addItem(item({ id: 'A', price: '24.00 €' }), 1);
      expect(service.totalPrice()).toBeCloseTo(24, 2);
    });

    it('parses "24,00" (comma as decimal separator)', () => {
      service.addItem(item({ id: 'A', price: '24,00' }), 1);
      expect(service.totalPrice()).toBeCloseTo(24, 2);
    });

    it('parses "$ 1.234,56" (dot as thousands, comma as decimal)', () => {
      service.addItem(item({ id: 'A', price: '$ 1.234,56' }), 1);
      expect(service.totalPrice()).toBeCloseTo(1234.56, 2);
    });

    it('parses "$1,234.56" (comma as thousands, dot as decimal)', () => {
      service.addItem(item({ id: 'A', price: '$1,234.56' }), 1);
      expect(service.totalPrice()).toBeCloseTo(1234.56, 2);
    });

    it('multiplies unit price by quantity', () => {
      service.addItem(item({ id: 'A', price: '10.00' }), 3);
      expect(service.totalPrice()).toBeCloseTo(30, 2);
    });

    it('sums across multiple distinct items', () => {
      service.addItem(item({ id: 'A', price: '10.00' }), 1);
      service.addItem(item({ id: 'B', price: '5.00' }), 2);
      expect(service.totalPrice()).toBeCloseTo(20, 2);
    });

    it('treats an unparseable price as 0 rather than throwing', () => {
      service.addItem(item({ id: 'A', price: '{Price Label}' }), 1);
      expect(() => service.totalPrice()).not.toThrow();
      expect(service.totalPrice()).toBe(0);
    });
  });
});
