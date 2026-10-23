import { Injectable, signal, computed } from '@angular/core';

/** A catalog item as shown in the menu/product modal (no quantity). */
export interface MenuItem {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
}

/** A `MenuItem` plus the quantity the user has added to their cart. */
export interface CartItem extends MenuItem {
  quantity: number;
}

/**
 * Client-side shopping cart. Pure Signals state — no backend calls here;
 * `ReservationService.createReservation()` is what actually submits the order.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  // Change this to re-brand the currency used across the app (checkout, totals, etc.)
  readonly currencySymbol = '€';

  /** Items currently in the cart. */
  items = signal<CartItem[]>([]);

  /**
   * Sum of `price * quantity` across all cart items, parsed from each
   * item's `price` string (handles both "24.00" and "24,00" decimal styles).
   */
  totalPrice = computed(() => {
    return this.items().reduce((total, item) => {
      // Parse price string like "24.00 €" or "$ 120.000" to number
      // Extract numbers, dots and commas
      const match = item.price.match(/[\d.,]+/);
      let priceNum = 0;
      if (match) {
        let numStr = match[0];
        // If it has both dots and commas, assume the last one is the decimal separator
        if (numStr.includes('.') && numStr.includes(',')) {
           const lastDot = numStr.lastIndexOf('.');
           const lastComma = numStr.lastIndexOf(',');
           if (lastComma > lastDot) {
             numStr = numStr.replace(/\./g, '').replace(',', '.');
           } else {
             numStr = numStr.replace(/,/g, '');
           }
        } else if (numStr.includes(',')) {
           // If only comma, check if it's used as decimal (e.g. 24,00)
           const parts = numStr.split(',');
           if (parts.length === 2 && parts[1].length <= 2) {
             numStr = numStr.replace(',', '.');
           } else {
             numStr = numStr.replace(/,/g, '');
           }
        }
        priceNum = parseFloat(numStr);
      }
      return total + (priceNum * item.quantity);
    }, 0);
  });

  /** Total number of units across all cart items (not distinct line items). */
  totalItems = computed(() => {
    return this.items().reduce((total, item) => total + item.quantity, 0);
  });

  /** Adds `quantity` units of `item` to the cart, merging into an existing line if present. */
  addItem(item: MenuItem, quantity: number) {
    this.items.update(current => {
      const existing = current.find(i => i.id === item.id);
      if (existing) {
        return current.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...current, { ...item, quantity }];
    });
  }

  /** Removes a line item from the cart entirely, regardless of quantity. */
  removeItem(itemId: string) {
    this.items.update(current => current.filter(i => i.id !== itemId));
  }

  /** Adjusts a line item's quantity by `delta` (can be negative); removes it if it reaches 0. */
  updateQuantity(itemId: string, delta: number) {
    this.items.update(current => {
      return current.map(i => {
        if (i.id === itemId) {
          const newQuantity = Math.max(0, i.quantity + delta);
          return { ...i, quantity: newQuantity };
        }
        return i;
      }).filter(i => i.quantity > 0);
    });
  }
  
  /** Empties the cart (called after a successful order/checkout). */
  clearCart() {
    this.items.set([]);
  }
}
