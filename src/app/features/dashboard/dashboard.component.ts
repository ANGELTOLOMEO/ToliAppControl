import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { UsuariosService } from '../../core/services/usuarios.service';
import { PedidosService } from '../../core/services/pedidos.service';
import { ProductosService } from '../../core/services/productos.service';
import { Pedido } from '../../core/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RevenueStreamWidget } from './revenue-stream-widget.component';

/**
 * DashboardComponent - Panel principal del Web Admin TOLI
 * Fase 4: Dashboard con KPIs, pedidos recientes y acciones rápidas
 * 
 * Características:
 * - 4 tarjetas de estadísticas (KPIs)
 * - Tabla de pedidos recientes (máx 10)
 * - Acciones rápidas
 * - Uso de señales (signals) para estado reactivo
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    DatePipe,
    CurrencyPipe,
    RevenueStreamWidget
  ],
  template: `
    <div class="dashboard-container">
      <!-- Título de la página -->
      <header class="dashboard-header">
        <h1>Dashboard</h1>
        <p class="subtitle">Resumen general de tu tienda TOLI</p>
      </header>

      <!-- Grid de 4 tarjetas KPI -->
      <div class="kpi-grid">
        <!-- KPI: Usuarios Activos -->
        <mat-card class="kpi-card kpi-usuarios">
          <mat-card-content>
            <div class="kpi-icon">
              <mat-icon>people</mat-icon>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Usuarios Activos</span>
              <span class="kpi-value">{{ usuariosActivos() }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- KPI: Pedidos Hoy -->
        <mat-card class="kpi-card kpi-pedidos-hoy">
          <mat-card-content>
            <div class="kpi-icon">
              <mat-icon>shopping_cart</mat-icon>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Pedidos Hoy</span>
              <span class="kpi-value">{{ pedidosHoy() }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- KPI: Productos Activos -->
        <mat-card class="kpi-card kpi-productos">
          <mat-card-content>
            <div class="kpi-icon">
              <mat-icon>inventory_2</mat-icon>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Productos Activos</span>
              <span class="kpi-value">{{ productosActivos() }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- KPI: Ingresos del Mes -->
        <mat-card class="kpi-card kpi-ingresos">
          <mat-card-content>
            <div class="kpi-icon">
              <mat-icon>attach_money</mat-icon>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">Ingresos del Mes</span>
              <span class="kpi-value">{{ ingresosMes() | currency:'PEN':'S/ ' }}</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Loading indicator -->
      @if (cargando()) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Cargando estadísticas...</p>
        </div>
      }

      <!-- Contenido principal: Dos columnas -->
      @if (!cargando()) {
        <div class="main-content">
          <!-- Columna izquierda: Tabla de pedidos recientes -->
          <div class="columna-pedidos">
            <mat-card class="table-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>receipt_long</mat-icon>
                  Pedidos Recientes
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                @if (pedidosRecientes().length > 0) {
                  <table mat-table [dataSource]="pedidosRecientes()" class="pedidos-table">
                    
                    <!-- Columna: Número de Pedido -->
                    <ng-container matColumnDef="numero_pedido">
                      <th mat-header-cell *matHeaderCellDef>N° Pedido</th>
                      <td mat-cell *matCellDef="let pedido">
                        <a [routerLink]="['/pedidos', pedido.id]" class="pedido-link">
                          {{ pedido.numero_pedido }}
                        </a>
                      </td>
                    </ng-container>

                    <!-- Columna: Cliente -->
                    <ng-container matColumnDef="cliente">
                      <th mat-header-cell *matHeaderCellDef>Cliente</th>
                      <td mat-cell *matCellDef="let pedido">
                        {{ pedido.usuario_id }}
                      </td>
                    </ng-container>

                    <!-- Columna: Total -->
                    <ng-container matColumnDef="total">
                      <th mat-header-cell *matHeaderCellDef>Total</th>
                      <td mat-cell *matCellDef="let pedido">
                        {{ pedido.total | currency:'PEN':'S/ ' }}
                      </td>
                    </ng-container>

                    <!-- Columna: Estado -->
                    <ng-container matColumnDef="estado">
                      <th mat-header-cell *matHeaderCellDef>Estado</th>
                      <td mat-cell *matCellDef="let pedido">
                        <mat-chip [class]="'estado-chip estado-' + pedido.estado_pedido">
                          {{ getEstadoLabel(pedido.estado_pedido) }}
                        </mat-chip>
                      </td>
                    </ng-container>

                    <!-- Columna: Fecha -->
                    <ng-container matColumnDef="fecha">
                      <th mat-header-cell *matHeaderCellDef>Fecha</th>
                      <td mat-cell *matCellDef="let pedido">
                        {{ pedido.creado_en | date:'dd/MM/yyyy HH:mm' }}
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                  </table>
                } @else {
                  <div class="no-data">
                    <mat-icon>inbox</mat-icon>
                    <p>No hay pedidos recientes</p>
                  </div>
                }
              </mat-card-content>
            </mat-card>

            <app-revenue-stream-widget></app-revenue-stream-widget>
          </div>

          <!-- Columna derecha: Acciones rápidas -->
          <div class="columna-acciones">
            <mat-card class="acciones-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>flash_on</mat-icon>
                  Acciones Rápidas
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="acciones-buttons">
                  <button mat-raised-button color="primary" routerLink="/productos/nuevo" class="accion-btn">
                    <mat-icon>add_box</mat-icon>
                    Nuevo Producto
                  </button>
                  
                  <button mat-raised-button color="accent" routerLink="/usuarios/nuevo" class="accion-btn">
                    <mat-icon>person_add</mat-icon>
                    Nuevo Usuario
                  </button>
                  
                  <button mat-raised-button color="warn" routerLink="/pedidos" [queryParams]="{estado: 'pendiente'}" class="accion-btn">
                    <mat-icon>pending_actions</mat-icon>
                    Ver Pedidos Pendientes
                    @if (pedidosPendientes() > 0) {
                      <span class="badge">{{ pedidosPendientes() }}</span>
                    }
                  </button>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Información adicional -->
            <mat-card class="info-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>info</mat-icon>
                  Información
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <ul class="info-list">
                  <li>
                    <mat-icon>check_circle</mat-icon>
                    <span>Sistema operativo</span>
                  </li>
                  <li>
                    <mat-icon>local_shipping</mat-icon>
                    <span>Gestión de envíos activa</span>
                  </li>
                  <li>
                    <mat-icon>payment</mat-icon>
                    <span>Pagos configurados</span>
                  </li>
                </ul>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    /* ============================================
       ESTILOS DEL DASHBOARD
       ============================================ */
    .dashboard-container {
      padding: 0;
      max-width: 1400px;
      margin: 0 auto;
      color: var(--text-primary, #0f172a);
    }

    /* Header */
    .dashboard-header {
      margin-bottom: 24px;
    }

    .dashboard-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      letter-spacing: -0.02em;
    }

    .subtitle {
      margin: 4px 0 0;
      color: var(--text-secondary, #64748b);
      font-size: 14px;
    }

    /* ============================================
       GRID DE 4 TARJETAS KPI
       ============================================ */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    /* Responsive: 2 columnas en tablet */
    @media (max-width: 1024px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    /* Responsive: 1 columna en móvil */
    @media (max-width: 600px) {
      .kpi-grid {
        grid-template-columns: 1fr;
      }
    }

    .kpi-card {
      border-radius: 16px;
      border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 18px 48px rgba(15, 23, 42, 0.14);
    }

    .kpi-card mat-card-content {
      display: flex;
      align-items: center;
      padding: 20px;
      gap: 16px;
    }

    .kpi-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .kpi-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    /* Colores por tipo de KPI */
    .kpi-usuarios .kpi-icon {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .kpi-pedidos-hoy .kpi-icon {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .kpi-productos .kpi-icon {
      background-color: #e8f5e9;
      color: #388e3c;
    }

    .kpi-ingresos .kpi-icon {
      background-color: #fce4ec;
      color: #c2185b;
    }

    .kpi-info {
      display: flex;
      flex-direction: column;
    }

    .kpi-label {
      font-size: 13px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .kpi-value {
      font-size: 28px;
      font-weight: 600;
      color: #0f172a;
    }

    /* ============================================
       LOADING
       ============================================ */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: var(--text-secondary, #64748b);
    }

    .loading-container p {
      margin-top: 16px;
    }

    /* ============================================
       CONTENIDO PRINCIPAL: DOS COLUMNAS
       ============================================ */
    .main-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    /* Responsive: Una columna en tablet/móvil */
    @media (max-width: 900px) {
      .main-content {
        grid-template-columns: 1fr;
      }
    }

    /* ============================================
       TABLA DE PEDIDOS RECIENTES
       ============================================ */
    .columna-pedidos {
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-width: 0; /* Previene overflow en grid */
    }

    .table-card mat-card-header {
      margin-bottom: 16px;
    }

    .table-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 500;
    }

    .table-card mat-card-title mat-icon {
      color: #666;
    }

    .pedidos-table {
      width: 100%;
    }

    .pedidos-table th {
      background-color: rgba(15, 23, 42, 0.04);
      font-weight: 600;
      color: var(--text-primary, #0f172a);
    }

    .pedidos-table td {
      font-size: 14px;
    }

    .pedido-link {
      color: #1976d2;
      text-decoration: none;
      font-weight: 500;
    }

    .pedido-link:hover {
      text-decoration: underline;
    }

    /* Chips de estado */
    .estado-chip {
      font-size: 12px;
      min-height: 24px;
      padding: 0 8px;
    }

    .estado-confirmado {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
    }

    .estado-pendiente {
      background-color: #fff3e0 !important;
      color: #f57c00 !important;
    }

    .estado-cancelado {
      background-color: #ffebee !important;
      color: #c62828 !important;
    }

    .estado-procesando {
      background-color: #e3f2fd !important;
      color: #1565c0 !important;
    }

    .estado-entregado {
      background-color: #f3e5f5 !important;
      color: #7b1fa2 !important;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: #999;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }

    /* ============================================
       ACCIONES RÁPIDAS
       ============================================ */
    .columna-acciones {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .acciones-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 500;
    }

    .acciones-card mat-card-title mat-icon {
      color: #ff9800;
    }

    .acciones-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .accion-btn {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      padding: 12px 16px;
      text-align: left;
    }

    .accion-btn mat-icon {
      margin-right: 4px;
    }

    .badge {
      background-color: #f44336;
      color: white;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 600;
      margin-left: auto;
    }

    /* Tarjeta de información */
    .info-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 500;
    }

    .info-card mat-card-title mat-icon {
      color: #2196f3;
    }

    .info-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .info-list li {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      color: #666;
      font-size: 14px;
    }

    .info-list li mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #4caf50;
    }
  `]
})
export class DashboardComponent implements OnInit {
  // ============================================
  // SERVICIOS
  // ============================================
  private readonly usuariosService = inject(UsuariosService);
  private readonly pedidosService = inject(PedidosService);
  private readonly productosService = inject(ProductosService);
  private readonly destroyRef = inject(DestroyRef);

  // ============================================
  // SEÑALES (Signals) - Estado Reactivo
  // ============================================
  
  // KPIs
  protected readonly usuariosActivos = signal<number>(0);
  protected readonly pedidosHoy = signal<number>(0);
  protected readonly productosActivos = signal<number>(0);
  protected readonly ingresosMes = signal<number>(0);
  protected readonly pedidosPendientes = signal<number>(0);

  // Datos
  protected readonly pedidosRecientes = signal<Pedido[]>([]);

  // Estado de carga
  protected readonly cargando = signal<boolean>(true);

  // Columnas para la tabla
  protected readonly displayedColumns = ['numero_pedido', 'cliente', 'total', 'estado', 'fecha'];

  // ============================================
  // CICLO DE VIDA
  // ============================================
  
  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  // ============================================
  // MÉTODOS
  // ============================================

  /**
   * Carga todas las estadísticas del dashboard
   */
  private cargarEstadisticas(): void {
    this.cargando.set(true);

    // Cargar usuarios activos
    this.usuariosService.contarActivos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (count) => this.usuariosActivos.set(count),
      error: () => this.usuariosActivos.set(0)
    });

    // Cargar pedidos de hoy
    this.pedidosService.contarPedidosHoy().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (count) => this.pedidosHoy.set(count),
      error: () => this.pedidosHoy.set(0)
    });

    // Cargar productos activos
    this.productosService.contarActivos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (count) => this.productosActivos.set(count),
      error: () => this.productosActivos.set(0)
    });

    // Cargar ingresos del mes
    this.pedidosService.getIngresosMes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (total) => this.ingresosMes.set(total),
      error: () => this.ingresosMes.set(0)
    });

    // Cargar pedidos recientes
    this.pedidosService.getRecientes(10).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (pedidos) => this.pedidosRecientes.set(pedidos),
      error: () => this.pedidosRecientes.set([])
    });

    // Cargar pedidos pendientes
    this.pedidosService.contarPendientes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (count) => this.pedidosPendientes.set(count),
      error: () => this.pedidosPendientes.set(0),
      complete: () => this.cargando.set(false)
    });
  }

  /**
   * Obtiene el label legible para el estado del pedido
   */
  protected getEstadoLabel(estado: string): string {
    const estados: Record<string, string> = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'procesando': 'Procesando',
      'enviado': 'Enviado',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return estados[estado] || estado;
  }
}
