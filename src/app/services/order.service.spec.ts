import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { OrderRequest, OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;

  const sample: OrderRequest = {
    customer: { name: 'Jane Doe', email: 'jane@example.com' },
    lines: [{ itemId: 'C1-1', name: 'Item 1.1', unitPrice: 12.5, quantity: 2 }],
    total: 25,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should resolve ok with an order id in mock mode', async () => {
    const result = await service.submitOrder(sample);

    expect(result.ok).toBe(true);
    expect(result.orderId).toMatch(/^[0-9A-Z]+$/);
    expect(result.error).toBeUndefined();
  });

  it('should simulate network latency instead of resolving instantly', async () => {
    vi.useFakeTimers();
    try {
      let resolved = false;
      void service.submitOrder(sample).then(() => (resolved = true));

      // Let microtasks flush without advancing the simulated clock.
      await vi.advanceTimersByTimeAsync(0);
      expect(resolved).toBe(false);

      // Advance past the mock's simulated latency.
      await vi.advanceTimersByTimeAsync(1200);
      expect(resolved).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
