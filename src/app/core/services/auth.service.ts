import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';
import { selectCurrentUser, selectIsAuthenticated } from '../../store/auth/auth.selectors';

export interface User {
  id: string;
  name: string;
  email: string;
  token: string;
  refreshToken: string
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly store = inject(Store);

  readonly currentUser = this.store.selectSignal(selectCurrentUser);
  readonly isAuthenticated = this.store.selectSignal(selectIsAuthenticated);

  login(user: User): void {
    this.store.dispatch(AuthActions.login({ user }));
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
  }

  getRefreshToken(): string | null {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_user') : null;
      if (!raw) return null;
      return (JSON.parse(raw) as User)?.refreshToken ?? null;
    } catch {
      return null;
    }
  }

  updateTokens(token: string, refreshToken: string): void {
    this.store.dispatch(AuthActions.tokenRefreshed({ token, refreshToken }));
  }
}
