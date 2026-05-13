import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, catchError, of } from 'rxjs';

import { UsuariosService } from '../../core/services/usuarios.service';
import { PedidosService } from '../../core/services/pedidos.service';
import { ProductosService } from '../../core/services/productos.service';
import { RevenueStreamWidget } from './revenue-stream-widget.component';
import { BestSellingWidget } from './best-selling-widget.component';
import { RecentSalesWidget } from './recent-sales-widget.component';

export type EstadoPedido =
  | 'pendiente' | 'confirmado' | 'procesando'
  | 'enviado'   | 'entregado'  | 'cancelado';

export interface KpiDelta {
  value: number;
  label: string;
  up: boolean | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatRippleModule,
    RevenueStreamWidget,
    BestSellingWidget,
    RecentSalesWidget,
  ],
  template: `
    <div class="dashboard">

      <!-- ── Hero ─────────────────────────────────────────── -->
      <header class="hero" aria-label="Cabecera del dashboard">
        <span class="hero-badge">
          <mat-icon class="hero-badge-icon" aria-hidden="true">hub</mat-icon>
          Centro de control
        </span>
        <h1 class="hero-title">
          <span class="hero-icon-wrap" aria-hidden="true">
            <mat-icon>monitoring</mat-icon>
          </span>
          Dashboard
        </h1>
        <p class="hero-sub">Resumen general de tu tienda TOLI</p>
      </header>

      <!-- ── KPI Grid ──────────────────────────────────────── -->
      <section class="kpi-grid" aria-label="Métricas principales">
        @for (kpi of kpis(); track kpi.id) {
          <mat-card
            class="kpi-card"
            [class]="'kpi-' + kpi.color"
            matRipple
            [matTooltip]="kpi.tooltip"
            matTooltipPosition="above"
            role="article"
            [attr.aria-label]="kpi.label + ': ' + kpi.displayValue"
          >
            <mat-card-content>
              <div class="kpi-accent" aria-hidden="true"></div>
              <div class="kpi-icon" aria-hidden="true">
                <mat-icon>{{ kpi.icon }}</mat-icon>
              </div>
              <div class="kpi-body">
                <span class="kpi-label">{{ kpi.label }}</span>
                @if (cargando()) {
                  <span class="kpi-skeleton" aria-hidden="true"></span>
                } @else {
                  <span class="kpi-value">{{ kpi.displayValue }}</span>
                  @if (kpi.delta) {
                    @let d = kpi.delta;
                    <span class="kpi-delta" [class.kpi-delta-up]="d.up" [class.kpi-delta-neutral]="d.up === null">
                      <mat-icon class="delta-icon">
                        {{ d.up === null ? 'remove' : d.up ? 'trending_up' : 'trending_down' }}
                      </mat-icon>
                      {{ d.label }}
                    </span>
                  }
                }
              </div>
            </mat-card-content>
          </mat-card>
        }
      </section>

      <!-- ── Loading ───────────────────────────────────────── -->
      @if (cargando()) {
        <div class="loading-state" role="status" aria-live="polite">
          <mat-spinner diameter="40" strokeWidth="3"></mat-spinner>
          <p>Cargando estadísticas…</p>
        </div>
      }

      <!-- ── Widgets ───────────────────────────────────────── -->
      @if (!cargando()) {
        <app-revenue-stream-widget></app-revenue-stream-widget>
        <app-best-selling-widget></app-best-selling-widget>
        <app-recent-sales-widget></app-recent-sales-widget>

        <!-- ── Acciones rápidas ──────────────────────────────── -->
        <section class="quick-actions" aria-label="Acciones rápidas">
          <h2 class="section-title">
            <mat-icon aria-hidden="true">bolt</mat-icon>
            Acciones rápidas
          </h2>
          <div class="actions-grid">
            @for (accion of accionesRapidas; track accion.label) {
              <button
                class="action-btn"
                matRipple
                [routerLink]="accion.route"
                [attr.aria-label]="accion.label"
              >
                <span class="action-icon" [class]="'action-icon-' + accion.color" aria-hidden="true">
                  <mat-icon>{{ accion.icon }}</mat-icon>
                </span>
                <span class="action-copy">
                  <span class="action-label">{{ accion.label }}</span>
                  <span class="action-sub">{{ accion.sub }}</span>
                </span>
                @if (accion.badge) {
                  <span class="action-badge" aria-label="{{ accion.badge }} pendientes">
                    {{ accion.badge }}
                  </span>
                }
                <mat-icon class="action-arrow" aria-hidden="true">chevron_right</mat-icon>
              </button>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    /* ── Tokens ─────────────────────────────────────────────── */
    :host {
      display: block;
      animation: pageIn 320ms cubic-bezier(.2,.7,.2,1);
      --accent: var(--accent-primary, #10b981);
      --radius: 16px;
    }

    .dashboard {
      padding: 0;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* ── Hero ───────────────────────────────────────────────── */
    .hero { display: flex; flex-direction: column; gap: 4px; }

    .hero-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--bg-tertiary, #f1f5f9);
      border: 1px solid rgba(15,23,42,0.08);
      border-radius: 999px; padding: 4px 12px 4px 8px;
      font-size: 0.75rem; font-weight: 600;
      color: var(--text-secondary, #475569);
      width: fit-content; margin-bottom: 6px;
    }

    .hero-badge-icon { font-size: 14px; width: 14px; height: 14px; }

    .hero-title {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary, #0f172a);
      letter-spacing: -0.02em;
      display: inline-flex; align-items: center; gap: 10px;
    }

    .hero-icon-wrap {
      width: 38px; height: 38px; border-radius: 10px;
      display: inline-flex; align-items: center; justify-content: center;
      background: #e0f2fe;
      border: 1px solid rgba(14,165,233,.22);
    }

    .hero-icon-wrap mat-icon { color: #0284c7; font-size: 20px; width: 20px; height: 20px; }

    .hero-sub { margin: 2px 0 0; font-size: 0.875rem; color: var(--text-tertiary, #64748b); }

    /* ── KPI grid ───────────────────────────────────────────── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
    }

    .kpi-card {
      border-radius: var(--radius) !important;
      border: 1px solid var(--border-color, rgba(15,23,42,0.08)) !important;
      box-shadow: none !important;
      cursor: default;
      position: relative;
      overflow: hidden;
      transition: box-shadow 0.2s, transform 0.2s;
      animation: fadeUp 340ms cubic-bezier(.2,.7,.2,1) both;
    }

    .kpi-card:nth-child(2) { animation-delay: 60ms; }
    .kpi-card:nth-child(3) { animation-delay: 110ms; }
    .kpi-card:nth-child(4) { animation-delay: 160ms; }

    .kpi-card:hover {
      box-shadow: 0 4px 20px rgba(15,23,42,0.09) !important;
      transform: translateY(-1px);
    }

    .kpi-card mat-card-content {
      display: flex; align-items: center;
      padding: 18px 20px;
      gap: 14px;
    }

    /* Acento lateral de color */
    .kpi-accent {
      position: absolute; left: 0; top: 0;
      width: 3px; height: 100%;
      border-radius: 3px 0 0 3px;
    }

    .kpi-blue  .kpi-accent { background: #3b82f6; }
    .kpi-amber .kpi-accent { background: #f59e0b; }
    .kpi-green .kpi-accent { background: #10b981; }
    .kpi-pink  .kpi-accent { background: #ec4899; }

    /* Icono del KPI */
    .kpi-icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .kpi-icon mat-icon {
      font-size: 26px; width: 26px; height: 26px;
      font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 50, 'opsz' 40;
    }

    .kpi-blue  .kpi-icon { background: #eff6ff; color: #1d4ed8; }
    .kpi-amber .kpi-icon { background: #fffbeb; color: #b45309; }
    .kpi-green .kpi-icon { background: #ecfdf5; color: #065f46; }
    .kpi-pink  .kpi-icon { background: #fdf2f8; color: #9d174d; }

    /* Contenido del KPI */
    .kpi-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

    .kpi-label {
      font-size: 0.6875rem; font-weight: 600;
      color: var(--text-tertiary, #64748b);
      text-transform: uppercase; letter-spacing: 0.06em;
    }

    .kpi-value {
      font-size: 1.625rem; font-weight: 800;
      color: var(--text-primary, #0f172a);
      line-height: 1.1; letter-spacing: -0.02em;
    }

    /* Skeleton mientras carga */
    .kpi-skeleton {
      display: block; height: 28px; width: 80px;
      border-radius: 6px;
      background: rgba(15,23,42,0.08);
      animation: shimmer 1.4s ease-in-out infinite;
    }

    /* Deltas de tendencia */
    .kpi-delta {
      display: inline-flex; align-items: center; gap: 3px;
      font-size: 0.6875rem; font-weight: 600;
      color: var(--text-tertiary, #64748b);
      margin-top: 2px;
    }

    .kpi-delta-up    { color: #059669; }
    .kpi-delta-neutral { color: var(--text-tertiary, #64748b); }

    .delta-icon { font-size: 13px !important; width: 13px !important; height: 13px !important; }

    /* ── Quick actions ───────────────────────────────────────── */
    .quick-actions { display: flex; flex-direction: column; gap: 12px; }

    .section-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 1rem; font-weight: 700;
      color: var(--text-primary, #0f172a); margin: 0;
    }

    .section-title mat-icon { font-size: 20px; width: 20px; height: 20px; color: var(--text-secondary, #475569); }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }

    .action-btn {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 16px;
      background: var(--bg-secondary, #fff);
      border: 1px solid var(--border-color, rgba(15,23,42,0.08));
      border-radius: 12px;
      cursor: pointer; font-family: inherit;
      text-align: left; color: inherit;
      transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
    }

    .action-btn:hover {
      border-color: rgba(15,23,42,0.16);
      box-shadow: 0 2px 12px rgba(15,23,42,0.07);
      transform: translateY(-1px);
    }

    .action-icon {
      width: 38px; height: 38px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .action-icon mat-icon {
      font-size: 20px; width: 20px; height: 20px;
      font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 50, 'opsz' 32;
    }

    .action-icon-blue  { background: #eff6ff; color: #1d4ed8; }
    .action-icon-amber { background: #fffbeb; color: #b45309; }
    .action-icon-green { background: #ecfdf5; color: #065f46; }
    .action-icon-pink  { background: #fdf2f8; color: #9d174d; }
    .action-icon-purple{ background: #f5f3ff; color: #6d28d9; }

    .action-copy { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
    .action-label { font-size: 0.875rem; font-weight: 700; color: var(--text-primary, #0f172a); }
    .action-sub   { font-size: 0.75rem; color: var(--text-tertiary, #64748b); }

    .action-badge {
      background: #ef4444; color: #fff;
      font-size: 0.6875rem; font-weight: 700;
      border-radius: 999px; padding: 2px 7px;
      flex-shrink: 0; line-height: 1.4;
    }

    .action-arrow {
      font-size: 18px !important; width: 18px !important; height: 18px !important;
      color: var(--text-tertiary, #64748b);
      flex-shrink: 0;
    }

    /* ── Loading ─────────────────────────────────────────────── */
    .loading-state {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 48px; gap: 16px;
      color: var(--text-tertiary, #64748b);
      font-size: 0.875rem;
    }

    /* ── Responsive ──────────────────────────────────────────── */
    @media (max-width: 1024px) {
      .kpi-grid     { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .actions-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 640px) {
      .kpi-grid     { grid-template-columns: minmax(0, 1fr); }
      .actions-grid { grid-template-columns: minmax(0, 1fr); }
      .hero-title   { font-size: 1.375rem; }
    }

    /* ── Animaciones ──────────────────────────────────────────── */
    @keyframes pageIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes shimmer {
      0%, 100% { opacity: 0.5; }
      50%       { opacity: 1; }
    }
  `],
})
export class DashboardComponent implements OnInit {

