import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PedidosService } from '../../core/services/pedidos.service';
import { Pedido } from '../../core/models';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TableModule, TagModule, ButtonModule, InputTextModule, SelectModule],
  template: `
    <div class="page-container">
      <div class="card-container pedidos-shell pedidos-spacing">
        <!-- Hero Section -->
        <div class="hero">
          <div class="hero-badge">
            <i class="pi pi-shopping-bag" style="font-size: 14px;"></i>
            Operación comercial
          </div>
          <h2><i class="pi pi-shopping-cart"></i> Pedidos</h2>
          <p>Gestiona todos los pedidos de tu tienda</p>
        </div>

        <div class="hero-action-stack">
          <span class="soft-chip"><i class="pi pi-database"></i> {{ pedidos().length }} registros</span>
          <span class="soft-chip"><i class="pi pi-clock"></i> {{ pendientesCount() }} pendientes</span>
          <button pButton type="button" label="Actualizar" icon="pi pi-refresh" severity="secondary" (click)="loadPedidos()"></button>
        </div>

        <div class="kpis">
          <div class="kpi">
            <span><i class="pi pi-box"></i> Total</span>
            <strong>{{ pedidos().length }}</strong>
          </div>
          <div class="kpi">
            <span><i class="pi pi-clock"></i> Pendientes</span>
            <strong>{{ pendientesCount() }}</strong>
          </div>
          <div class="kpi">
            <span><i class="pi pi-check-circle"></i> Confirmados</span>
            <strong>{{ confirmadosCount() }}</strong>
          </div>
          <div class="kpi">
            <span><i class="pi pi-wallet"></i> Monto filtrado</span>
            <strong>{{ filteredTotal() | currency: 'PEN':'S/ ' }}</strong>
          </div>
        </div>

        <div class="filters-panel">
          <input
            pInputText
            type="text"
            placeholder="Buscar por nro o cliente (ID usuario)"
            [(ngModel)]="searchTerm"
            class="search-input"
          />
          <p-select
            [options]="estadoOptions"
            optionLabel="label"
            optionValue="value"
            [(ngModel)]="selectedEstado"
            placeholder="Estado"
            class="estado-select"
          ></p-select>
        </div>

        @if (errorMessage()) {
          <div class="error-banner">{{ errorMessage() }}</div>
        }

        <p-table
          [value]="filteredPedidos()"
          [rows]="10"
          [paginator]="true"
          [rowHover]="true"
          dataKey="id"
          [tableStyle]="{ 'min-width': '64rem' }"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pedidos"
          [showCurrentPageReport]="true"
          [rowsPerPageOptions]="[10, 20, 30]"
        >
          <ng-template #header>
            <tr>
              <th>Nro Pedido</th>
              <th>Cliente</th>
              <th>Creado</th>
              <th>Total</th>
              <th>Pago</th>
              <th>Envio</th>
              <th>Estado</th>
              <th style="width: 7rem"></th>
            </tr>
          </ng-template>

          <ng-template #body let-pedido>
            <tr>
              <td class="mono">{{ pedido.numero_pedido || pedido.id }}</td>
              <td>{{ pedido.usuario_id }}</td>
              <td>{{ pedido.creado_en | date: 'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ pedido.total | currency: 'PEN':'S/ ' }}</td>
              <td>
                <p-tag [value]="pedido.estado_pago || 'sin dato'" [icon]="getStatusIcon(pedido.estado_pago)" [severity]="getSeverity(pedido.estado_pago)"></p-tag>
              </td>
              <td>
                <p-tag [value]="pedido.estado_envio || 'sin dato'" [icon]="getStatusIcon(pedido.estado_envio)" [severity]="getSeverity(pedido.estado_envio)"></p-tag>
              </td>
              <td>
                <p-tag [value]="pedido.estado_pedido" [icon]="getStatusIcon(pedido.estado_pedido)" [severity]="getSeverity(pedido.estado_pedido)"></p-tag>
              </td>
              <td>
                <a [routerLink]="['/pedidos', pedido.id]" class="detail-link"><i class="pi pi-eye"></i> Ver</a>
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
              <td colspan="8">
                <div class="empty-state">
                  <i class="pi pi-inbox"></i>
                  <div class="empty-title">Sin pedidos para esta consulta</div>
                  <div class="empty-subtitle">Prueba ajustando el texto de busqueda o el estado seleccionado.</div>
                </div>
              </td>
            </tr>
          </ng-template>

        </p-table>
      </div>
    </div>
  `,
  styles: [`
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

    .pedidos-spacing { margin: 0; }
    .pedidos-shell { display: flex; flex-direction: column; gap: 32px; max-width: 1600px; margin: 0 auto; width: 100%; padding: 24px 32px; box-sizing: border-box; }
    .pedidos-hero { 
      padding: 0; 
      display: flex; 
      flex-direction: column; 
      gap: 8px;
      justify-content: flex-start;
      align-items: flex-start;
    }

    .hero {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, var(--accent-soft) 0%, rgba(16,185,129,0.08) 100%);
      border: 1px solid rgba(16,185,129,0.2);
      border-radius: 999px;
      padding: 5px 14px 5px 10px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #065f46;
      width: fit-content;
    }

    .hero p { 
      margin: 4px 0 0; 
      color: var(--text-tertiary); 
      font-size: 0.9375rem; 
    }

    h2 { 
      margin: 0; font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; 
      display: inline-flex; align-items: center; gap: 12px; color: var(--text-primary);
    }

    h2 i { 
      width: 44px; height: 44px; border-radius: 12px;
      display: inline-flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: #2563eb !important;
      font-size: 1.1rem;
    }
    
    .hero-action-stack { 
      display: flex; 
      flex-wrap: wrap; 
      gap: 10px; 
      align-items: center; 
      margin-top: 12px;
    }
    
    .hero-action-stack .soft-chip i { color: inherit; }

    .feature-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: linear-gradient(135deg, var(--accent-soft) 0%, rgba(16,185,129,0.08) 100%);
      border: 1px solid rgba(16,185,129,0.2);
      border-radius: 999px; padding: 5px 14px 5px 10px;
      font-size: 0.75rem; font-weight: 600;
      color: #065f46;
      width: fit-content;
    }

    h2 { 
      margin: 0; font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; 
      display: inline-flex; align-items: center; gap: 12px; color: var(--text-primary);
    }

    h2 i { 
      width: 44px; height: 44px; border-radius: 12px;
      display: inline-flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: #2563eb !important;
      font-size: 1.1rem;
    }

    p { margin: 4px 0 0; color: var(--text-tertiary); line-height: 1.55; font-size: 0.9375rem; }

    .hero-action-stack .soft-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 8px;
      background: var(--bg-secondary);
      border: 1px solid rgba(15,23,42,0.08);
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .hero-action-stack .soft-chip i {
      font-size: 0.875rem;
    }

    :host ::ng-deep .hero-action-stack .p-button {
      border-radius: 8px !important;
      font-size: 0.8125rem;
      height: 36px;
    }

    .kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }

    .kpi { 
      border: 1px solid rgba(15,23,42,0.06); border-radius: 16px; 
      padding: 20px; background: var(--bg-primary);
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      transition: all 0.2s cubic-bezier(.4,0,.2,1);
      animation: fadeUp 380ms cubic-bezier(.2,.7,.2,1) both;
    }

    .kpi:hover {
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      transform: translateY(-2px);
    }

    .kpi:nth-child(2) { animation-delay: 60ms; }
    .kpi:nth-child(3) { animation-delay: 120ms; }
    .kpi:nth-child(4) { animation-delay: 180ms; }

    .kpi span { 
      display: inline-flex; align-items: center; gap: 8px; font-size: 0.75rem; 
      color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600;
      margin-bottom: 8px;
    }

    .kpi strong { font-size: 1.625rem; font-weight: 800; color: var(--text-primary); line-height: 1.1; letter-spacing: -0.025em; }

    .kpi i {
      width: 40px; height: 40px; border-radius: 10px;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 1rem;
    }

    .kpi:nth-child(1) i { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #2563eb; }
    .kpi:nth-child(2) i { background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%); color: #d97706; }
    .kpi:nth-child(3) i { background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); color: #059669; }
    .kpi:nth-child(4) i { background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); color: #db2777; }

    .filters-panel { 
      display: grid; grid-template-columns: 1fr 260px; gap: 12px;
      padding: 16px; border-radius: 16px; border: 1px solid rgba(15,23,42,0.06); 
      background: var(--bg-primary);
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    :host ::ng-deep .filters-panel .search-input { width: 100%; }
    :host ::ng-deep .filters-panel .estado-select { width: 100%; }

    .error-banner { padding: 14px 16px; border-radius: 12px; color: #dc2626; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 1px solid rgba(220,38,38,0.2); line-height: 1.55; }

    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .detail-link { font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }

    .empty-state { padding: 64px 24px; display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; color: var(--text-tertiary); background: var(--bg-primary); border-radius: 16px; }
    .empty-state i { font-size: 3rem; opacity: 0.3; }
    .empty-title { font-weight: 800; color: var(--text-primary); font-size: 1.125rem; }
    .empty-subtitle { font-size: 0.9375rem; color: var(--text-secondary); }

    :host ::ng-deep .p-datatable {
      background: transparent !important;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(15,23,42,0.06);
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }

    :host ::ng-deep .p-datatable .p-datatable-header {
      background: var(--bg-primary) !important;
      border-bottom: 1px solid rgba(15,23,42,0.06);
      padding: 16px;
    }

    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%) !important;
      color: var(--text-tertiary) !important;
      font-size: 0.6875rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.05em;
      padding: 14px 16px !important;
      border-color: rgba(15,23,42,0.06) !important;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr {
      background: transparent !important;
      transition: all 0.15s ease;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      color: var(--text-primary) !important;
      padding: 14px 16px !important;
      border-bottom: 1px solid rgba(15,23,42,0.04) !important;
      font-size: 0.875rem;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
      background: rgba(16,185,129,0.04) !important;
      transform: none;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr:nth-child(even) {
      background: rgba(15,23,42,0.015);
    }

    :host ::ng-deep .p-paginator {
      background: var(--bg-primary) !important;
      border-top: 1px solid rgba(15,23,42,0.06);
      padding: 12px 16px;
    }

    :host ::ng-deep .p-inputtext,
    :host ::ng-deep .p-select {
      min-height: 42px;
      border-radius: 10px !important;
      font-size: 0.875rem;
    }

    :host ::ng-deep .p-inputtext:focus,
    :host ::ng-deep .p-select:focus {
      box-shadow: 0 0 0 3px rgba(16,185,129,0.15) !important;
      border-color: #10b981 !important;
    }

    @keyframes pageIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 1024px) {
      .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 640px) {
      .kpis { grid-template-columns: minmax(0, 1fr); }
      .filters-panel { grid-template-columns: 1fr; }
      .filters { grid-template-columns: 1fr; }
      h2 { font-size: 1.5rem; }
    }

    :host-context(.dark) {
      :host ::ng-deep .p-datatable { background: #1e293b !important; border-color: rgba(148,163,184,0.12) !important; }
      :host ::ng-deep .p-datatable .p-datatable-thead > tr > th { background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%) !important; color: #64748b !important; }
      :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td { color: #f1f5f9 !important; border-color: rgba(148,163,184,0.08) !important; }
      :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover { background: rgba(52,211,153,0.06) !important; }
      :host ::ng-deep .p-paginator { background: #1e293b !important; }
    }
  `]
})
export class PedidosListComponent implements OnInit {
  private readonly pedidosService = inject(PedidosService);

