import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRippleModule } from '@angular/material/core';

// ── Tipos ────────────────────────────────────────────────────────────────────

export type EstadoPago = 'pendiente' | 'confirmado' | 'rechazado' | 'observado';
export type MetodoPago = 'yape' | 'plin' | 'transferencia' | 'efectivo' | 'tarjeta';

export interface Pago {
  id: string;
  pedido_id: string;
  cliente_nombre: string;
  cliente_iniciales: string;
  metodo: MetodoPago;
  monto: number;
  estado: EstadoPago;
  comprobante_url?: string;
  observacion?: string;
  creado_en: string;
}

export interface PagoKpis {
  confirmadosHoy: number;
  montoHoy: number;
  porValidar: number;
  rechazados: number;
  totalMes: number;
}

type FiltroEstado = 'todos' | EstadoPago;

// ── Datos mock (reemplazar por servicio real) ────────────────────────────────

const PAGOS_MOCK: Pago[] = [
  { id: 'p1', pedido_id: 'PED-1234', cliente_nombre: 'Luis García',    cliente_iniciales: 'LG', metodo: 'yape',          monto: 189.00, estado: 'pendiente',  creado_en: new Date().toISOString() },
  { id: 'p2', pedido_id: 'PED-1233', cliente_nombre: 'María Ríos',     cliente_iniciales: 'MR', metodo: 'plin',          monto: 340.00, estado: 'confirmado', creado_en: new Date(Date.now() - 3_600_000).toISOString() },
  { id: 'p3', pedido_id: 'PED-1232', cliente_nombre: 'Juan Llave',     cliente_iniciales: 'JL', metodo: 'transferencia', monto: 95.00,  estado: 'confirmado', creado_en: new Date(Date.now() - 7_200_000).toISOString() },
  { id: 'p4', pedido_id: 'PED-1231', cliente_nombre: 'Ana Pérez',      cliente_iniciales: 'AP', metodo: 'yape',          monto: 210.00, estado: 'rechazado',  creado_en: new Date(Date.now() - 86_400_000).toISOString() },
  { id: 'p5', pedido_id: 'PED-1230', cliente_nombre: 'Carlos Ramos',   cliente_iniciales: 'CR', metodo: 'efectivo',      monto: 55.00,  estado: 'pendiente',  creado_en: new Date(Date.now() - 90_000_000).toISOString() },
  { id: 'p6', pedido_id: 'PED-1229', cliente_nombre: 'Rosa Cáceres',   cliente_iniciales: 'RC', metodo: 'tarjeta',       monto: 420.00, estado: 'confirmado', creado_en: new Date(Date.now() - 100_000_000).toISOString() },
  { id: 'p7', pedido_id: 'PED-1228', cliente_nombre: 'Pedro Soto',     cliente_iniciales: 'PS', metodo: 'plin',          monto: 130.00, estado: 'observado',  observacion: 'Monto no coincide con el pedido', creado_en: new Date(Date.now() - 110_000_000).toISOString() },
  { id: 'p8', pedido_id: 'PED-1227', cliente_nombre: 'Lucía Mendoza',  cliente_iniciales: 'LM', metodo: 'yape',          monto: 275.00, estado: 'confirmado', creado_en: new Date(Date.now() - 120_000_000).toISOString() },
];

