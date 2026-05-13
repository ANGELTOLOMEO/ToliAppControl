import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PedidosService } from '../../core/services/pedidos.service';
import { Pedido } from '../../core/models';

@Component({
  selector: 'app-pedidos-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TagModule],
  template: `
    <div class="page-container">
      <div class="card-container detalle-card pedidos-spacing">
        <div class="top-bar">
          <a routerLink="/pedidos" class="back-link"><i class="pi pi-arrow-left"></i> Volver a pedidos</a>
          <button pButton type="button" label="Recargar" icon="pi pi-refresh" severity="secondary" (click)="loadPedido()"></button>
        </div>

        @if (errorMessage()) {
          <div class="error-banner">{{ errorMessage() }}</div>
        }

        @if (pedido(); as p) {
          <div class="title-row">
            <h2><i class="pi pi-receipt"></i> {{ p.numero_pedido || p.id }}</h2>
            <p-tag [value]="p.estado_pedido" [icon]="getStatusIcon(p.estado_pedido)" [severity]="getSeverity(p.estado_pedido)"></p-tag>
          </div>

          <div class="grid">
            <div class="field">
              <span>ID Pedido</span>
              <strong>{{ p.id }}</strong>
            </div>
            <div class="field">
              <span>Cliente</span>
              <strong>{{ p.usuario_id }}</strong>
            </div>
            <div class="field">
              <span>Creado</span>
              <strong>{{ p.creado_en | date: 'dd/MM/yyyy HH:mm' }}</strong>
            </div>
            <div class="field">
              <span>Total</span>
              <strong>{{ p.total | currency: 'PEN':'S/ ' }}</strong>
            </div>
            <div class="field">
              <span>Subtotal</span>
              <strong>{{ p.subtotal | currency: 'PEN':'S/ ' }}</strong>
            </div>
            <div class="field">
              <span>Descuento</span>
              <strong>{{ p.descuento | currency: 'PEN':'S/ ' }}</strong>
            </div>
            <div class="field">
              <span>Estado de pago</span>
              <p-tag [value]="p.estado_pago || 'sin dato'" [icon]="getStatusIcon(p.estado_pago)" [severity]="getSeverity(p.estado_pago)"></p-tag>
            </div>
            <div class="field">
              <span>Estado de envio</span>
              <p-tag [value]="p.estado_envio || 'sin dato'" [icon]="getStatusIcon(p.estado_envio)" [severity]="getSeverity(p.estado_envio)"></p-tag>
            </div>
          </div>

          <div class="address">
            <h3><i class="pi pi-map-marker"></i> Direccion de envio</h3>
            <pre>{{ formatDireccion(p.direccion_envio) }}</pre>
          </div>
        } @else {
          <p>No se encontro informacion del pedido.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; animation: pageIn 260ms ease-out; }
    .pedidos-spacing { margin: 12px 0; }
    .detalle-card { display: flex; flex-direction: column; gap: 20px; }
    .top-bar { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
    .back-link { text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 7px; }
    .title-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
    .title-row h2 { margin: 0; letter-spacing: 0.01em; display: inline-flex; align-items: center; gap: 9px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .field { border: 1px solid var(--border-color, rgba(15, 23, 42, 0.1)); border-radius: 10px; padding: 12px 14px; background: var(--bg-primary, #fff); }
    .field span { display: block; font-size: 0.82rem; color: var(--text-secondary, #64748b); margin-bottom: 8px; letter-spacing: 0.01em; }
    .field strong { font-size: 1rem; color: var(--text-primary, #0f172a); line-height: 1.55; }
    .address { border: 1px solid var(--border-color, rgba(15, 23, 42, 0.1)); border-radius: 10px; padding: 14px; }
    .address h3 { margin: 0 0 10px; display: inline-flex; align-items: center; gap: 8px; }
    .address pre { margin: 0; white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; line-height: 1.6; }
    .error-banner { padding: 12px 14px; border-radius: 10px; color: #7f1d1d; background: #fee2e2; border: 1px solid #fecaca; line-height: 1.55; }
    .back-link i,
    .title-row i,
    .address i { color: var(--primary-color, #0ea5e9); }
    .field { animation: fadeUp 300ms ease both; }
    .field:nth-child(2) { animation-delay: 40ms; }
    .field:nth-child(3) { animation-delay: 80ms; }
    .field:nth-child(4) { animation-delay: 120ms; }
    .field:nth-child(5) { animation-delay: 160ms; }
    .field:nth-child(6) { animation-delay: 200ms; }
    .field:nth-child(7) { animation-delay: 240ms; }
    .field:nth-child(8) { animation-delay: 280ms; }
    @keyframes pageIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 860px) { .grid { grid-template-columns: 1fr; } }
  `]
})
export class PedidosFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly pedidosService = inject(PedidosService);

  protected readonly pedido = signal<Pedido | null>(null);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadPedido();
  }

  protected loadPedido(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('No se recibio el ID del pedido');
      return;
    }

    this.errorMessage.set('');
    this.pedidosService.getById(id).subscribe({
      next: (pedido) => this.pedido.set(pedido),
      error: (error: Error) => {
        this.pedido.set(null);
        this.errorMessage.set(error.message || 'No se pudo cargar el pedido');
      }
    });
  }

  protected formatDireccion(value: unknown): string {
    if (!value) return 'Sin direccion registrada';
    if (typeof value === 'string') return value;

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return 'Formato de direccion no valido';
    }
  }

  protected getSeverity(status?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const value = (status || '').toUpperCase();
    if (value.includes('CANCEL') || value.includes('RECHAZ')) return 'danger';
    if (value.includes('PEND')) return 'warn';
    if (value.includes('ENVI')) return 'info';
    if (value.includes('ENTREG') || value.includes('CONFIRM') || value.includes('PAG')) return 'success';
    return 'secondary';
  }

  protected getStatusIcon(status?: string): string {
    const value = (status || '').toUpperCase();
    if (value.includes('CANCEL') || value.includes('RECHAZ')) return 'pi pi-times-circle';
    if (value.includes('PEND')) return 'pi pi-clock';
    if (value.includes('ENVI')) return 'pi pi-truck';
    if (value.includes('ENTREG')) return 'pi pi-check-square';
    if (value.includes('CONFIRM')) return 'pi pi-check-circle';
    if (value.includes('PAG')) return 'pi pi-wallet';
    return 'pi pi-info-circle';
  }
}
