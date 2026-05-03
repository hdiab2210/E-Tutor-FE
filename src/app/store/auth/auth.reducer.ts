import { createReducer, on } from '@ngrx/store';
import { User } from '../../core/services/auth.service';
import { AuthActions } from './auth.actions';

export interface SignUpPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignUpResponse {
  message: string;
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

function loadUserFromStorage(): User | null {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (!user?.id || !user?.email || !user?.token || !user?.name || !user?.refreshToken) {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('auth_token');
      return null;
    }
    return user as User;
  } catch {
    return null;
  }
}

export const initialAuthState: AuthState = {
  user: loadUserFromStorage(),
  isLoading: false,
  error: null,
};

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.signUp, AuthActions.googleSignUp, AuthActions.loginRequest, AuthActions.googleLoginRequest, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.signUpSuccess, AuthActions.googleSignUpSuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null,
  })),

  on(AuthActions.signUpFailure, AuthActions.googleSignUpFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(AuthActions.loginSuccess, AuthActions.googleLoginSuccess, (state, { user }) => {
    localStorage.setItem(TOKEN_KEY, user.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { ...state, isLoading: false, error: null, user };
  }),

  on(AuthActions.loginFailure, AuthActions.googleLoginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(AuthActions.login, (state, { user }) => {
    localStorage.setItem(TOKEN_KEY, user.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { ...state, user };
  }),

  on(AuthActions.logout, (state) => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return { ...state, user: null };
  }),

  on(AuthActions.tokenRefreshed, (state, { token, refreshToken }) => {
    if (!state.user) return state;
    const updatedUser = { ...state.user, token, refreshToken };
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    return { ...state, user: updatedUser };
  }),

  on(AuthActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);