@Component({
  selector: 'app-pagos-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CurrencyPipe,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDividerModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatRippleModule,
  ],
  template: `
    <div class="pagos-container">

      <!-- ── Hero ──────────────────────────────────────────────────── -->
      <header class="hero" aria-label="Módulo de pagos">
        <span class="hero-badge">
          <mat-icon class="badge-icon" aria-hidden="true">account_balance_wallet</mat-icon>
          Finanzas
        </span>
        <h1 class="hero-title">
          <span class="hero-icon-wrap" aria-hidden="true">
            <mat-icon>payments</mat-icon>
          </span>
          Pagos
        </h1>
        <p class="hero-sub">
          Registro y seguimiento de todos los pagos recibidos desde la app.
        </p>
      </header>

      <!-- ── KPIs ──────────────────────────────────────────────────── -->
      <section class="kpi-grid" aria-label="Resumen de pagos">
        <mat-card class="kpi-card kpi-green" matRipple
          matTooltip="Total recaudado hoy en pagos confirmados"
          matTooltipPosition="above">
          <mat-card-content>
            <div class="kpi-accent"></div>
            <div class="kpi-icon"><mat-icon>check_circle</mat-icon></div>
            <div class="kpi-body">
              <span class="kpi-label">Confirmados hoy</span>
              @if (cargando()) { <span class="kpi-skel"></span> }
              @else {
                <span class="kpi-value">
                  {{ kpis().montoHoy | currency:'PEN':'S/ ':'1.0-0' }}
                </span>
                <span class="kpi-sub">{{ kpis().confirmadosHoy }} transacciones</span>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card kpi-amber" matRipple
          matTooltip="Pagos que necesitan revisión del operario"
          matTooltipPosition="above">
          <mat-card-content>
            <div class="kpi-accent"></div>
            <div class="kpi-icon"><mat-icon>schedule</mat-icon></div>
            <div class="kpi-body">
              <span class="kpi-label">Por validar</span>
              @if (cargando()) { <span class="kpi-skel"></span> }
              @else {
                <span class="kpi-value">{{ kpis().porValidar }}</span>
                <span class="kpi-sub">Requieren revisión</span>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card kpi-red" matRipple
          matTooltip="Pagos que no pudieron validarse"
          matTooltipPosition="above">
          <mat-card-content>
            <div class="kpi-accent"></div>
            <div class="kpi-icon"><mat-icon>cancel</mat-icon></div>
            <div class="kpi-body">
              <span class="kpi-label">Rechazados</span>
              @if (cargando()) { <span class="kpi-skel"></span> }
              @else {
                <span class="kpi-value">{{ kpis().rechazados }}</span>
                <span class="kpi-sub">Último: hace 2 h</span>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="kpi-card kpi-blue" matRipple
          matTooltip="Suma total de pagos confirmados este mes"
          matTooltipPosition="above">
          <mat-card-content>
            <div class="kpi-accent"></div>
            <div class="kpi-icon"><mat-icon>bar_chart</mat-icon></div>
            <div class="kpi-body">
              <span class="kpi-label">Total del mes</span>
              @if (cargando()) { <span class="kpi-skel"></span> }
              @else {
                <span class="kpi-value">
                  {{ kpis().totalMes | currency:'PEN':'S/ ':'1.0-0' }}
                </span>
                <span class="kpi-sub kpi-sub-up">
                  <mat-icon class="trend-icon">trending_up</mat-icon>
                  +18% vs. anterior
                </span>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </section>

      <!-- ── Toolbar ────────────────────────────────────────────────── -->
      <div class="toolbar" role="toolbar" aria-label="Filtros y acciones">

        <!-- Búsqueda -->
        <mat-form-field class="search-field" appearance="outline" subscriptSizing="dynamic">
          <mat-icon matPrefix>search</mat-icon>
          <input
            matInput
            type="search"
            placeholder="Buscar por pedido, cliente o monto…"
            [(ngModel)]="busqueda"
            aria-label="Buscar pagos"
          />
          @if (busqueda) {
            <button matSuffix mat-icon-button aria-label="Limpiar búsqueda" (click)="busqueda = ''">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>

        <!-- Filtros de estado -->
        <div class="filtro-chips" role="group" aria-label="Filtrar por estado">
          @for (f of filtros; track f.value) {
            <button
              class="filtro-chip"
              [class.active]="filtroActivo() === f.value"
              (click)="setFiltro(f.value)"
              [attr.aria-pressed]="filtroActivo() === f.value"
            >
              <mat-icon class="chip-icon">{{ f.icon }}</mat-icon>
              {{ f.label }}
              @if (f.count() > 0) {
                <span class="chip-count">{{ f.count() }}</span>
              }
            </button>
          }
        </div>

        <!-- Exportar -->
        <button
          mat-stroked-button
          class="export-btn"
          aria-label="Exportar pagos a CSV"
          (click)="exportar()"
        >
          <mat-icon>download</mat-icon>
          Exportar
        </button>
      </div>

      <!-- ── Tabla ──────────────────────────────────────────────────── -->
      <mat-card class="tabla-card">

        @if (cargando()) {
          <div class="loading-state" role="status" aria-live="polite">
            <mat-spinner diameter="36" strokeWidth="3"></mat-spinner>
            <p>Cargando pagos…</p>
          </div>
        } @else if (pagosPagina().length === 0) {
          <div class="empty-state" role="status">
            <mat-icon aria-hidden="true">receipt_long</mat-icon>
            <p>No se encontraron pagos con los filtros aplicados.</p>
            <button mat-stroked-button (click)="limpiarFiltros()">Limpiar filtros</button>
          </div>
        } @else {
          <div class="table-scroll" role="region" aria-label="Lista de pagos">
            <table mat-table [dataSource]="pagosPagina()" class="pagos-table" aria-label="Pagos">

              <!-- Pedido -->
              <ng-container matColumnDef="pedido">
                <th mat-header-cell *matHeaderCellDef>Pedido</th>
                <td mat-cell *matCellDef="let p">
                  <span class="pedido-id">#{{ p.pedido_id }}</span>
                </td>
              </ng-container>

              <!-- Cliente -->
              <ng-container matColumnDef="cliente">
                <th mat-header-cell *matHeaderCellDef>Cliente</th>
                <td mat-cell *matCellDef="let p">
                  <div class="cliente-cell">
                    <span
                      class="avatar"
                      [class]="'avatar-' + avatarColor(p.cliente_iniciales)"
                      aria-hidden="true"
                    >{{ p.cliente_iniciales }}</span>
                    <span class="cliente-nombre">{{ p.cliente_nombre }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Método -->
              <ng-container matColumnDef="metodo">
                <th mat-header-cell *matHeaderCellDef>Método</th>
                <td mat-cell *matCellDef="let p">
                  <div class="metodo-cell">
                    <span
                      class="metodo-icon"
                      [class]="'metodo-' + p.metodo"
                      [attr.aria-label]="metodoLabel(p.metodo)"
                    >
                      <mat-icon>{{ metodoIcon(p.metodo) }}</mat-icon>
                    </span>
                    <span>{{ metodoLabel(p.metodo) }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Monto -->
              <ng-container matColumnDef="monto">
                <th mat-header-cell *matHeaderCellDef class="col-right">Monto</th>
                <td mat-cell *matCellDef="let p" class="col-right">
                  <span class="monto">{{ p.monto | currency:'PEN':'S/ ':'1.2-2' }}</span>
                </td>
              </ng-container>

              <!-- Estado -->
              <ng-container matColumnDef="estado">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let p">
                  <span
                    class="estado-chip"
                    [class]="'estado-' + p.estado"
                    [attr.aria-label]="estadoLabel(p.estado)"
                  >
                    <mat-icon class="estado-icon">{{ estadoIcon(p.estado) }}</mat-icon>
                    {{ estadoLabel(p.estado) }}
                  </span>
                  @if (p.observacion) {
                    <mat-icon
                      class="obs-icon"
                      [matTooltip]="p.observacion"
                      matTooltipPosition="above"
                      aria-label="Ver observación"
                    >info_outline</mat-icon>
                  }
                </td>
              </ng-container>

              <!-- Fecha -->
              <ng-container matColumnDef="fecha">
                <th mat-header-cell *matHeaderCellDef>Fecha</th>
                <td mat-cell *matCellDef="let p">
                  <span class="fecha">{{ p.creado_en | date:'d MMM · HH:mm':'':'es' }}</span>
                </td>
              </ng-container>

              <!-- Acciones -->
              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef class="col-right">Acciones</th>
                <td mat-cell *matCellDef="let p" class="col-right">
                  <div class="acciones-cell">
                    <!-- Ver comprobante -->
                    <button
                      mat-icon-button
                      class="accion-btn"
                      matTooltip="Ver comprobante"
                      matTooltipPosition="above"
                      aria-label="Ver comprobante"
                      (click)="verComprobante(p)"
                    >
                      <mat-icon>visibility</mat-icon>
                    </button>

                    <!-- Aprobar (solo si pendiente u observado) -->
                    @if (p.estado === 'pendiente' || p.estado === 'observado') {
                      <button
                        mat-icon-button
                        class="accion-btn accion-aprobar"
                        matTooltip="Aprobar pago"
                        matTooltipPosition="above"
                        aria-label="Aprobar pago"
                        (click)="aprobar(p)"
                      >
                        <mat-icon>check_circle_outline</mat-icon>
                      </button>

                      <button
                        mat-icon-button
                        class="accion-btn accion-rechazar"
                        matTooltip="Rechazar pago"
                        matTooltipPosition="above"
                        aria-label="Rechazar pago"
                        (click)="rechazar(p)"
                      >
                        <mat-icon>cancel_outline</mat-icon>
                      </button>
                    }

                    <!-- Reintentar (solo si rechazado) -->
                    @if (p.estado === 'rechazado') {
                      <button
                        mat-icon-button
                        class="accion-btn accion-reintentar"
                        matTooltip="Reintentar validación"
                        matTooltipPosition="above"
                        aria-label="Reintentar validación"
                        (click)="reintentar(p)"
                      >
                        <mat-icon>refresh</mat-icon>
                      </button>
                    }

                    <!-- Más opciones -->
                    <button
                      mat-icon-button
                      class="accion-btn"
                      [matMenuTriggerFor]="masMenu"
                      [matMenuTriggerData]="{ pago: p }"
                      matTooltip="Más opciones"
                      matTooltipPosition="above"
                      aria-label="Más opciones"
                    >
                      <mat-icon>more_vert</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columnas"></tr>
              <tr
                mat-row
                *matRowDef="let row; columns: columnas"
                class="pago-row"
                [class.row-pendiente]="row.estado === 'pendiente'"
              ></tr>
            </table>
          </div>

          <!-- Paginación -->
          <mat-paginator
            [length]="pagosFiltrados().length"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50]"
            [pageIndex]="pageIndex()"
            (page)="onPage($event)"
            aria-label="Paginación de pagos"
          ></mat-paginator>
        }
      </mat-card>
    </div>

    <!-- Menú contextual -->
    <mat-menu #masMenu="matMenu">
      <ng-template matMenuContent let-pago="pago">
        <button mat-menu-item (click)="verDetallePedido(pago)">
          <mat-icon>open_in_new</mat-icon>
          <span>Ver pedido</span>
        </button>
        <button mat-menu-item (click)="copiarId(pago)">
          <mat-icon>content_copy</mat-icon>
          <span>Copiar ID</span>
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="agregarObservacion(pago)">
          <mat-icon>edit_note</mat-icon>
          <span>Agregar observación</span>
        </button>
      </ng-template>
    </mat-menu>
  `,
  styles: [`
    /* ── Host & layout ─────────────────────────────────────── */
    :host {
      display: block;
      animation: pageIn 300ms cubic-bezier(.2,.7,.2,1);
      --bg-primary: var(--bg-secondary, #fff);
      --bg-secondary: var(--bg-tertiary, #f8fafc);
      --text-primary: var(--text-primary, #0f172a);
      --text-secondary: var(--text-secondary, #475569);
      --text-tertiary: var(--text-tertiary, #64748b);
      --accent: #10b981;
      --accent-soft: rgba(16,185,129,0.12);
    }

    :host-context(.dark) {
      --bg-primary: #1e293b;
      --bg-secondary: #0f172a;
      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
      --text-tertiary: #64748b;
    }

    .pagos-container {
      max-width: 1600px;
      margin: 0 auto;
      width: 100%;
      padding: 24px 32px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    /* ── Hero ───────────────────────────────────────────────── */
    .hero { display: flex; flex-direction: column; gap: 6px; }

    .hero-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: linear-gradient(135deg, var(--accent-soft) 0%, rgba(16,185,129,0.08) 100%);
      border: 1px solid rgba(16,185,129,0.2);
      border-radius: 999px; padding: 5px 14px 5px 10px;
      font-size: 0.75rem; font-weight: 600;
      color: #065f46;
      width: fit-content;
    }

    .badge-icon { font-size: 14px; width: 14px; height: 14px; }

    .hero-title {
      margin: 0;
      font-size: 2rem; font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.03em;
      display: inline-flex; align-items: center; gap: 12px;
    }

    .hero-icon-wrap {
      width: 44px; height: 44px; border-radius: 12px;
      display: inline-flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      box-shadow: 0 2px 8px rgba(16,185,129,0.2);
    }

    .hero-icon-wrap mat-icon { color: #059669; font-size: 22px; width: 22px; height: 22px; }

    .hero-sub { margin: 4px 0 0; font-size: 0.9375rem; color: var(--text-tertiary); }

    /* ── KPI grid ───────────────────────────────────────────── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
    }

    .kpi-card {
      border-radius: 16px !important;
      border: 1px solid rgba(15,23,42,0.06) !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04) !important;
      cursor: default;
      position: relative;
      overflow: hidden;
      transition: all 0.2s cubic-bezier(.4,0,.2,1);
      animation: fadeUp 380ms cubic-bezier(.2,.7,.2,1) both;
      background: var(--bg-primary) !important;
    }

    .kpi-card:nth-child(2) { animation-delay: 60ms; }
    .kpi-card:nth-child(3) { animation-delay: 120ms; }
    .kpi-card:nth-child(4) { animation-delay: 180ms; }

    .kpi-card:hover {
      box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important;
      transform: translateY(-2px);
      border-color: rgba(16,185,129,0.3) !important;
    }

    .kpi-card mat-card-content {
      display: flex; align-items: center;
      padding: 20px 20px; gap: 16px;
      background: transparent !important;
    }

    .kpi-accent {
      position: absolute; left: 0; top: 0;
      width: 4px; height: 100%;
    }

    .kpi-green .kpi-accent { background: linear-gradient(180deg, #34d399 0%, #10b981 100%); }
    .kpi-amber .kpi-accent { background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%); }
    .kpi-red   .kpi-accent { background: linear-gradient(180deg, #f87171 0%, #ef4444 100%); }
    .kpi-blue  .kpi-accent { background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%); }

    .kpi-icon {
      width: 52px; height: 52px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .kpi-icon mat-icon {
      font-size: 26px; width: 26px; height: 26px;
      font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 50, 'opsz' 36;
    }

    .kpi-green .kpi-icon { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); color: #059669; }
    .kpi-amber .kpi-icon { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); color: #b45309; }
    .kpi-red   .kpi-icon { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); color: #dc2626; }
    .kpi-blue  .kpi-icon { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); color: #2563eb; }

    .kpi-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }

    .kpi-label {
      font-size: 0.75rem; font-weight: 600;
      color: var(--text-tertiary);
      text-transform: uppercase; letter-spacing: 0.04em;
    }

    .kpi-value {
      font-size: 1.625rem; font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.025em; line-height: 1.1;
    }

    .kpi-skel {
      display: block; height: 28px; width: 80px;
      border-radius: 8px;
      background: linear-gradient(90deg, rgba(15,23,42,0.06) 0%, rgba(15,23,42,0.12) 50%, rgba(15,23,42,0.06) 100%);
      animation: shimmer 1.6s ease-in-out infinite;
    }

    .kpi-sub {
      font-size: 0.75rem; color: var(--text-tertiary);
      display: flex; align-items: center; gap: 3px;
    }

    .kpi-sub-up { color: #059669; }

    .trend-icon { font-size: 13px !important; width: 13px !important; height: 13px !important; }

    /* ── Toolbar ─────────────────────────────────────────────── */
    .toolbar {
      display: flex; align-items: center;
      gap: 12px; flex-wrap: wrap;
      padding: 4px;
    }

    .search-field {
      flex: 1; min-width: 240px;
      font-size: 0.875rem;
    }

    .search-field .mat-mdc-form-field-infix { min-height: 42px; padding: 8px 0; }

    .filtro-chips {
      display: flex; gap: 8px; flex-wrap: wrap;
    }

    .filtro-chip {
      display: inline-flex; align-items: center; gap: 6px;
      height: 36px; padding: 0 14px;
      border: 1px solid rgba(15,23,42,0.08);
      border-radius: 10px;
      background: var(--bg-primary);
      color: var(--text-secondary);
      font-size: 0.8125rem; font-weight: 500;
      cursor: pointer; font-family: inherit;
      transition: all 0.15s ease;
    }

    .filtro-chip:hover {
      background: var(--bg-secondary);
      border-color: rgba(15,23,42,0.12);
    }

    .filtro-chip.active {
      background: linear-gradient(135deg, var(--accent-soft) 0%, rgba(16,185,129,0.08) 100%);
      border-color: var(--accent);
      color: #065f46;
      font-weight: 600;
    }

    .chip-icon { font-size: 16px !important; width: 16px !important; height: 16px !important; }

    .chip-count {
      background: rgba(15,23,42,0.08);
      border-radius: 999px;
      padding: 0 7px;
      font-size: 11px; font-weight: 700;
      line-height: 20px;
      min-width: 20px; text-align: center;
    }

    .filtro-chip.active .chip-count {
      background: var(--accent);
      color: #fff;
    }

    .export-btn {
      margin-left: auto;
      height: 36px;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-secondary) !important;
      border-radius: 10px;
    }

    /* ── Tabla card ──────────────────────────────────────────── */
    .tabla-card {
      border-radius: 16px !important;
      border: 1px solid rgba(15,23,42,0.06) !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04) !important;
      padding: 0 !important;
      overflow: hidden;
      background: var(--bg-primary) !important;
    }

    .table-scroll { overflow-x: auto; }

    .pagos-table {
      width: 100%;
      min-width: 700px;
      background: transparent !important;
    }

    /* Header de la tabla */
    .pagos-table th.mat-mdc-header-cell {
      background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%) !important;
      font-size: 0.6875rem; font-weight: 700;
      color: var(--text-tertiary);
      text-transform: uppercase; letter-spacing: 0.05em;
      border-bottom: 1px solid rgba(15,23,42,0.08);
      padding: 14px 16px;
    }

    /* Celdas */
    .pagos-table td.mat-mdc-cell {
      font-size: 0.875rem;
      color: var(--text-primary);
      background: transparent !important;
      padding: 14px 16px;
      border-bottom: 1px solid rgba(15,23,42,0.04);
    }

    .pagos-table .pago-row:last-child td { border-bottom: none; }
    .pagos-table .pago-row:hover td { background: rgba(16,185,129,0.04); }
    .pagos-table .row-pendiente td { background: rgba(245,158,11,0.06); }
    .pagos-table .mat-mdc-row { background: transparent !important; }
    .pagos-table .mat-mdc-row:hover { background: rgba(16,185,129,0.04) !important; }

    .col-right { text-align: right !important; }

    /* Pedido ID */
    .pedido-id {
      font-size: 0.8125rem; font-weight: 700;
      color: #3b82f6;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background 0.15s;
    }

    .pedido-id:hover { background: rgba(59,130,246,0.1); text-decoration: none; }

    /* Cliente */
    .cliente-cell { display: flex; align-items: center; gap: 10px; }

    .avatar {
      width: 32px; height: 32px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 700;
      flex-shrink: 0; letter-spacing: 0.02em;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .avatar-blue   { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #1d4ed8; }
    .avatar-pink   { background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); color: #db2777; }
    .avatar-green  { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); color: #059669; }
    .avatar-red    { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); color: #dc2626; }
    .avatar-amber  { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #d97706; }
    .avatar-purple { background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); color: #7c3aed; }

    .cliente-nombre {
      font-size: 0.875rem; font-weight: 500;
      color: var(--text-primary);
      white-space: nowrap;
    }

    /* Método */
    .metodo-cell { display: flex; align-items: center; gap: 8px; }

    .metodo-icon {
      width: 26px; height: 26px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }

    .metodo-icon mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .metodo-yape         { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #2563eb; }
    .metodo-plin         { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #d97706; }
    .metodo-transferencia{ background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); color: #7c3aed; }
    .metodo-efectivo     { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); color: #059669; }
    .metodo-tarjeta      { background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); color: #db2777; }

    /* Monto */
    .monto { font-weight: 700; color: var(--text-primary); font-size: 0.9375rem; }

    /* Estado chip */
    .estado-chip {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 12px; border-radius: 999px;
      font-size: 0.6875rem; font-weight: 600;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .estado-icon { font-size: 12px !important; width: 12px !important; height: 12px !important; }

    .estado-confirmado { background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); color: #15803d; }
    .estado-pendiente  { background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%); color: #a16207; }
    .estado-rechazado  { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); color: #dc2626; }
    .estado-observado  { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #1d4ed8; }

    .obs-icon {
      font-size: 14px !important; width: 14px !important; height: 14px !important;
      color: var(--text-tertiary);
      vertical-align: middle; margin-left: 4px;
      cursor: help;
    }

    /* Fecha */
    .fecha { font-size: 0.8125rem; color: var(--text-tertiary); white-space: nowrap; }

    /* Acciones */
    .acciones-cell { display: flex; align-items: center; gap: 4px; justify-content: flex-end; }

    .accion-btn {
      width: 32px !important; height: 32px !important;
      line-height: 32px !important;
      color: var(--text-tertiary) !important;
      border-radius: 8px !important;
    }

    .accion-btn mat-icon { font-size: 18px !important; width: 18px !important; height: 18px !important; }
    .accion-btn:hover { background: rgba(16,185,129,0.1) !important; }

    .accion-aprobar:hover  { color: #059669 !important; background: rgba(5,150,105,0.15) !important; }
    .accion-rechazar:hover { color: #dc2626 !important; background: rgba(220,38,38,0.15) !important; }
    .accion-reintentar:hover { color: #3b82f6 !important; background: rgba(59,130,246,0.15) !important; }

    /* ── Loading / empty ─────────────────────────────────────── */
    .loading-state, .empty-state {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 64px 24px; gap: 16px;
      color: var(--text-tertiary);
      font-size: 0.9375rem;
    }

    .empty-state mat-icon {
      font-size: 56px; width: 56px; height: 56px;
      opacity: 0.3;
    }

    /* ── Responsive ──────────────────────────────────────────── */
    @media (max-width: 1024px) {
      .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 640px) {
      .kpi-grid     { grid-template-columns: minmax(0, 1fr)); }
      .export-btn   { margin-left: 0; }
      .filtro-chips { display: none; }
    }

    /* ── Dark theme overrides ─────────────────────────────────── */
    :host-context(.dark) {
      .hero-badge {
        background: linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.08) 100%);
        border-color: rgba(52,211,153,0.25);
        color: #34d399;
      }
      .hero-title { color: #f1f5f9; }
      .hero-sub { color: #64748b; }
      .hero-badge-icon { color: #34d399; }
      .hero-icon-wrap { background: linear-gradient(135deg, #064e3b 0%, #065f46 100%); box-shadow: 0 2px 12px rgba(16,185,129,0.3); }
      .hero-icon-wrap mat-icon { color: #34d399; }
      .kpi-card { background: #1e293b !important; border-color: rgba(148,163,184,0.12) !important; box-shadow: 0 1px 4px rgba(0,0,0,0.2) !important; }
      .kpi-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.4) !important; border-color: rgba(52,211,153,0.3) !important; }
      .kpi-card mat-card-content { background: transparent !important; }
      .kpi-label { color: #64748b; }
      .kpi-value { color: #f1f5f9; }
      .kpi-skel { background: linear-gradient(90deg, rgba(241,245,249,0.06) 0%, rgba(241,245,249,0.12) 50%, rgba(241,245,249,0.06) 100%); }
      .kpi-sub { color: #64748b; }
      .kpi-sub-up { color: #34d399; }
      .search-field .mat-mdc-text-field-wrapper { background: #1e293b !important; }
      .filtro-chip {
        background: #1e293b;
        border-color: rgba(148,163,184,0.12);
        color: #94a3b8;
      }
      .filtro-chip:hover { background: #334155; border-color: rgba(148,163,184,0.2); }
      .filtro-chip.active {
        background: linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.08) 100%);
        border-color: #10b981;
        color: #34d399;
        font-weight: 600;
      }
      .filtro-chip.active .chip-count { background: #10b981; color: #fff; }
      .chip-count { background: rgba(241,245,249,0.1); }
      .export-btn { color: #94a3b8 !important; }
      .tabla-card { background: #1e293b !important; border-color: rgba(148,163,184,0.12) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.2) !important; }
      .pagos-table { background: transparent !important; }
      .pagos-table th.mat-mdc-header-cell {
        background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%) !important;
        color: #64748b !important;
        border-color: rgba(148,163,184,0.12) !important;
      }
      .pagos-table td.mat-mdc-cell {
        color: #f1f5f9 !important;
        background: transparent !important;
        border-color: rgba(148,163,184,0.08) !important;
      }
      .pagos-table .mat-mdc-row { background: transparent !important; }
      .pagos-table .mat-mdc-row:hover { background: rgba(52,211,153,0.06) !important; }
      .pagos-table .pago-row:hover td { background: rgba(52,211,153,0.06) !important; }
      .pagos-table .mat-mdc-footer-cell { background: transparent !important; color: #f1f5f9 !important; }
      .pedido-id { color: #60a5fa !important; }
      .pedido-id:hover { background: rgba(96,165,250,0.15); }
      .cliente-nombre { color: #f1f5f9; }
      .monto { color: #f1f5f9; }
      .obs-icon { color: #64748b; }
      .fecha { color: #64748b; }
      .accion-btn { color: #64748b !important; }
      .loading-state, .empty-state { color: #64748b; }
      .mat-mdc-paginator { background: transparent !important; color: #94a3b8 !important; }
      .mat-mdc-paginator-container { background: transparent !important; }
      ::-webkit-scrollbar { background: #1e293b; }
      ::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
    }

    /* ── Animaciones ──────────────────────────────────────────── */
    @keyframes pageIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `],
})
export class PagosListComponent implements OnInit {

