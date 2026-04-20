import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, of, catchError, map, pipe } from 'rxjs';
import { ApiService } from '../services/api.service';
import { Usuario, AuthResponse, LoginResponse } from '../models';
import { isPlatformBrowser } from '@angular/common';

const TOKEN_KEY = 'toli_token';
const USER_KEY = 'toli_user';

/**
 * AuthService - Manejo de autenticación en el Web Admin TOLI
 * Provee métodos para login, logout, gestión de token y usuario
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private initialized = false;

  // Signal para el usuario actual (inicializar lazy para SSR)
  private readonly _currentUser = signal<Usuario | null>(null);
  private readonly _isLoggedIn = signal<boolean>(false);

  // Inicializar solo en browser
  private initIfBrowser(): void {
    if (this.initialized || !isPlatformBrowser(this.platformId)) return;

    this._currentUser.set(this.getStoredUserFromLS());
    this._isLoggedIn.set(this.hasValidTokenInLS());
    this.initialized = true;
  }

  // Getters públicos como signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly loggedIn = this._isLoggedIn.asReadonly();

  /**
   * Realiza el login con email y password
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @returns Observable con la respuesta de autenticación
   */
  login(email: string, password: string): Observable<LoginResponse> {
    this.initIfBrowser(); // Inicializar antes de login en SSR

    // El backend devuelve { usuario, token } directamente (sin wrapper data)
    return this.api.post<LoginResponse>('auth/login', { email, password }).pipe(
      map((response: any) => {
        // El backend devuelve { usuario, token } pero el ApiService envuelve en ApiResponse
        // response = { data: { usuario, token } } o { data: undefined, error: ... }
        // El HttpClient hace parse automático, así que response es el body directo

        // Extraer data del wrapper ApiResponse
        const loginData = (response as any).data || response;

        if (!loginData?.token) {
          throw new Error((response as any).error || 'Login failed');
        }
        this.saveToken(loginData.token);
        this.saveUser(loginData.usuario);
        this._currentUser.set(loginData.usuario);
        this._isLoggedIn.set(true);
        return loginData as LoginResponse;
      }),
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      }),
    );
  }

  /**
   * Cierra la sesión del usuario
   * Limpia el token y usuario del localStorage
   */
  logout(): void {
    this.clearToken();
    this.clearUser();
    this._currentUser.set(null);
    this._isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  /**
   * Retorna el usuario actual
   * @returns Usuario o null si no está logueado
   */
  getUser(): Usuario | null {
    return this._currentUser();
  }

  /**
   * Verifica si el usuario está logueado
   * @deprecated Usar el signal loggedIn() directamente
   * @returns true si hay un token válido
   */
  checkAuthStatus(): boolean {
    return this._isLoggedIn();
  }

  /**
   * Obtiene el token del localStorage
   * @returns Token string o null
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Guarda el token en localStorage
   * @param token - Token JWT a guardar
   */
  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this._isLoggedIn.set(true);
  }

  /**
   * Limpia el token del localStorage
   */
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  /**
   * Guarda el usuario en localStorage
   * @param usuario - Usuario a guardar
   */
  private saveUser(usuario: Usuario): void {
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  }

  /**
   * Obtiene el usuario almacenado
   * @returns Usuario o null
   */
  private getStoredUserFromLS(): Usuario | null {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  private hasValidTokenInLS(): boolean {
    return !!this.getToken();
  }

  /**
   * Limpia el usuario del localStorage
   */
  private clearUser(): void {
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Verifica si existe un token válido
   * @returns true si el token existe
   */
  private hasValidToken(): boolean {
    return !!this.getToken();
  }

  // ============================================
  // MÉTODOS DE VERIFICACIÓN DE ROLES
  // ============================================

  /**
   * Lista de roles válidos en el sistema
   */
  static readonly ROLES = {
    ADMIN: 'ADMIN',
    OPERACIONES_INVENTARIO: 'OPERACIONES_INVENTARIO',
    OPERACIONES_LOGISTICA: 'OPERACIONES_LOGISTICA',
    VENTAS_LOCAL: 'VENTAS_LOCAL',
    VENTAS_ONLINE: 'VENTAS_ONLINE',
    FINANZAS_COBRANZAS: 'FINANZAS_COBRANZAS',
    FINANZAS_CONTABILIDAD: 'FINANZAS_CONTABILIDAD',
    CLIENTE: 'CLIENTE',
  } as const;

  /**
   * Verifica si el usuario tiene un rol específico
   * @param rol - Rol a verificar
   * @returns true si el usuario tiene el rol
   */
  hasRole(rol: string): boolean {
    const user = this.getUser();
    if (!user) return false;
    return user.rol === rol;
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * @param roles - Lista de roles a verificar
   * @returns true si el usuario tiene alguno de los roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getUser();
    if (!user) return false;
    return roles.includes(user.rol);
  }

  /**
   * Verifica si el usuario tiene un rol que comienza con el prefijo dado
   * Útil para roles como VENTAS_*, OPERACIONES_*, FINANZAS_*
   * @param prefix - Prefijo del rol (ej: 'VENTAS', 'OPERACIONES', 'FINANZAS')
   * @returns true si el rol del usuario comienza con el prefijo
   */
  hasRolePrefix(prefix: string): boolean {
    const user = this.getUser();
    if (!user) return false;
    return user.rol.startsWith(prefix);
  }

  /**
   * Obtiene el rol del usuario actual
   * @returns Rol del usuario o null
   */
  getRol(): string | null {
    const user = this.getUser();
    return user?.rol ?? null;
  }

  /**
   * Verifica si el usuario es ADMIN
   * @returns true si es ADMIN
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }
}
