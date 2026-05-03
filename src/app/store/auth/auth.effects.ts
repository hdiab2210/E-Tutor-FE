import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthActions } from './auth.actions';
import { SignUpResponse, LoginResponse } from './auth.reducer';
import { User } from '../../core/services/auth.service';

export const signUpEffect = createEffect(
  (actions$ = inject(Actions), api = inject(ApiService)) =>
    actions$.pipe(
      ofType(AuthActions.signUp),
      switchMap(({ payload }) =>
        api.post<SignUpResponse>('/auth/signup', payload).pipe(
          map((response) => AuthActions.signUpSuccess({ response })),
          catchError((err) => {
            const error = err?.error?.message ?? 'Sign up failed. Please try again.';
            return of(AuthActions.signUpFailure({ error }));
          })
        )
      )
    ),
  { functional: true }
);

export const googleSignUpEffect = createEffect(
  (actions$ = inject(Actions), api = inject(ApiService)) =>
    actions$.pipe(
      ofType(AuthActions.googleSignUp),
      switchMap(({ token }) =>
        api.post<SignUpResponse>('/auth/google', { token }).pipe(
          map((response) => AuthActions.googleSignUpSuccess({ response })),
          catchError((err) => {
            const error = err?.error?.message ?? 'Google sign up failed. Please try again.';
            return of(AuthActions.googleSignUpFailure({ error }));
          })
        )
      )
    ),
  { functional: true }
);

export const signUpSuccessEffect = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(AuthActions.signUpSuccess, AuthActions.googleSignUpSuccess),
      tap(() => router.navigate(['/auth/login']))
    ),
  { functional: true, dispatch: false }
);

export const loginEffect = createEffect(
  (actions$ = inject(Actions), api = inject(ApiService)) =>
    actions$.pipe(
      ofType(AuthActions.loginRequest),
      switchMap(({ payload }) =>
        api.post<LoginResponse>('/auth/login', { email: payload.email, password: payload.password }).pipe(
          map((res) => {
            const user: User = { id: res.user.id, name: res.user.name, email: res.user.email, token: res.token, refreshToken: res.refreshToken };
            return AuthActions.loginSuccess({ user });
          }),
          catchError((err) => {
            const error = err?.error?.message ?? 'Login failed. Please check your credentials.';
            return of(AuthActions.loginFailure({ error }));
          })
        )
      )
    ),
  { functional: true }
);

export const googleLoginEffect = createEffect(
  (actions$ = inject(Actions), api = inject(ApiService)) =>
    actions$.pipe(
      ofType(AuthActions.googleLoginRequest),
      switchMap(({ token }) =>
        api.post<LoginResponse>('/auth/google/login', { token }).pipe(
          map((res) => {
            const user: User = { id: res.user.id, name: res.user.name, email: res.user.email, token: res.token, refreshToken: res.refreshToken };
            return AuthActions.googleLoginSuccess({ user });
          }),
          catchError((err) => {
            const error = err?.error?.message ?? 'Google login failed. Please try again.';
            return of(AuthActions.googleLoginFailure({ error }));
          })
        )
      )
    ),
  { functional: true }
);

export const loginSuccessEffect = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) =>
    actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.googleLoginSuccess),
      tap(() => router.navigate(['/']))
    ),
  { functional: true, dispatch: false }
);
