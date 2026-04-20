import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

const TOKEN_KEY = 'toli_token';

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

  // Si hay token, añadir header Authorization
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // Si no hay token, continuar sin modificar
  return next(req);
};