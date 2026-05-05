import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Usuario } from '../models';

/**
 * UsuariosService - Servicio para gestionar usuarios
 * Provee métodos para contar usuarios activos y obtener listados
 */
@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private readonly api = inject(ApiService);

  private buildUsuarioPayload(payload: Partial<Usuario> & { password?: string }): Record<string, unknown> {
    const body: Record<string, unknown> = {
      nombre: payload.nombre?.trim(),
      email: payload.email?.trim(),
      telefono: payload.telefono,
      dni: payload.dni,
      ruc: payload.ruc,
      rol: payload.rol,
      activo: payload.activo
    };

    const password = payload.password?.trim();
    if (password) {
      body['password'] = password;
    }

    Object.keys(body).forEach((key) => {
      const value = body[key];
      if (value === undefined || value === null || value === '') {
        delete body[key];
      }
    });

    return body;
  }

  getAll(params?: Record<string, string | number>): Observable<Usuario[]> {
    return this.api.get<any>('admin/usuarios', params).pipe(
      map((response: any) => {
        const list = response?.data ?? response?.usuarios ?? response ?? [];
        if (!Array.isArray(list)) return [];
        return list.map((u) => this.mapUsuario(u));
      })
    );
  }

  private mapUsuario(raw: any): Usuario {
    return {
      id: String(raw?.id ?? ''),
      nombre: String(raw?.nombre ?? ''),
      email: String(raw?.email ?? ''),
      telefono: raw?.telefono ?? null,
      dni: raw?.dni ?? null,
      ruc: raw?.ruc ?? null,
      rol: String(raw?.rol ?? ''),
      activo: Boolean(raw?.activo),
      creado_en: String(raw?.creado_en ?? ''),
      ultimo_login: raw?.ultimo_login ?? null
    };
  }

  /**
   * Cuenta los usuarios activos
   */
  contarActivos(): Observable<number> {
    return this.getAll({ activo: 'true' }).pipe(map((list) => list.length));
  }

  /**
   * Obtiene todos los usuarios activos
   */
  getActivos(): Observable<Usuario[]> {
    return this.getAll({ activo: 'true' });
  }

  /**
   * Obtiene un usuario por ID
   */
  getById(id: string): Observable<Usuario | null> {
    return this.api.get<any>(`admin/usuarios/${id}`).pipe(
      map((response: any) => {
        const raw = response?.data ?? response?.usuario ?? response ?? null;
        if (!raw) return null;
        return this.mapUsuario(raw);
      })
    );
  }

  create(payload: Partial<Usuario> & { password?: string }): Observable<Usuario | null> {
    return this.api.post<any>('admin/usuarios', this.buildUsuarioPayload(payload)).pipe(
      map((response: any) => {
        const raw = response?.data ?? response?.usuario ?? response ?? null;
        if (!raw) return null;
        return this.mapUsuario(raw);
      })
    );
  }

  update(id: string, payload: Partial<Usuario> & { password?: string }): Observable<Usuario | null> {
    return this.api.put<any>(`admin/usuarios/${id}`, this.buildUsuarioPayload(payload)).pipe(
      map((response: any) => {
        const raw = response?.data ?? response?.usuario ?? response ?? null;
        if (!raw) return null;
        return this.mapUsuario(raw);
      })
    );
  }

  delete(id: string): Observable<boolean> {
    return this.api.delete<unknown>(`admin/usuarios/${id}`).pipe(map(() => true));
  }
}
