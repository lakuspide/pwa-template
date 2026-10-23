import { TestBed } from '@angular/core/testing';
import { CheckoutDrawerComponent } from './checkout-drawer.component';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';

const clickEvent = () =>
  ({
    stopPropagation: vi.fn(),
    currentTarget: document.createElement('button'),
  }) as unknown as MouseEvent;

describe('CheckoutDrawerComponent', () => {
  let cart: CartService;
  let submitOrder: ReturnType<typeof vi.fn>;

  const setup = (result: { ok: boolean; orderId?: string; error?: string }) => {
    submitOrder = vi.fn().mockResolvedValue(result);
    TestBed.configureTestingModule({
      imports: [CheckoutDrawerComponent],
      providers: [{ provide: OrderService, useValue: { submitOrder } }],
    });
    cart = TestBed.inject(CartService);
    cart.addItem(
      { id: 'A', name: 'Item A', price: 10, description: 'd', image: 'images/catalog-1.svg' },
      2,
    );
    return TestBed.createComponent(CheckoutDrawerComponent).componentInstance;
  };

  it('submits the cart contents and shows the order reference on success', async () => {
    const component = setup({ ok: true, orderId: 'ABC123' });
    const confirmed = vi.fn();
    component.orderConfirmed.subscribe(confirmed);

    component.confirmOrder(clickEvent());
    expect(component.isConfirming()).toBe(true);
    await vi.waitFor(() => expect(component.orderSuccess()).toBe(true));

    expect(submitOrder).toHaveBeenCalledOnce();
    expect(submitOrder.mock.calls[0][0]).toMatchObject({
      total: 20,
      lines: [{ itemId: 'A', name: 'Item A', unitPrice: 10, quantity: 2 }],
    });
    expect(component.orderId()).toBe('ABC123');
    expect(confirmed).toHaveBeenCalledOnce();
    expect(component.isConfirming()).toBe(false);
  });

  it('keeps the cart and shows the error when the order fails', async () => {
    const component = setup({ ok: false, error: 'Backend down' });
    const confirmed = vi.fn();
    component.orderConfirmed.subscribe(confirmed);

    component.confirmOrder(clickEvent());
    await vi.waitFor(() => expect(component.orderError()).toBe('Backend down'));

    expect(component.orderSuccess()).toBe(false);
    expect(component.orderId()).toBeNull();
    expect(confirmed).not.toHaveBeenCalled();
    expect(cart.items().length).toBe(1);
  });
});
