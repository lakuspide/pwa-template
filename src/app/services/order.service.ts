import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrderLine } from '../models/catalog';
import { logger } from '../shared/logger';

/** What the checkout flow sends to the backend. */
export interface OrderRequest {
  customer: {
    name: string;
    email: string;
  };
  lines: OrderLine[];
  total: number;
  notes?: string;
}

/** Result of a submission. `ok: false` carries a user-facing message. */
export interface OrderResult {
  ok: boolean;
  orderId?: string;
  error?: string;
}

/**
 * Sends orders to the backend.
 *
 * In mock mode (`environment.useMockData = true`) it simulates latency and
 * always succeeds, so the whole checkout flow is demoable with no backend.
 * Set the flag to `false` to POST to `{apiBaseUrl}/orders` instead.
 */
@Injectable({ providedIn: 'root' })
export class OrderService {
  /** How long the mock "network" takes, so loading states get exercised. */
  private static readonly MOCK_LATENCY_MS = 1200;

  private http = inject(HttpClient);

  async submitOrder(order: OrderRequest): Promise<OrderResult> {
    if (environment.useMockData) {
      logger.info('Submitting order (mock)', order);
      await new Promise((resolve) => setTimeout(resolve, OrderService.MOCK_LATENCY_MS));
      return { ok: true, orderId: this.createOrderId() };
    }

    try {
      const response = await firstValueFrom(
        this.http.post<{ orderId?: string }>(`${environment.apiBaseUrl}/orders`, order),
      );
      return { ok: true, orderId: response?.orderId ?? this.createOrderId() };
    } catch (err) {
      logger.error('OrderService.submitOrder failed', err);
      return { ok: false, error: 'No pudimos enviar tu pedido. Inténtalo de nuevo.' };
    }
  }

  /** Short, human-readable reference for the confirmation screen. */
  private createOrderId(): string {
    return Date.now().toString(36).slice(-6).toUpperCase();
  }
}