  // ── Servicios ────────────────────────────────────────────
  private readonly usuariosService  = inject(UsuariosService);
  private readonly pedidosService   = inject(PedidosService);
  private readonly productosService = inject(ProductosService);
  private readonly destroyRef       = inject(DestroyRef);

  // ── Estado ───────────────────────────────────────────────
  protected readonly cargando           = signal(true);
  protected readonly usuariosActivos    = signal(0);
  protected readonly pedidosHoy         = signal(0);
  protected readonly productosActivos   = signal(0);
  protected readonly ingresosMes        = signal(0);
  protected readonly pedidosPendientes  = signal(0);

  // ── KPIs derivados ───────────────────────────────────────
  protected readonly kpis = computed(() => [
    {
      id: 'usuarios',
      label: 'Usuarios activos',
      icon: 'people',
      color: 'blue',
      displayValue: this.usuariosActivos().toLocaleString('es-PE'),
      tooltip: 'Total de usuarios con acceso activo',
      delta: { value: 12, label: '+12% este mes', up: true } satisfies KpiDelta,
    },
    {
      id: 'pedidos',
      label: 'Pedidos hoy',
      icon: 'shopping_cart',
      color: 'amber',
      displayValue: this.pedidosHoy().toLocaleString('es-PE'),
      tooltip: 'Pedidos registrados en el día de hoy',
      delta: { value: 5, label: '+5 vs. ayer', up: true } satisfies KpiDelta,
    },
    {
      id: 'productos',
      label: 'Productos activos',
      icon: 'inventory_2',
      color: 'green',
      displayValue: this.productosActivos().toLocaleString('es-PE'),
      tooltip: 'Productos disponibles en el catálogo',
      delta: { value: 0, label: 'Sin cambios', up: null } satisfies KpiDelta,
    },
    {
      id: 'ingresos',
      label: 'Ingresos del mes',
      icon: 'attach_money',
      color: 'pink',
      displayValue: new Intl.NumberFormat('es-PE', {
        style: 'currency', currency: 'PEN', maximumFractionDigits: 0,
      }).format(this.ingresosMes()),
      tooltip: 'Total de ingresos confirmados este mes',
      delta: { value: 18, label: '+18% vs. anterior', up: true } satisfies KpiDelta,
    },
  ]);