  protected readonly pedidos = signal<Pedido[]>([]);
  protected readonly errorMessage = signal('');

  protected searchTerm = '';
  protected selectedEstado = '';

  protected readonly estadoOptions = [
    { label: 'Todos', value: '' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Confirmado', value: 'confirmado' },
    { label: 'Cancelado', value: 'cancelado' },
    { label: 'Enviado', value: 'enviado' },
    { label: 'Entregado', value: 'entregado' }
  ];

  protected readonly filteredPedidos = computed(() => {
    const term = this.searchTerm.trim().toLowerCase();
    const estado = this.selectedEstado;

    return this.pedidos().filter((pedido) => {
      const matchEstado = !estado || (pedido.estado_pedido || '').toLowerCase() === estado;
      if (!matchEstado) return false;
      if (!term) return true;

      const numero = (pedido.numero_pedido || pedido.id || '').toLowerCase();
      const usuario = (pedido.usuario_id || '').toLowerCase();
      return numero.includes(term) || usuario.includes(term);
    });
  });

  protected readonly pendientesCount = computed(() => this.pedidos().filter((p) => this.normalize(p.estado_pedido).includes('PEND')).length);
  protected readonly confirmadosCount = computed(() => this.pedidos().filter((p) => this.normalize(p.estado_pedido).includes('CONFIRM')).length);
  protected readonly filteredTotal = computed(() => this.filteredPedidos().reduce((sum, p) => sum + (p.total || 0), 0));

  ngOnInit(): void {
    this.loadPedidos();
  }

  protected loadPedidos(): void {
    this.errorMessage.set('');
    this.pedidosService.list({ sort: '-creado_en', limit: 150 }).subscribe({
      next: (data) => this.pedidos.set(data),
      error: (error: Error) => {
        this.pedidos.set([]);
        this.errorMessage.set(error.message || 'No se pudo cargar pedidos');
      }
    });
  }

  protected getSeverity(status?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const value = this.normalize(status);
    if (value.includes('CANCEL') || value.includes('RECHAZ')) return 'danger';
    if (value.includes('PEND')) return 'warn';
    if (value.includes('ENVI')) return 'info';
    if (value.includes('ENTREG') || value.includes('CONFIRM') || value.includes('PAG')) return 'success';
    return 'secondary';
  }

  protected getStatusIcon(status?: string): string {
    const value = this.normalize(status);
    if (value.includes('CANCEL') || value.includes('RECHAZ')) return 'pi pi-times-circle';
    if (value.includes('PEND')) return 'pi pi-clock';
    if (value.includes('ENVI')) return 'pi pi-truck';
    if (value.includes('ENTREG')) return 'pi pi-check-square';
    if (value.includes('CONFIRM')) return 'pi pi-check-circle';
    if (value.includes('PAG')) return 'pi pi-wallet';
    return 'pi pi-info-circle';
  }

  private normalize(value?: string): string {
    return (value || '').toUpperCase();
  }
}
