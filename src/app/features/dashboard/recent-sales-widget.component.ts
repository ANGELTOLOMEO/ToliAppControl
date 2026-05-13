import { Component, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

interface RecentSaleProduct {
  name: string;
  price: number;
  image: string;
}

@Component({
  standalone: true,
  selector: 'app-recent-sales-widget',
  imports: [CommonModule, TableModule, ButtonModule, RippleModule, CurrencyPipe],
  template: `
    <section class="recent-sales-card">
      <div class="header">
        <div>
          <div class="kicker">Ventas</div>
          <div class="title">Recent Sales</div>
        </div>
        <div class="pill">Last 30 days</div>
      </div>

      <p-table [value]="products()" [paginator]="true" [rows]="5" responsiveLayout="scroll">
        <ng-template #header>
          <tr>
            <th>Image</th>
            <th pSortableColumn="name">Name <p-sortIcon field="name"></p-sortIcon></th>
            <th pSortableColumn="price">Price <p-sortIcon field="price"></p-sortIcon></th>
            <th>Status</th>
            <th>View</th>
          </tr>
        </ng-template>
        <ng-template #body let-product>
          <tr>
            <td style="width: 15%; min-width: 5rem;">
              <img [src]="product.image" class="product-image" [alt]="product.name" width="50" />
            </td>
            <td style="width: 35%; min-width: 7rem;">{{ product.name }}</td>
            <td style="width: 35%; min-width: 8rem;">{{ product.price | currency: 'USD' }}</td>
            <td style="width: 15%; min-width: 7rem;">
              <span class="status-chip">Completed</span>
            </td>
            <td style="width: 15%;">
              <button pButton pRipple type="button" icon="pi pi-search" class="p-button-text p-button-icon-only"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      margin-top: 18px;
    }

    .recent-sales-card {
      border-radius: 20px;
      border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      background:
        radial-gradient(900px 280px at 115% -40%, color-mix(in srgb, var(--accent-primary, #10b981) 11%, transparent), transparent 58%),
        var(--bg-secondary, #ffffff);
      box-shadow: 0 16px 38px rgba(15, 23, 42, 0.1);
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      border-bottom: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      padding-bottom: 12px;
    }

    .kicker {
      font-size: 0.75rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-tertiary, #64748b);
      font-weight: 700;
    }

    .title {
      font-size: 1.12rem;
      font-weight: 800;
      color: var(--text-primary, #0f172a);
      margin-top: 2px;
    }

    .pill {
      border: 1px solid color-mix(in srgb, var(--app-primary, #0ea5e9) 35%, rgba(15, 23, 42, 0.12));
      color: var(--text-secondary, #475569);
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 700;
      background: color-mix(in srgb, var(--app-primary, #0ea5e9) 8%, #ffffff);
    }

    .product-image {
      border-radius: 11px;
      box-shadow: 0 10px 20px rgba(15, 23, 42, 0.18);
      object-fit: cover;
    }

    .status-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 0.76rem;
      font-weight: 700;
      background: color-mix(in srgb, #22c55e 14%, transparent);
      color: #15803d;
      border: 1px solid color-mix(in srgb, #22c55e 30%, transparent);
    }

    :host ::ng-deep .p-datatable {
      border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      border-radius: 14px;
      overflow: hidden;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
    }

    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      background: color-mix(in srgb, var(--app-primary, #0ea5e9) 7%, #ffffff);
      color: var(--text-primary, #0f172a);
      font-weight: 800;
      font-size: 0.83rem;
      border-color: var(--border-color, rgba(15, 23, 42, 0.08));
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr {
      transition: background-color 180ms ease;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
      background: color-mix(in srgb, var(--accent-primary, #10b981) 6%, transparent);
    }

    :host ::ng-deep .p-paginator {
      border: 0;
      border-top: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      background: transparent;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class RecentSalesWidget {
  protected readonly products = signal<RecentSaleProduct[]>([
    { name: 'Space T-Shirt', price: 28, image: 'https://primefaces.org/cdn/primevue/images/product/bamboo-watch.jpg' },
    { name: 'Portal Sticker', price: 8, image: 'https://primefaces.org/cdn/primevue/images/product/blue-t-shirt.jpg' },
    { name: 'Supernova Sticker', price: 11, image: 'https://primefaces.org/cdn/primevue/images/product/black-watch.jpg' },
    { name: 'Wonders Notebook', price: 16, image: 'https://primefaces.org/cdn/primevue/images/product/black-watch.jpg' },
    { name: 'Mat Black Case', price: 22, image: 'https://primefaces.org/cdn/primevue/images/product/blue-band.jpg' },
    { name: 'Robots T-Shirt', price: 35, image: 'https://primefaces.org/cdn/primevue/images/product/brown-purse.jpg' }
  ]);
}
