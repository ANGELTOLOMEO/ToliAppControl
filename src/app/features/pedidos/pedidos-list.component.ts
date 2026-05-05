import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule, ButtonModule, RippleModule, TagModule],
  template: `
    <div class="page-container">
      <div class="card">
        <div class="card-title">Pedidos - Row Expansion</div>

        <p-table
          [value]="pedidos"
          dataKey="id"
          [tableStyle]="{ 'min-width': '60rem' }"
          [expandedRowKeys]="expandedRows"
        >
          <ng-template #caption>
            <p-button
              [icon]="isExpanded ? 'pi pi-minus' : 'pi pi-plus'"
              [label]="isExpanded ? 'Contraer todo' : 'Expandir todo'"
              (onClick)="expandAll()"
            />
            <div class="table-header"></div>
          </ng-template>

          <ng-template #header>
            <tr>
              <th style="width: 5rem"></th>
              <th pSortableColumn="id">
                Pedido
                <p-sortIcon field="id" />
              </th>
              <th pSortableColumn="cliente">
                Cliente
                <p-sortIcon field="cliente" />
              </th>
              <th pSortableColumn="fecha">
                Fecha
                <p-sortIcon field="fecha" />
              </th>
              <th pSortableColumn="total">
                Total
                <p-sortIcon field="total" />
              </th>
              <th pSortableColumn="canal">
                Canal
                <p-sortIcon field="canal" />
              </th>
              <th pSortableColumn="estado">
                Estado
                <p-sortIcon field="estado" />
              </th>
            </tr>
          </ng-template>

          <ng-template #body let-pedido let-expanded="expanded">
            <tr>
              <td>
                <p-button
                  type="button"
                  pRipple
                  [pRowToggler]="pedido"
                  [text]="true"
                  [rounded]="true"
                  [plain]="true"
                  [icon]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                />
              </td>
              <td class="mono">{{ pedido.id }}</td>
              <td>{{ pedido.cliente }}</td>
              <td>{{ pedido.fecha | date: 'shortDate' }}</td>
              <td>{{ pedido.total | currency: 'PEN' }}</td>
              <td>{{ pedido.canal }}</td>
              <td>
                <p-tag [value]="pedido.estado" [severity]="getSeverity(pedido.estado)" />
              </td>
            </tr>
          </ng-template>

          <ng-template #expandedrow let-pedido>
            <tr>
              <td colspan="7">
                <div class="expanded">
                  <div class="expanded-header">
                    <div class="expanded-title">Detalle del pedido {{ pedido.id }}</div>
                    <button
                      pButton
                      type="button"
                      icon="pi pi-search"
                      class="p-button-text"
                      [routerLink]="['/pedidos', pedido.id]"
                    >
                    </button>
                  </div>

                  <p-table [value]="pedido.items" dataKey="id" [tableStyle]="{ 'min-width': '40rem' }">
                    <ng-template #header>
                      <tr>
                        <th pSortableColumn="id">
                          Item
                          <p-sortIcon field="id" />
                        </th>
                        <th pSortableColumn="producto">
                          Producto
                          <p-sortIcon field="producto" />
                        </th>
                        <th pSortableColumn="cantidad">
                          Cantidad
                          <p-sortIcon field="cantidad" />
                        </th>
                        <th pSortableColumn="precio">
                          Precio
                          <p-sortIcon field="precio" />
                        </th>
                        <th pSortableColumn="subtotal">
                          Subtotal
                          <p-sortIcon field="subtotal" />
                        </th>
                        <th pSortableColumn="estado">
                          Estado
                          <p-sortIcon field="estado" />
                        </th>
                      </tr>
                    </ng-template>

                    <ng-template #body let-item>
                      <tr>
                        <td class="mono">{{ item.id }}</td>
                        <td>{{ item.producto }}</td>
                        <td>{{ item.cantidad }}</td>
                        <td>{{ item.precio | currency: 'PEN' }}</td>
                        <td>{{ item.cantidad * item.precio | currency: 'PEN' }}</td>
                        <td>
                          <p-tag [value]="item.estado" [severity]="getSeverity(item.estado)" />
                        </td>
                      </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                      <tr>
                        <td colspan="6">No hay items para este pedido.</td>
                      </tr>
                    </ng-template>
                  </p-table>
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
    }

    .card {
      background: var(--bg-secondary, #ffffff);
      border-radius: 16px;
      border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      padding: 22px;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
    }

    .card-title {
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--text-primary, #0f172a);
      margin-bottom: 14px;
    }

    .table-header {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      width: 100%;
    }

    .expanded {
      padding: 14px 10px;
      background: rgba(15, 23, 42, 0.02);
      border-radius: 14px;
    }

    :host-context(.dark) .expanded {
      background: rgba(148, 163, 184, 0.10);
    }

    .expanded-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
    }

    .expanded-title {
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }

    .mono {
      font-variant-numeric: tabular-nums;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    }
  `]
})
export class PedidosListComponent {
  protected expandedRows: Record<string, boolean> = {};

  protected readonly pedidos: PedidoRow[] = [
    {
      id: 'PED-0001',
      cliente: 'María Pérez',
      fecha: new Date('2026-05-01T10:30:00'),
      total: 189.9,
      canal: 'Online',
      estado: 'PENDIENTE',
      items: [
        { id: 'IT-01', producto: 'Polo básico', cantidad: 2, precio: 49.95, estado: 'CONFIRMADO' },
        { id: 'IT-02', producto: 'Casaca', cantidad: 1, precio: 90.0, estado: 'PENDIENTE' }
      ]
    },
    {
      id: 'PED-0002',
      cliente: 'Carlos Rojas',
      fecha: new Date('2026-05-02T14:10:00'),
      total: 79.0,
      canal: 'Tienda',
      estado: 'ENVIADO',
      items: [{ id: 'IT-01', producto: 'Polo azul', cantidad: 1, precio: 79.0, estado: 'ENVIADO' }]
    },
    {
      id: 'PED-0003',
      cliente: 'Ana Torres',
      fecha: new Date('2026-05-03T09:05:00'),
      total: 0,
      canal: 'Online',
      estado: 'CANCELADO',
      items: []
    }
  ];

  protected get isExpanded(): boolean {
    return this.pedidos.length > 0 && Object.keys(this.expandedRows).length === this.pedidos.length;
  }

  protected expandAll(): void {
    if (this.isExpanded) {
      this.expandedRows = {};
      return;
    }

    const next: Record<string, boolean> = {};
    for (const pedido of this.pedidos) {
      next[pedido.id] = true;
    }
    this.expandedRows = next;
  }

  protected getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const normalized = status?.toUpperCase?.() ?? '';

    if (normalized.includes('CANCEL')) return 'danger';
    if (normalized.includes('ENTREG')) return 'success';
    if (normalized.includes('ENVI')) return 'info';
    if (normalized.includes('PEND')) return 'warn';
    if (normalized.includes('CONFIRM')) return 'success';

    return 'secondary';
  }
}

interface PedidoItemRow {
  id: string;
  producto: string;
  cantidad: number;
  precio: number;
  estado: string;
}

interface PedidoRow {
  id: string;
  cliente: string;
  fecha: Date;
  total: number;
  canal: string;
  estado: string;
  items: PedidoItemRow[];
}