  private readonly snack     = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  // ── Estado ───────────────────────────────────────────────
  protected readonly cargando  = signal(true);
  protected readonly todos     = signal<Pago[]>([]);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize  = 10;

  protected busqueda = '';

  protected readonly filtroActivo = signal<FiltroEstado>('todos');

  // ── Columnas ─────────────────────────────────────────────
  protected readonly columnas = [
    'pedido', 'cliente', 'metodo', 'monto', 'estado', 'fecha', 'acciones',
  ];

  // ── KPIs computados ───────────────────────────────────────
  protected readonly kpis = computed<PagoKpis>(() => {
    const lista = this.todos();
    const hoy   = new Date().toDateString();

    const hoyConf = lista.filter(
      p => p.estado === 'confirmado' && new Date(p.creado_en).toDateString() === hoy
    );

    return {
      confirmadosHoy: hoyConf.length,
      montoHoy:       hoyConf.reduce((s, p) => s + p.monto, 0),
      porValidar:     lista.filter(p => p.estado === 'pendiente' || p.estado === 'observado').length,
      rechazados:     lista.filter(p => p.estado === 'rechazado').length,
      totalMes:       lista.filter(p => p.estado === 'confirmado').reduce((s, p) => s + p.monto, 0),
    };
  });

  // ── Filtros con contadores ────────────────────────────────
  protected readonly filtros = [
    { value: 'todos'      as FiltroEstado, label: 'Todos',       icon: 'list',              count: computed(() => this.todos().length) },
    { value: 'pendiente'  as FiltroEstado, label: 'Pendientes',  icon: 'schedule',          count: computed(() => this.todos().filter(p => p.estado === 'pendiente').length) },
    { value: 'confirmado' as FiltroEstado, label: 'Confirmados', icon: 'check_circle',      count: computed(() => this.todos().filter(p => p.estado === 'confirmado').length) },
    { value: 'observado'  as FiltroEstado, label: 'Observados',  icon: 'info_outline',      count: computed(() => this.todos().filter(p => p.estado === 'observado').length) },
    { value: 'rechazado'  as FiltroEstado, label: 'Rechazados',  icon: 'cancel',            count: computed(() => this.todos().filter(p => p.estado === 'rechazado').length) },
  ];

