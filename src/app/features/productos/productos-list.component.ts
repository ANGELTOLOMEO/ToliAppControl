import { Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProductosService } from '../../core/services/productos.service';
import { Producto } from '../../core/models';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="card-container">
        <p-toast />

        <div class="intro-stack">
          <section class="feature-hero list-hero">
            <div class="feature-hero-copy">
              <div class="feature-badge">Catalogo</div>
              <h1>
                <span class="hero-icon"><i class="pi pi-box"></i></span>
                Productos
              </h1>
              <p>Gestiona inventario, categorias y stock con una tabla mas clara y mejor jerarquia visual.</p>
            </div>

            <div class="chip-row">
              <span class="soft-chip">Stock en tiempo real</span>
              <span class="soft-chip">Seleccion multiple</span>
              <span class="soft-chip">Edicion rapida</span>
            </div>
          </section>
        </div>

        <p-toolbar styleClass="mb-6">
          <ng-template #start>
            <p-button label="Nuevo" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
            <p-button
              severity="secondary"
              label="Eliminar"
              icon="pi pi-trash"
              outlined
              (onClick)="deleteSelectedProducts()"
              [disabled]="!selectedProducts || !selectedProducts.length"
            />
          </ng-template>

          <ng-template #end>
            <p-button label="Exportar" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
          </ng-template>
        </p-toolbar>

        <p-table
          #dt
          [value]="products()"
          [rows]="10"
          [columns]="cols"
          [paginator]="true"
          [globalFilterFields]="['nombre', 'categoria', 'categoria_nombre', 'descripcion', 'sku']"
          [tableStyle]="{ 'min-width': '75rem' }"
          [(selection)]="selectedProducts"
          [rowHover]="true"
          dataKey="id"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
          [showCurrentPageReport]="true"
          [rowsPerPageOptions]="[10, 20, 30]"
        >
          <ng-template #caption>
            <div class="caption">
              <div class="caption-left">
                <div class="caption-title">Inventario</div>
                <div class="caption-subtitle">Busca, selecciona y edita productos del catalogo</div>
              </div>
              <p-iconfield class="caption-search">
                <p-inputicon styleClass="pi pi-search" />
                <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
              </p-iconfield>
            </div>
          </ng-template>

          <ng-template #header>
            <tr>
              <th style="width: 3rem">
                <p-tableHeaderCheckbox />
              </th>
              <th style="min-width: 6rem">Imagen</th>
              <th pSortableColumn="nombre" style="min-width: 18rem">
                Nombre
                <p-sortIcon field="nombre" />
              </th>
              <th pSortableColumn="categoria" style="min-width: 16rem">
                Categoría
                <p-sortIcon field="categoria" />
              </th>
              <th pSortableColumn="precio" style="min-width: 10rem">
                Precio
                <p-sortIcon field="precio" />
              </th>
              <th pSortableColumn="stock" style="min-width: 10rem">
                Stock
                <p-sortIcon field="stock" />
              </th>
              <th style="min-width: 12rem"></th>
            </tr>
          </ng-template>

          <ng-template #body let-product>
            <tr>
              <td style="width: 3rem">
                <p-tableCheckbox [value]="product" />
              </td>
              <td style="min-width: 6rem">
                <div class="thumb-shell">
                  <img *ngIf="product.imagen" [src]="product.imagen" [alt]="product.nombre" class="thumb" />
                  <span *ngIf="!product.imagen" class="thumb-fallback">IMG</span>
                </div>
              </td>
              <td style="min-width: 18rem"><span class="product-name">{{ product.nombre }}</span></td>
              <td style="min-width: 16rem"><span class="product-category">{{ product.categoria || product.categoria_nombre || '-' }}</span></td>
              <td><span class="price-pill">{{ product.precio | currency: 'PEN':'S/ ' }}</span></td>
              <td>
                <div class="stock-cell">
                  <p-tag
                    [value]="(product.stock ?? 0) > 0 ? 'IN STOCK' : 'OUT OF STOCK'"
                    [severity]="(product.stock ?? 0) > 0 ? 'success' : 'danger'"
                  />
                  <small>{{ product.stock ?? 0 }} units</small>
                </div>
              </td>
              <td>
                <div class="actions-cell">
                  <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (onClick)="editProduct(product)" />
                  <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (onClick)="deleteProduct(product)" />
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
              <td colspan="7">
                <div class="empty">
                  <i class="pi pi-box"></i>
                  <div class="empty-title">Sin productos</div>
                  <div class="empty-subtitle">No hay registros cargados para mostrar en el catalogo.</div>
                </div>
              </td>
            </tr>
          </ng-template>

        </p-table>

        <p-dialog [(visible)]="productDialog" [style]="{ width: '520px' }" header="Producto" [modal]="true">
          <ng-template #content>
            <div class="dialog-grid">
              <div class="field">
                <label for="nombre">Nombre</label>
                <input type="text" pInputText id="nombre" [(ngModel)]="product.nombre" required fluid />
                <small class="text-red-500" *ngIf="submitted && !product.nombre">Nombre es obligatorio.</small>
              </div>

              <div class="field">
                <label for="descripcion">Descripción</label>
                <textarea id="descripcion" pTextarea [(ngModel)]="product.descripcion" rows="3" cols="20" fluid></textarea>
              </div>

              <div class="field-row">
                <div class="field">
                  <label for="precio">Precio</label>
                  <p-inputnumber id="precio" [(ngModel)]="product.precio" mode="currency" currency="PEN" locale="es-PE" fluid />
                </div>
                <div class="field">
                  <label for="stock">Stock</label>
                  <p-inputnumber id="stock" [(ngModel)]="product.stock" fluid />
                </div>
              </div>

              <div class="field">
                <label for="categoria">Categoría</label>
                <input type="text" pInputText id="categoria" [(ngModel)]="product.categoria" fluid />
              </div>

              <div class="field">
                <label for="imagen">Imagen (URL)</label>
                <input type="text" pInputText id="imagen" [(ngModel)]="product.imagen" fluid />
              </div>
            </div>
          </ng-template>

          <ng-template #footer>
            <p-button label="Cancelar" icon="pi pi-times" text (onClick)="hideDialog()" />
            <p-button label="Guardar" icon="pi pi-check" (onClick)="saveProduct()" />
          </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 0;
    }

    .intro-stack {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 16px;
    }

    .list-hero {
      padding: 0;
    }

    .hero-icon i {
      font-size: 1.1rem;
    }

    .caption {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .caption-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .caption-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--text-primary, #0f172a);
    }

    .caption-subtitle {
      font-size: 0.85rem;
      color: var(--text-secondary, #475569);
    }

    .caption-search {
      width: 320px;
      max-width: 100%;
    }

    .empty {
      padding: 26px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--text-tertiary, #64748b);
    }

    .empty i {
      font-size: 1.2rem;
      margin-bottom: 4px;
    }

    .empty-title {
      font-weight: 800;
      color: var(--text-primary, #0f172a);
    }

    .empty-subtitle {
      font-size: 0.9rem;
      color: var(--text-secondary, #475569);
      text-align: center;
    }

    .thumb-shell {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.04), rgba(15, 23, 42, 0.02));
      border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      overflow: hidden;
    }

    .thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 0;
    }

    .thumb-fallback {
      color: var(--text-tertiary, #64748b);
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.06em;
    }

    .product-name {
      color: var(--text-primary, #0f172a);
      font-weight: 700;
    }

    .product-category {
      color: var(--text-secondary, #475569);
      font-weight: 600;
    }

    .price-pill {
      display: inline-flex;
      align-items: center;
      min-height: 32px;
      padding: 0 12px;
      border-radius: 999px;
      background: var(--bg-tertiary, #eef2f7);
      color: var(--text-primary, #0f172a);
      font-weight: 800;
    }

    .stock-cell {
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: flex-start;
    }

    .stock-cell small {
      color: var(--text-tertiary, #64748b);
      font-size: 0.78rem;
    }

    .actions-cell {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .dialog-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .field label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    :host ::ng-deep .p-toolbar {
      background: var(--bg-tertiary, #eef2f7);
    }

    :host ::ng-deep .p-datatable {
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      box-shadow: none;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr {
      transition: background-color 180ms ease;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
      background: rgba(15, 23, 42, 0.03);
    }

    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      background: var(--bg-tertiary, #eef2f7);
      color: var(--text-primary, #0f172a);
      font-weight: 800;
      border-color: var(--border-color, rgba(15, 23, 42, 0.08));
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr:nth-child(even) {
      background: rgba(15, 23, 42, 0.015);
    }

    :host ::ng-deep .p-dialog .p-dialog-header {
      border-bottom: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
    }

    :host ::ng-deep .p-dialog .p-dialog-content,
    :host ::ng-deep .p-dialog .p-dialog-footer {
      background: var(--bg-secondary, #ffffff);
    }

    @media (max-width: 900px) {
      .caption {
        flex-direction: column;
        align-items: stretch;
      }

      .caption-search {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .field-row {
        grid-template-columns: 1fr;
      }
    }
  `]
  ,
  providers: [MessageService, ConfirmationService]
})
export class ProductosListComponent implements OnInit {
  private readonly productosService = inject(ProductosService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  protected readonly products = signal<Producto[]>([]);
  protected readonly totalProductos = computed(() => this.products().length);
  protected readonly productosConStock = computed(() => this.products().filter((product) => (product.stock ?? 0) > 0).length);
  protected readonly productosSinStock = computed(() => this.products().filter((product) => (product.stock ?? 0) <= 0).length);
  protected readonly categoriasActivas = computed(() => new Set(
    this.products()
      .map((product) => (product.categoria || product.categoria_nombre || '').trim())
      .filter(Boolean)
  ).size);

  protected productDialog = false;
  protected submitted = false;

  protected product: Partial<Producto> = {};
  protected selectedProducts: Producto[] | null = null;

  @ViewChild('dt') protected dt!: Table;

  protected cols: Column[] = [
    { field: 'imagen', header: 'Imagen' },
    { field: 'nombre', header: 'Nombre' },
    { field: 'categoria', header: 'Categoría' },
    { field: 'precio', header: 'Precio' },
    { field: 'stock', header: 'Stock' }
  ];

  ngOnInit(): void {
    this.cargarProductos();
  }

  protected exportCSV(): void {
    this.dt.exportCSV();
  }

  protected onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  protected openNew(): void {
    this.product = {};
    this.submitted = false;
    this.productDialog = true;
  }

  protected editProduct(product: Producto): void {
    this.product = { ...product };
    this.productDialog = true;
  }

  protected deleteSelectedProducts(): void {
    if (!this.selectedProducts?.length) return;

    const ids = this.selectedProducts.map((p) => p.id);
    this.confirmationService.confirm({
      message: '¿Seguro que deseas eliminar los productos seleccionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let eliminados = 0;
        ids.forEach((id) => {
          this.productosService.delete(id).subscribe({
            next: () => {
              eliminados += 1;
              const remaining = this.products().filter((p) => p.id !== id);
              this.products.set(remaining);
              if (eliminados === ids.length) {
                this.selectedProducts = null;
                this.messageService.add({
                  severity: 'success',
                  summary: 'OK',
                  detail: 'Productos eliminados',
                  life: 3000
                });
              }
            },
            error: (e: unknown) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: e instanceof Error ? e.message : 'No se pudo eliminar',
                life: 3500
              });
            }
          });
        });
      }
    });
  }

  protected hideDialog(): void {
    this.productDialog = false;
    this.submitted = false;
  }

  protected deleteProduct(product: Producto): void {
    this.confirmationService.confirm({
      message: `¿Seguro que deseas eliminar "${product.nombre}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productosService.delete(product.id).subscribe({
          next: () => {
            this.products.set(this.products().filter((p) => p.id !== product.id));
            this.product = {};
            this.messageService.add({
              severity: 'success',
              summary: 'OK',
              detail: 'Producto eliminado',
              life: 3000
            });
          },
          error: (e: unknown) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: e instanceof Error ? e.message : 'No se pudo eliminar',
              life: 3500
            });
          }
        });
      }
    });
  }

  protected saveProduct(): void {
    this.submitted = true;
    const nombre = this.product.nombre?.trim();
    const categoria = this.product.categoria?.trim();
    const precio = this.product.precio;

    if (!nombre || !categoria || typeof precio !== 'number' || !Number.isFinite(precio) || precio <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Nombre, precio y categoría son requeridos',
        life: 3500
      });
      return;
    }

    if (this.product.id) {
      this.productosService.update(this.product.id, this.product).subscribe({
        next: (updated) => {
          const id = this.product.id as string;
          const nextProduct: Producto = (updated as Producto) || (this.product as Producto);
          const list = this.products();
          const index = list.findIndex((p) => p.id === id);
          if (index >= 0) {
            const next = [...list];
            next[index] = nextProduct;
            this.products.set(next);
          } else {
            this.products.set([nextProduct, ...list]);
          }

          this.messageService.add({
            severity: 'success',
            summary: 'OK',
            detail: 'Producto actualizado',
            life: 3000
          });
          this.productDialog = false;
          this.product = {};
        },
        error: (e: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: e instanceof Error ? e.message : 'No se pudo actualizar',
            life: 3500
          });
        }
      });
      return;
    }

    this.productosService.create(this.product).subscribe({
      next: (created) => {
        const nextProduct = (created as Producto) || (this.product as Producto);
        this.products.set([nextProduct, ...this.products()]);
        this.messageService.add({
          severity: 'success',
          summary: 'OK',
          detail: 'Producto creado',
          life: 3000
        });
        this.productDialog = false;
        this.product = {};
      },
      error: (e: unknown) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: e instanceof Error ? e.message : 'No se pudo crear',
          life: 3500
        });
      }
    });
  }

  private cargarProductos(): void {
    this.productosService.getAll().subscribe({
      next: (productos) => this.products.set(productos),
      error: (e: unknown) => {
        this.products.set([]);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: e instanceof Error ? e.message : 'No se pudo cargar productos',
          life: 3500
        });
      }
    });
  }
}
