import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReservationService, Reservation } from './reservation.service';

describe('ReservationService', () => {
  let service: ReservationService;

  const sample: Reservation = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    location: 'Main Branch',
    guests: '2',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReservationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should resolve true in mock mode', async () => {
    const result = await service.createReservation(sample);
    expect(result).toBe(true);
  });

  it('should simulate a real network delay rather than resolving instantly', async () => {
    vi.useFakeTimers();
    try {
      let resolved = false;
      service.createReservation(sample).then(() => (resolved = true));

      // Let microtasks flush without advancing the simulated clock.
      await vi.advanceTimersByTimeAsync(0);
      expect(resolved).toBe(false);

      // Advance past the mock's 1.5s simulated latency.
      await vi.advanceTimersByTimeAsync(1500);
      expect(resolved).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
