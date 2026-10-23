import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should start logged out', () => {
    expect(service.currentUser()).toBeNull();
  });

  it('should log in with the given email and role', () => {
    service.login('jane.doe@example.com', 'manager');
    const user = service.currentUser();
    expect(user).not.toBeNull();
    expect(user?.email).toBe('jane.doe@example.com');
    expect(user?.role).toBe('manager');
  });

  it('should derive the display name from the email local part', () => {
    service.login('jane.doe@example.com', 'user');
    expect(service.currentUser()?.name).toBe('jane.doe');
  });

  it('should grant loyalty points only to the "user" role', () => {
    service.login('a@example.com', 'user');
    expect(service.currentUser()?.points).toBe(1250);

    service.login('b@example.com', 'admin');
    expect(service.currentUser()?.points).toBeUndefined();
  });

  it('should clear the current user on logout', () => {
    service.login('a@example.com', 'guest');
    expect(service.currentUser()).not.toBeNull();
    service.logout();
    expect(service.currentUser()).toBeNull();
  });
});