  // ── Lista filtrada ────────────────────────────────────────
  protected readonly pagosFiltrados = computed(() => {
    const q      = this.busqueda.trim().toLowerCase();
    const estado = this.filtroActivo();

    return this.todos().filter(p => {
      const matchEstado = estado === 'todos' || p.estado === estado;
      const matchBusq   = !q
        || p.pedido_id.toLowerCase().includes(q)
        || p.cliente_nombre.toLowerCase().includes(q)
        || String(p.monto).includes(q);
      return matchEstado && matchBusq;
    });
  });

  // ── Página actual ─────────────────────────────────────────
  protected readonly pagosPagina = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    return this.pagosFiltrados().slice(start, start + this.pageSize);
  });

  // ── Lifecycle ─────────────────────────────────────────────
  ngOnInit(): void {
    // TODO: reemplazar por inyección de PagosService
    setTimeout(() => {
      this.todos.set(PAGOS_MOCK);
      this.cargando.set(false);
    }, 800);
  }

  // ── Filtros ───────────────────────────────────────────────
  setFiltro(f: FiltroEstado): void {
    this.filtroActivo.set(f);
    this.pageIndex.set(0);
  }

  limpiarFiltros(): void {
    this.filtroActivo.set('todos');
    this.busqueda = '';
    this.pageIndex.set(0);
  }

  onPage(e: PageEvent): void {
    this.pageIndex.set(e.pageIndex);
  }

  // ── Acciones ──────────────────────────────────────────────
  aprobar(pago: Pago): void {
    this.todos.update(list =>
      list.map(p => p.id === pago.id ? { ...p, estado: 'confirmado' as EstadoPago } : p)
    );
    this.snack.open(`Pago #${pago.pedido_id} confirmado`, 'OK', { duration: 3000 });
  }

  rechazar(pago: Pago): void {
    this.todos.update(list =>
      list.map(p => p.id === pago.id ? { ...p, estado: 'rechazado' as EstadoPago } : p)
    );
    this.snack.open(`Pago #${pago.pedido_id} rechazado`, 'OK', { duration: 3000 });
  }

  reintentar(pago: Pago): void {
    this.todos.update(list =>
      list.map(p => p.id === pago.id ? { ...p, estado: 'pendiente' as EstadoPago } : p)
    );
    this.snack.open(`Pago #${pago.pedido_id} enviado a revisión`, 'OK', { duration: 3000 });
  }

  verComprobante(pago: Pago): void {
    // TODO: abrir dialog de comprobante o abrir URL
    this.snack.open(`Comprobante de #${pago.pedido_id}`, 'Cerrar', { duration: 3000 });
  }

  verDetallePedido(pago: Pago): void {
    // TODO: router.navigate(['/pedidos', pago.pedido_id])
  }

  copiarId(pago: Pago): void {
    navigator.clipboard.writeText(pago.pedido_id).then(() =>
      this.snack.open('ID copiado', 'OK', { duration: 2000 })
    );
  }

  agregarObservacion(pago: Pago): void {
    // TODO: abrir dialog de observación
  }

  exportar(): void {
    const rows = this.pagosFiltrados();
    const csv  = [
      ['Pedido', 'Cliente', 'Método', 'Monto', 'Estado', 'Fecha'].join(','),
      ...rows.map(p => [
        p.pedido_id, p.cliente_nombre, p.metodo,
        p.monto, p.estado, new Date(p.creado_en).toLocaleString('es-PE'),
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'pagos.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  // ── Helpers visuales ──────────────────────────────────────
  estadoLabel(e: EstadoPago): string {
    return { confirmado: 'Confirmado', pendiente: 'Por validar', rechazado: 'Rechazado', observado: 'Observado' }[e] ?? e;
  }

  estadoIcon(e: EstadoPago): string {
    return { confirmado: 'check_circle', pendiente: 'schedule', rechazado: 'cancel', observado: 'info' }[e] ?? 'info';
  }

  metodoLabel(m: MetodoPago): string {
    return { yape: 'Yape', plin: 'Plin', transferencia: 'Transferencia', efectivo: 'Efectivo', tarjeta: 'Tarjeta' }[m] ?? m;
  }

  metodoIcon(m: MetodoPago): string {
    return { yape: 'phone_android', plin: 'phone_android', transferencia: 'account_balance', efectivo: 'payments', tarjeta: 'credit_card' }[m] ?? 'payments';
  }

  avatarColor(iniciales: string): string {
    const colors = ['blue', 'pink', 'green', 'red', 'amber', 'purple'];
    const i = (iniciales.charCodeAt(0) + (iniciales.charCodeAt(1) ?? 0)) % colors.length;
    return colors[i];
  }
}