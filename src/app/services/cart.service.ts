import { Injectable, computed, signal } from '@angular/core';
import { CartItem, CatalogItem, OrderLine } from '../models/catalog';

/**
 * Client-side cart. Pure Signals state — no backend calls here;
 * `OrderService.submitOrder()` is what actually sends the order.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  /** Items currently in the cart. */
  items = signal<CartItem[]>([]);

  /**
   * Sum of `price * quantity` across all lines. Information-only items carry a
   * `null` price; when they end up in a cart (a misconfigured preset) they
   * contribute zero instead of breaking the total.
   */
  totalPrice = computed(() =>
    this.items().reduce((total, item) => total + (item.price ?? 0) * item.quantity, 0),
  );

  /** Total number of units across all cart lines (not distinct items). */
  totalItems = computed(() => this.items().reduce((total, item) => total + item.quantity, 0));

  /** Cart snapshot in the shape the order endpoint expects. */
  orderLines = computed<OrderLine[]>(() =>
    this.items().map(({ id, name, price, quantity }) => ({
      itemId: id,
      name,
      unitPrice: price ?? 0,
      quantity,
    })),
  );

  /** Adds `quantity` units of `item`, merging into an existing line if present. */
  addItem(item: CatalogItem, quantity: number): void {
    this.items.update((current) => {
      const existing = current.find((line) => line.id === item.id);
      if (existing) {
        return current.map((line) =>
          line.id === item.id ? { ...line, quantity: line.quantity + quantity } : line,
        );
      }
      return [...current, { ...item, quantity }];
    });
  }

  /** Removes a line from the cart entirely, regardless of quantity. */
  removeItem(itemId: string): void {
    this.items.update((current) => current.filter((item) => item.id !== itemId));
  }

  /** Adjusts a line's quantity by `delta`; drops the line when it reaches zero. */
  updateQuantity(itemId: string, delta: number): void {
    this.items.update((current) =>
      current
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  /** Empties the cart (called after a successful order). */
  clearCart(): void {
    this.items.set([]);
  }
}
