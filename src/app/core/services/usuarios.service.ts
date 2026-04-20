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

  /**
   * Cuenta los usuarios activos
   */
  contarActivos(): Observable<number> {
    return this.api
      .get<Usuario[]>('usuarios', { activo: 'true' })
      .pipe(map((response) => response.data?.length ?? 0));
  }

  /**
   * Obtiene todos los usuarios activos
   */
  getActivos(): Observable<Usuario[]> {
    return this.api
      .get<Usuario[]>('usuarios', { activo: 'true' })
      .pipe(map((response) => response.data ?? []));
  }

  /**
   * Obtiene un usuario por ID
   */
  getById(id: string): Observable<Usuario | null> {
    return this.api.get<Usuario>(`usuarios/${id}`).pipe(map((response) => response.data ?? null));
  }
}
