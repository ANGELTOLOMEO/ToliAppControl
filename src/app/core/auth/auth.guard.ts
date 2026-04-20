import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Tipos de datos para la configuración de roles en rutas
 */
export interface RoleGuardConfig {
  allowRoles?: string[];
  allowPrefixes?: string[];
}

/**
 * AuthGuard - Protege rutas que requieren autenticación
 * Implementación como CanActivate functional (Angular 17+)
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está logueado (llamando al signal)
  if (authService.loggedIn()) {
    return true;
  }

  // No está logueado, redirigir a login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};

/**
 * GuestGuard - Protege rutas que solo deben ser accesadas por usuarios NO logueados
 * Ejemplo: página de login, registro
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si ya está logueado, redirigir al dashboard (llamando al signal)
  if (authService.loggedIn()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

/**
 * RoleGuard - Protege rutas que requieren roles específicos
 *
 * Uso en rutas:
 * {
 *   path: 'usuarios',
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: { allowRoles: ['ADMIN'] } }
 * }
 *
 * También soporta prefijos:
 * {
 *   path: 'pedidos',
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: { allowPrefixes: ['VENTAS', 'OPERACIONES', 'FINANZAS'] } }
 * }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtener configuración de roles desde route.data
  const config: RoleGuardConfig = route.data['roles'] || {};
  const allowRoles = config.allowRoles || [];
  const allowPrefixes = config.allowPrefixes || [];

  // Si no hay restricciones de rol, permitir acceso
  if (allowRoles.length === 0 && allowPrefixes.length === 0) {
    return true;
  }

  // Verificar rol exacto
  if (allowRoles.length > 0 && authService.hasAnyRole(allowRoles)) {
    return true;
  }

  // Verificar prefijo de rol
  if (allowPrefixes.length > 0) {
    for (const prefix of allowPrefixes) {
      if (authService.hasRolePrefix(prefix)) {
        return true;
      }
    }
  }

  // El usuario no tiene el rol requerido, redirigir a dashboard
  router.navigate(['/dashboard']);
  return false;
};
