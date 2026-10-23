import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Reservation {
  name: string;
  email: string;
  location: string;
  guests: string;
  date?: string;
}

/**
 * Submits reservation/order requests.
 *
 * With `environment.useMockData = true` (the template's default) this
 * simulates network latency and always succeeds, so the checkout flow
 * is fully demoable without a backend. Set `useMockData = false` to
 * POST to `${environment.apiBaseUrl}/reservations` instead.
 */
@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);

  /**
   * Submits a reservation. Resolves `true` on success, `false` if the
   * backend rejected the request. Throws only on unexpected/network errors.
   */
  async createReservation(reservation: Reservation): Promise<boolean> {
    if (environment.useMockData) {
      console.log('[ReservationService] Processing request (mock)...', reservation);
      // Simulated network latency so the UI's loading state is exercised.
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('[ReservationService] Operation confirmed and saved (mock).');
      return true;
    }

    try {
      await firstValueFrom(
        this.http.post(`${environment.apiBaseUrl}/reservations`, reservation)
      );
      return true;
    } catch (err) {
      console.error('[ReservationService] createReservation failed:', err);
      return false;
    }
  }
}
