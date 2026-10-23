import { Injectable, signal } from '@angular/core';

/** Access levels used across the app to gate UI (not enforced server-side here). */
export type Role = 'guest' | 'user' | 'manager' | 'operator' | 'admin';

export interface UserProfile {
  email: string;
  name: string;
  role: Role;
  points?: number;
}

/**
 * Mock authentication. `login()` accepts any email/role combo and never
 * validates a password — this exists purely so the UI's role-gated states
 * (guest vs. logged-in, admin panels, etc.) can be demoed without a backend.
 *
 * To wire up real auth: replace `login()`'s body with a call to your
 * identity provider (Supabase Auth, Firebase Auth, Auth0, a custom JWT
 * endpoint...), store the returned token (e.g. in an HttpOnly cookie set
 * by the server, not localStorage), and populate `currentUser` from the
 * decoded/verified session instead of trusting client input.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<UserProfile | null>(null);

  /** Mock sign-in: trusts the caller-supplied role. Do not use as-is in production. */
  login(email: string, role: Role) {
    this.currentUser.set({
      email,
      name: email.split('@')[0],
      role,
      points: role === 'user' ? 1250 : undefined
    });
  }

  logout() {
    this.currentUser.set(null);
  }
}
