import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Producto } from '../models';

/**
 * ProductosService - Servicio para gestionar productos
 * Provee métodos para contar productos activos y obtener listados
 */
@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private readonly api = inject(ApiService);

  /**
   * Cuenta los productos activos
   */
  contarActivos(): Observable<number> {
    return this.api
      .get<Producto[]>('productos', { activo: 'true' })
      .pipe(map((response) => response.data?.length ?? 0));
  }

  /**
   * Obtiene todos los productos activos
   */
  getActivos(): Observable<Producto[]> {
    return this.api
      .get<Producto[]>('productos', { activo: 'true' })
      .pipe(map((response) => response.data ?? []));
  }

  /**
   * Obtiene un producto por ID
   */
  getById(id: string): Observable<Producto | null> {
    return this.api.get<Producto>(`productos/${id}`).pipe(map((response) => response.data ?? null));
  }
}
