import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

interface EnvioRow {
  id: string;
  pedido: string;
  cliente: string;
  courier: string;
  guia: string;
  fecha: string;
  estado: string;
}

@Component({
  selector: 'app-envios-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TableModule, TagModule, ButtonModule, InputTextModule, SelectModule],
  template: `
<div class="page-container">
      <div class="card-container envios-shell envios-spacing">
        <!-- Hero Section -->
        <div class="hero">
          <div class="hero-badge">
            <i class="pi pi-box" style="font-size: 14px;"></i>
            Logística
          </div>
          <h2><i class="pi pi-truck"></i> Envíos</h2>
          <p>Seguimiento y gestión de deliveries</p>
        </div>

        <div class="kpis">
          <div class="kpi"><span><i class="pi pi-box"></i> Total</span><strong>{{ envios().length }}</strong></div>
          <div class="kpi"><span><i class="pi pi-clock"></i> Pendientes</span><strong>{{ pendientesCount() }}</strong></div>
          <div class="kpi"><span><i class="pi pi-send"></i> En ruta</span><strong>{{ enRutaCount() }}</strong></div>
          <div class="kpi"><span><i class="pi pi-check-circle"></i> Entregados</span><strong>{{ entregadosCount() }}</strong></div>
        </div>

        <div class="filters">
          <input pInputText type="text" placeholder="Buscar por guia, pedido o cliente" [(ngModel)]="searchTerm" />
          <p-select [options]="estadoOptions" optionLabel="label" optionValue="value" [(ngModel)]="selectedEstado" placeholder="Estado"></p-select>
        </div>

        <p-table
          [value]="filteredEnvios()"
          [rows]="10"
          [paginator]="true"
          [rowHover]="true"
          dataKey="id"
          [tableStyle]="{ 'min-width': '68rem' }"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} envios"
          [showCurrentPageReport]="true"
          [rowsPerPageOptions]="[10, 20, 30]"
        >
          <ng-template #header>
            <tr>
              <th>Guia</th>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Courier</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th style="width: 7rem"></th>
            </tr>
          </ng-template>
          <ng-template #body let-envio>
            <tr>
              <td class="mono">{{ envio.guia }}</td>
              <td class="mono">{{ envio.pedido }}</td>
              <td>{{ envio.cliente }}</td>
              <td>{{ envio.courier }}</td>
              <td>{{ envio.fecha | date: 'dd/MM/yyyy HH:mm' }}</td>
              <td><p-tag [value]="envio.estado" [icon]="getStatusIcon(envio.estado)" [severity]="getSeverity(envio.estado)"></p-tag></td>
              <td><a [routerLink]="['/envios', envio.id]" class="detail-link"><i class="pi pi-eye"></i> Ver</a></td>
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

    .envios-spacing { margin: 0; }
    .envios-shell { display: flex; flex-direction: column; gap: 32px; max-width: 1600px; margin: 0 auto; width: 100%; padding: 24px 32px; box-sizing: border-box; }
    .header { 
      display: flex; 
      flex-direction: column; 
      gap: 12px;
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
      margin-bottom: 8px;
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
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      color: #d97706 !important;
      font-size: 1.1rem;
    }

    .feature-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: linear-gradient(135deg, var(--accent-soft) 0%, rgba(16,185,129,0.08) 100%);
      border: 1px solid rgba(16,185,129,0.2);
      border-radius: 999px; padding: 5px 14px 5px 10px;
      font-size: 0.75rem; font-weight: 600;
      color: #065f46;
      width: fit-content;
      margin-bottom: 8px;
    }

    h2 { 
      margin: 0; font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; 
      display: inline-flex; align-items: center; gap: 12px; color: var(--text-primary);
    }

    h2 i { 
      width: 44px; height: 44px; border-radius: 12px;
      display: inline-flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      color: #d97706 !important;
      font-size: 1.1rem;
    }

    p { margin: 4px 0 0; color: var(--text-tertiary); line-height: 1.55; font-size: 0.9375rem; }

    :host ::ng-deep .header .p-button {
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

    .kpi:nth-child(1) i { background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%); color: #d97706; }
    .kpi:nth-child(2) i { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); color: #2563eb; }
    .kpi:nth-child(3) i { background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); color: #059669; }
    .kpi:nth-child(4) i { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); color: #dc2626; }

    .filters { display: grid; grid-template-columns: 1fr 260px; gap: 12px; margin-top: 8px; }

    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .detail-link { font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }

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
    }

    :host ::ng-deep .p-paginator {
      background: var(--bg-primary) !important;
      border-top: 1px solid rgba(15,23,42,0.06);
      padding: 12px 16px;
    }

    :host ::ng-deep .p-inputtext, :host ::ng-deep .p-select {
      min-height: 42px;
      border-radius: 10px !important;
      font-size: 0.875rem;
    }

    :host ::ng-deep .p-inputtext:focus, :host ::ng-deep .p-select:focus {
      box-shadow: 0 0 0 3px rgba(16,185,129,0.15) !important;
      border-color: #10b981 !important;
    }

    @keyframes pageIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 1024px) {
      .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 640px) {
      .kpis { grid-template-columns: minmax(0, 1fr); }
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
export class EnviosListComponent {
  protected searchTerm = '';
  protected selectedEstado = '';

  protected readonly estadoOptions = [
    { label: 'Todos', value: '' },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'En ruta', value: 'EN RUTA' },
    { label: 'Entregado', value: 'ENTREGADO' },
    { label: 'Incidencia', value: 'INCIDENCIA' }
  ];

  protected readonly envios = signal<EnvioRow[]>([
    { id: 'ENV-1', pedido: 'PED-1044', cliente: 'Maria Perez', courier: 'Olva', guia: 'OLV-99218', fecha: '2026-05-04T10:35:00', estado: 'EN RUTA' },
    { id: 'ENV-2', pedido: 'PED-1045', cliente: 'Carlos Diaz', courier: 'Shalom', guia: 'SHA-11872', fecha: '2026-05-04T11:10:00', estado: 'PENDIENTE' },
    { id: 'ENV-3', pedido: 'PED-1048', cliente: 'Ana Torres', courier: 'Olva', guia: 'OLV-99244', fecha: '2026-05-04T14:40:00', estado: 'ENTREGADO' },
    { id: 'ENV-4', pedido: 'PED-1050', cliente: 'Luis Ramos', courier: 'Urbano', guia: 'URB-70912', fecha: '2026-05-05T09:25:00', estado: 'INCIDENCIA' }
  ]);

  protected readonly filteredEnvios = computed(() => {
    const term = this.searchTerm.trim().toLowerCase();
    const estado = this.selectedEstado;
    return this.envios().filter((e) => {
      const matchEstado = !estado || e.estado === estado;
      if (!matchEstado) return false;
      if (!term) return true;
      return e.guia.toLowerCase().includes(term) || e.pedido.toLowerCase().includes(term) || e.cliente.toLowerCase().includes(term);
    });
  });

  protected readonly pendientesCount = computed(() => this.envios().filter((e) => e.estado === 'PENDIENTE').length);
  protected readonly enRutaCount = computed(() => this.envios().filter((e) => e.estado === 'EN RUTA').length);
  protected readonly entregadosCount = computed(() => this.envios().filter((e) => e.estado === 'ENTREGADO').length);

  protected getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (status.includes('INCID')) return 'danger';
    if (status.includes('PEND')) return 'warn';
    if (status.includes('RUTA')) return 'info';
    if (status.includes('ENTREG')) return 'success';
    return 'secondary';
  }

  protected getStatusIcon(status: string): string {
    if (status.includes('INCID')) return 'pi pi-exclamation-triangle';
    if (status.includes('PEND')) return 'pi pi-clock';
    if (status.includes('RUTA')) return 'pi pi-truck';
    if (status.includes('ENTREG')) return 'pi pi-check-circle';
    return 'pi pi-info-circle';
  }
}
