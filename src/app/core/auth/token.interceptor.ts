import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

const AUTH_BYPASS_PATHS = ['/auth/login', '/auth/refresh'];

/**
 * TokenInterceptor - Añade el token JWT a todas las peticiones HTTP
 * Implementación como HttpInterceptor functional (Angular 17+)
 */
export const tokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const shouldBypass = AUTH_BYPASS_PATHS.some((path) => req.url.includes(path));

  if (shouldBypass) {
    return next(req);
  }

  // Si hay token, añadir header Authorization
  const requestWithAuth = token
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
    : req;

  return next(requestWithAuth).pipe(
    catchError((error) => {
      if (error?.status === 401 && token) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
