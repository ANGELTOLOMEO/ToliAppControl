import { Injectable, inject } from '@angular/core';
import { Observable, map, forkJoin, of } from 'rxjs';
import { ApiService } from './api.service';
import { Pedido } from '../models';

/**
 * PedidosService - Servicio para gestionar pedidos
 * Provee métodos para obtener estadísticas y listados de pedidos
 */
@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private readonly api = inject(ApiService);

  /**
   * Obtiene la fecha de hoy en formato ISO (solo fecha)
   */
  private getFechaHoy(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  }

  /**
   * Obtiene el primer día del mes actual en formato ISO
   */
  private getPrimerDiaMes(): string {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
  }

  /**
   * Cuenta los pedidos creados hoy
   */
  contarPedidosHoy(): Observable<number> {
    const fechaHoy = this.getFechaHoy();
    return this.api.get<Pedido[]>('pedidos', { fecha: fechaHoy }).pipe(
      map(response => response.data?.length ?? 0)
    );
  }

  /**
   * Obtiene los pedidos creados hoy
   */
  getPedidosHoy(): Observable<Pedido[]> {
    const fechaHoy = this.getFechaHoy();
    return this.api.get<Pedido[]>('pedidos', { fecha: fechaHoy }).pipe(
      map(response => response.data ?? [])
    );
  }

  /**
   * Obtiene los pedidos recientes (últimos 10)
   */
  getRecientes(limite: number = 10): Observable<Pedido[]> {
    // El backend debe soportar order_by y limit
    return this.api.get<Pedido[]>('pedidos', { 
      sort: '-creado_en', 
      limit: limite 
    }).pipe(
      map(response => response.data ?? [])
    );
  }

  /**
   * Obtiene los pedidos confirmados del mes actual
   * Calcula la suma de los totales
   */
  getIngresosMes(): Observable<number> {
    const primerDiaMes = this.getPrimerDiaMes();
    // Obtenemos todos los pedidos confirmados desde el primer día del mes
    return this.api.get<Pedido[]>('pedidos', { 
      estado_pedido: 'confirmado',
      fecha_desde: primerDiaMes
    }).pipe(
      map(response => {
        const pedidos = response.data ?? [];
        return pedidos.reduce((sum, pedido) => sum + (pedido.total ?? 0), 0);
      })
    );
  }

  /**
   * Obtiene los pedidos pendientes
   */
  getPendientes(): Observable<Pedido[]> {
    return this.api.get<Pedido[]>('pedidos', { estado_pedido: 'pendiente' }).pipe(
      map(response => response.data ?? [])
    );
  }

  /**
   * Cuenta los pedidos pendientes
   */
  contarPendientes(): Observable<number> {
    return this.api.get<Pedido[]>('pedidos', { estado_pedido: 'pendiente' }).pipe(
      map(response => response.data?.length ?? 0)
    );
  }

  /**
   * Obtiene un pedido por ID
   */
  getById(id: string): Observable<Pedido | null> {
    return this.api.get<Pedido>(`pedidos/${id}`).pipe(
      map(response => response.data ?? null)
    );
  }

  /**
   * Lista pedidos con filtros opcionales
   */
  list(params?: Record<string, string | number>): Observable<Pedido[]> {
    return this.api.get<Pedido[]>('pedidos', params).pipe(
      map(response => response.data ?? [])
    );
  }

  /**
   * Obtiene estadísticas completas del dashboard
   */
  getEstadisticas(): Observable<{
    pedidosHoy: number;
    ingresosMes: number;
    recientes: Pedido[];
  }> {
    return forkJoin({
      pedidosHoy: this.contarPedidosHoy(),
      ingresosMes: this.getIngresosMes(),
      recientes: this.getRecientes(10)
    });
  }
}
