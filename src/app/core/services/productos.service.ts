import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { Producto } from '../models';
import { environment } from '../../../environments/environment';

/**
 * ProductosService - Servicio para gestionar productos
 * Provee métodos para contar productos activos y obtener listados
 */
@Injectable({
  providedIn: 'root',
})
export class ProductosService {
  private readonly api = inject(ApiService);

  private extractList(response: any): any[] {
    const list = response?.data ?? response?.productos ?? response?.items ?? [];
    return Array.isArray(list) ? list : [];
  }

  private extractOne(response: any): any | null {
    return response?.data ?? response?.producto ?? response?.item ?? response ?? null;
  }

  private buildProductoPayload(payload: Partial<Producto>): Record<string, unknown> {
    const categoriaTexto =
      payload.categoria?.trim() ||
      payload.categoria_nombre?.trim() ||
      (typeof payload.categoria_id === 'string' ? payload.categoria_id.trim() : undefined) ||
      undefined;
    const precioNumero = typeof payload.precio === 'number' ? payload.precio : Number(payload.precio);

    const body: Record<string, unknown> = {
      nombre: payload.nombre?.trim(),
      descripcion: payload.descripcion,
      precio: Number.isFinite(precioNumero) ? precioNumero : undefined,
      precio_mayor: payload.precio_mayor,
      cantidad_minimaMayor: payload.cantidad_minimaMayor,
      categoria: categoriaTexto,
      categoria_id: payload.categoria_id,
      categoria_nombre: categoriaTexto,
      stock: payload.stock,
      sku: payload.sku,
      activo: payload.activo,
      imagen: this.normalizeUrl(payload.imagen)
    };

    Object.keys(body).forEach((key) => {
      const value = body[key];
      if (value === undefined || value === null || value === '') {
        delete body[key];
      }
    });

    return body;
  }

  private validateCreatePayload(body: Record<string, unknown>): void {
    const nombre = typeof body['nombre'] === 'string' ? body['nombre'].trim() : '';
    const categoria = typeof body['categoria'] === 'string' ? body['categoria'].trim() : '';
    const precio = typeof body['precio'] === 'number' ? body['precio'] : Number(body['precio']);

    if (!nombre || !categoria || !Number.isFinite(precio) || precio <= 0) {
      throw new Error('Nombre, precio y categoria son requeridos');
    }
  }

  private withAlternativeCrudPayload<T>(
    request: (body: Record<string, unknown>) => Observable<T>,
    body: Record<string, unknown>
  ): Observable<T> {
    return request(body).pipe(
      catchError((error) => {
        const altBody: Record<string, unknown> = {
          producto: body,
          ...body,
          categoria_nombre: body['categoria_nombre'] ?? body['categoria'],
          categoria: body['categoria'] ?? body['categoria_nombre']
        };
        return request(altBody).pipe(
          catchError(() => throwError(() => error))
        );
      })
    );
  }

  private normalizeUrl(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim().replace(/`/g, '').trim();
    if (!trimmed.length) return null;

    const uploadsIndex = trimmed.indexOf('/uploads/');
    if (uploadsIndex !== -1) {
      try {
        const apiOrigin = new URL(environment.API_URL).origin;
        const path = trimmed.slice(uploadsIndex);
        return `${apiOrigin}${path}`;
      } catch {
        return trimmed;
      }
    }

    return trimmed;
  }

  private mapProducto(raw: any): Producto {
    const precio = typeof raw?.precio === 'number' ? raw.precio : Number(raw?.precio);
    const categoriaObj = raw?.categoria && typeof raw.categoria === 'object' ? raw.categoria : null;
    const categoriaNombre =
      raw?.categoria_nombre ??
      (typeof raw?.categoria === 'string' ? raw.categoria : undefined) ??
      categoriaObj?.nombre ??
      undefined;
    const categoriaId = raw?.categoria_id ?? categoriaObj?.id ?? undefined;
    const stockNumero = typeof raw?.stock === 'number' ? raw.stock : Number(raw?.stock);

    return {
      id: String(raw?.id ?? ''),
      nombre: String(raw?.nombre ?? ''),
      descripcion: raw?.descripcion ?? undefined,
      precio: Number.isFinite(precio) ? precio : 0,
      categoria: categoriaNombre,
      stock: Number.isFinite(stockNumero) ? stockNumero : 0,
      imagen: this.normalizeUrl(raw?.imagen),
      sku: raw?.sku ?? undefined,
      categoria_id: categoriaId,
      categoria_nombre: categoriaNombre,
      activo: raw?.activo ?? undefined,
      precio_mayor: raw?.precio_mayor ?? undefined,
      cantidad_minimaMayor: raw?.cantidad_minimaMayor ?? undefined
    };
  }

  /**
   * Cuenta los productos activos
   */
  contarActivos(): Observable<number> {
    return this.getAll({ activo: 'true' }).pipe(map((list) => list.length));
  }

  /**
   * Obtiene todos los productos activos
   */
  getActivos(): Observable<Producto[]> {
    return this.getAll({ activo: 'true' });
  }

  /**
   * Obtiene todos los productos (con filtros opcionales)
   */
  getAll(params?: Record<string, string | number>): Observable<Producto[]> {
    return this.api.get<any>('productos', params).pipe(
      map((response: any) => {
        const list = this.extractList(response);
        return list.map((p) => this.mapProducto(p));
      })
    );
  }

  /**
   * Obtiene un producto por ID
   */
  getById(id: string): Observable<Producto | null> {
    return this.api.get<any>(`productos/${id}`).pipe(
      map((response: any) => {
        const raw = this.extractOne(response);
        if (!raw) return null;
        return this.mapProducto(raw);
      })
    );
  }

  /**
   * Crea un producto
   */
  create(payload: Partial<Producto>): Observable<Producto | null> {
    const body = this.buildProductoPayload(payload);
    this.validateCreatePayload(body);
    return this.withAlternativeCrudPayload((requestBody) => this.api.post<any>('productos', requestBody), body).pipe(
      map((response: any) => {
        const raw = this.extractOne(response);
        if (!raw) return null;
        return this.mapProducto(raw);
      })
    );
  }

  /**
   * Actualiza un producto por ID
   */
  update(id: string, payload: Partial<Producto>): Observable<Producto | null> {
    const body = this.buildProductoPayload(payload);
    return this.withAlternativeCrudPayload((requestBody) => this.api.put<any>(`productos/${id}`, requestBody), body).pipe(
      map((response: any) => {
        const raw = this.extractOne(response);
        if (!raw) return null;
        return this.mapProducto(raw);
      })
    );
  }

  /**
   * Alias CRUD explicitos para uso directo
   */
  get(params?: Record<string, string | number>): Observable<Producto[]> {
    return this.getAll(params);
  }

  post(payload: Partial<Producto>): Observable<Producto | null> {
    return this.create(payload);
  }

  put(id: string, payload: Partial<Producto>): Observable<Producto | null> {
    return this.update(id, payload);
  }

  /**
   * Elimina un producto por ID
   */
  delete(id: string): Observable<boolean> {
    return this.api.delete<unknown>(`productos/${id}`).pipe(map(() => true));
  }
}
