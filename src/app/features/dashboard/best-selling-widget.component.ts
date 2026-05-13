import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

interface BestSellingItem {
  name: string;
  category: string;
  percent: number;
  color: string;
}

@Component({
  standalone: true,
  selector: 'app-best-selling-widget',
  imports: [CommonModule, ButtonModule, MenuModule],
  template: `
    <section class="best-selling-card">
      <div class="widget-header">
        <div>
          <div class="widget-kicker">Rendimiento</div>
          <div class="widget-title">Best Selling Products</div>
        </div>
        <div>
          <button
            pButton
            type="button"
            icon="pi pi-ellipsis-v"
            class="p-button-rounded p-button-text p-button-plain"
            (click)="menu.toggle($event)"
          ></button>
          <p-menu #menu [popup]="true" [model]="items"></p-menu>
        </div>
      </div>

      <ul class="selling-list">
        @for (product of products; track product.name) {
          <li class="selling-row">
            <div class="product-info">
              <span class="product-name">{{ product.name }}</span>
              <span class="product-category">{{ product.category }}</span>
            </div>
            <div class="progress-wrap">
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" [style.width.%]="product.percent" [style.background]="product.color"></div>
              </div>
              <span class="progress-value" [style.color]="product.color">{{ product.percent }}%</span>
            </div>
          </li>
        }
      </ul>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      animation: widgetIn 300ms ease-out;
    }

    .best-selling-card {
      margin-top: 18px;
      border-radius: 18px;
      border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      background:
        radial-gradient(900px 280px at 120% -45%, color-mix(in srgb, var(--app-primary, #0ea5e9) 9%, transparent), transparent 60%),
        var(--bg-secondary, #ffffff);
      box-shadow: 0 14px 34px rgba(15, 23, 42, 0.1);
      padding: 20px;
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      padding-bottom: 12px;
    }

    .widget-kicker {
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-tertiary, #64748b);
    }

    .widget-title {
      font-size: 1.12rem;
      font-weight: 800;
      color: var(--text-primary, #0f172a);
      margin-top: 2px;
    }

    .selling-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .selling-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 220px;
      gap: 12px;
      align-items: center;
      padding: 10px 12px;
      border-radius: 12px;
      transition: background-color 180ms ease, transform 180ms ease;
    }

    .selling-row:hover {
      background: color-mix(in srgb, var(--app-primary, #0ea5e9) 7%, transparent);
      transform: translateY(-1px);
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .product-name {
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      line-height: 1.2;
    }

    .product-category {
      font-size: 0.86rem;
      color: var(--text-secondary, #64748b);
    }

    .progress-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .progress-bar-bg {
      height: 8px;
      border-radius: 999px;
      background: rgba(100, 116, 139, 0.22);
      overflow: hidden;
      flex: 1;
    }

    .progress-bar-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 260ms ease;
    }

    .progress-value {
      font-weight: 700;
      min-width: 40px;
      text-align: right;
    }

    @keyframes widgetIn {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 900px) {
      .selling-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BestSellingWidget {
  readonly items: MenuItem[] = [
    { label: 'Add New', icon: 'pi pi-fw pi-plus' },
    { label: 'Remove', icon: 'pi pi-fw pi-trash' }
  ];

  readonly products: BestSellingItem[] = [
    { name: 'Space T-Shirt', category: 'Clothing', percent: 50, color: '#f97316' },
    { name: 'Portal Sticker', category: 'Accessories', percent: 16, color: '#06b6d4' },
    { name: 'Supernova Sticker', category: 'Accessories', percent: 67, color: '#ec4899' },
    { name: 'Wonders Notebook', category: 'Office', percent: 35, color: '#22c55e' },
    { name: 'Mat Black Case', category: 'Accessories', percent: 75, color: '#a855f7' },
    { name: 'Robots T-Shirt', category: 'Clothing', percent: 40, color: '#14b8a6' }
  ];
}
