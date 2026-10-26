import { Injectable, signal } from '@angular/core';

/** Access levels used across the app to gate UI (not enforced server-side here). */
export type Role = 'guest' | 'user' | 'manager' | 'operator' | 'admin';

/** Visible names for the mock roles. */
export const ROLE_LABELS: Record<Role, string> = {
  guest: 'Invitado',
  user: 'Cliente',
  operator: 'Operador',
  manager: 'Responsable',
  admin: 'Administrador',
};

export interface UserProfile {
  email: string;
  name: string;
  role: Role;
  points?: number;
}

/**
 * Mock authentication.
 *
 * `login()` accepts any email/role combination and never validates a password —
 * it exists purely so the UI's role-gated states (guest vs. signed in, staff and
 * admin sections) can be demoed without a backend.
 *
 * To wire up real auth: replace `login()`'s body with a call to your identity
 * provider (Supabase Auth, Firebase Auth, Auth0, a custom JWT endpoint…), keep
 * the token in an HttpOnly cookie set by the server rather than localStorage,
 * and populate `currentUser` from the verified session instead of client input.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<UserProfile | null>(null);

  /** Mock sign-in: trusts the caller-supplied role. Do not use as-is in production. */
  login(email: string, role: Role): void {
    this.currentUser.set({
      email,
      name: email.split('@')[0],
      role,
      points: role === 'user' ? 1250 : undefined,
    });
  }

  logout(): void {
    this.currentUser.set(null);
  }
}