  // ── Acciones rápidas ─────────────────────────────────────
  protected readonly accionesRapidas = [
    { label: 'Nuevo producto',    sub: 'Agregar al catálogo',          icon: 'add_circle',     color: 'blue',   route: '/productos/nuevo',   badge: null },
    { label: 'Gestionar pedidos', sub: 'Revisar y despachar',          icon: 'local_shipping', color: 'amber',  route: '/pedidos',           badge: '7'  },
    { label: 'Ver reportes',      sub: 'Ingresos y métricas',          icon: 'bar_chart',      color: 'green',  route: '/reportes',          badge: null },
    { label: 'Usuarios',          sub: 'Administrar cuentas',          icon: 'manage_accounts',color: 'purple', route: '/usuarios',          badge: null },
    { label: 'Inventario',        sub: 'Stock y reposición',           icon: 'inventory',      color: 'pink',   route: '/inventario',        badge: null },
    { label: 'Configuración',     sub: 'Ajustes de la tienda',         icon: 'settings',       color: 'blue',   route: '/configuracion',     badge: null },
  ];

  // ── Lifecycle ────────────────────────────────────────────
  ngOnInit(): void {
    this._cargarEstadisticas();
  }

  // ── Carga de datos con forkJoin ──────────────────────────
  private _cargarEstadisticas(): void {
    this.cargando.set(true);

    forkJoin({
      usuarios:   this.usuariosService.contarActivos().pipe(catchError(() => of(0))),
      pedidosHoy: this.pedidosService.contarPedidosHoy().pipe(catchError(() => of(0))),
      productos:  this.productosService.contarActivos().pipe(catchError(() => of(0))),
      ingresos:   this.pedidosService.getIngresosMes().pipe(catchError(() => of(0))),
      pendientes: this.pedidosService.contarPendientes().pipe(catchError(() => of(0))),
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: ({ usuarios, pedidosHoy, productos, ingresos, pendientes }) => {
        this.usuariosActivos.set(usuarios);
        this.pedidosHoy.set(pedidosHoy);
        this.productosActivos.set(productos);
        this.ingresosMes.set(ingresos);
        this.pedidosPendientes.set(pendientes);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  // ── Helpers de estado para chips ────────────────────────
  protected getEstadoLabel(estado: EstadoPedido): string {
    const labels: Record<EstadoPedido, string> = {
      pendiente:  'Pendiente',
      confirmado: 'Confirmado',
      procesando: 'Procesando',
      enviado:    'Enviado',
      entregado:  'Entregado',
      cancelado:  'Cancelado',
    };
    return labels[estado] ?? estado;
  }

  protected getEstadoIcon(estado: EstadoPedido): string {
    const icons: Record<EstadoPedido, string> = {
      pendiente:  'schedule',
      confirmado: 'verified',
      procesando: 'autorenew',
      enviado:    'local_shipping',
      entregado:  'task_alt',
      cancelado:  'cancel',
    };
    return icons[estado] ?? 'info';
  }

  protected getEstadoClass(estado: EstadoPedido): string {
    const cls: Record<EstadoPedido, string> = {
      pendiente:  'chip-amber',
      confirmado: 'chip-green',
      procesando: 'chip-blue',
      enviado:    'chip-blue',
      entregado:  'chip-purple',
      cancelado:  'chip-red',
    };
    return cls[estado] ?? '';
  }
}