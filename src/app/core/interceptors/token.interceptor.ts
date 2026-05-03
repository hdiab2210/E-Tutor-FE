import { inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

const REFRESH_URL = 'http://localhost:3000/api/auth/refresh-token';

// Module-level state shared across all interceptor calls (one refresh at a time)
let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

function cloneWithToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function handle401(
  original: HttpRequest<unknown>,
  next: HttpHandlerFn,
  http: HttpClient,
  auth: AuthService,
  router: Router,
) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshSubject.next(null);

    const refreshToken = auth.getRefreshToken();

    if (!refreshToken) {
      isRefreshing = false;
      auth.logout();
      router.navigate(['/auth/login']);
      return throwError(() => new Error('Session expired. Please log in again.'));
    }

    return http
      .post<{ token: string; refreshToken: string }>(REFRESH_URL, { refreshToken })
      .pipe(
        switchMap((res) => {
          isRefreshing = false;
          refreshSubject.next(res.token);
          auth.updateTokens(res.token, res.refreshToken);
          return next(cloneWithToken(original, res.token));
        }),
        catchError((err) => {
          isRefreshing = false;
          auth.logout();
          router.navigate(['/auth/login']);
          return throwError(() => err);
        }),
      );
  }

  // Another request is already refreshing — wait for the new token, then retry
  return refreshSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(cloneWithToken(original, token))),
  );
}

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const http = inject(HttpClient);
  const router = inject(Router);

  // Never intercept the refresh endpoint itself (prevents infinite loops)
  if (req.url.includes('/auth/refresh-token')) {
    return next(req);
  }

  const token = auth.getToken();
  const authReq = token ? cloneWithToken(req, token) : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401(req, next, http, auth, router);
      }
      return throwError(() => error);
    }),
  );
};
