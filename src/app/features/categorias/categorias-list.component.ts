import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Categoria } from '../../core/models';
import { CategoriasService } from '../../core/services/categorias.service';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-categorias-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    InputTextModule,
    TextareaModule,
    DialogModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="card-container categorias-shell">
        <p-toast />

        <!-- Hero Section -->
        <div class="hero">
          <div class="hero-badge">
            <i class="pi pi-tag" style="font-size: 14px;"></i>
            Catálogo
          </div>
          <h2><i class="pi pi-folder"></i> Categorías</h2>
          <p>Administra las categorías de productos de tu tienda</p>
        </div>

        <p-toolbar styleClass="mb-6">
          <ng-template #start>
            <p-button label="Nueva" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
            <p-button
              severity="secondary"
              label="Eliminar"
              icon="pi pi-trash"
              outlined
              (onClick)="deleteSelectedCategorias()"
              [disabled]="!selectedCategorias || !selectedCategorias.length"
            />
          </ng-template>

          <ng-template #end>
            <p-button label="Exportar" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
          </ng-template>
        </p-toolbar>

        <p-table
          #dt
          [value]="categorias()"
          [rows]="10"
          [columns]="cols"
          [paginator]="true"
          [globalFilterFields]="['nombre', 'descripcion']"
          [tableStyle]="{ 'min-width': '60rem' }"
          [(selection)]="selectedCategorias"
          [rowHover]="true"
          dataKey="id"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} categorias"
          [showCurrentPageReport]="true"
          [rowsPerPageOptions]="[10, 20, 30]"
        >
          <ng-template #caption>
            <div class="caption">
              <div class="caption-left">
                <div class="caption-title">Categorias</div>
                <div class="caption-subtitle">Gestiona categorias de productos</div>
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
              <th pSortableColumn="nombre" style="min-width: 16rem">
                Nombre
                <p-sortIcon field="nombre" />
              </th>
              <th pSortableColumn="descripcion" style="min-width: 28rem">
                Descripcion
                <p-sortIcon field="descripcion" />
              </th>
              <th style="min-width: 12rem"></th>
            </tr>
          </ng-template>

          <ng-template #body let-categoria>
            <tr>
              <td style="width: 3rem">
                <p-tableCheckbox [value]="categoria" />
              </td>
              <td>{{ categoria.nombre }}</td>
              <td>{{ categoria.descripcion || '-' }}</td>
              <td>
                <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (onClick)="editCategoria(categoria)" />
                <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (onClick)="deleteCategoria(categoria)" />
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
              <td colspan="4">
                <div class="empty">
                  <div class="empty-title">Sin categorias</div>
                  <div class="empty-subtitle">Empieza creando la primera categoria para tus productos.</div>
                </div>
              </td>
            </tr>
          </ng-template>

        </p-table>

        <p-dialog [(visible)]="categoriaDialog" [style]="{ width: '520px' }" header="Categoria" [modal]="true">
          <ng-template #content>
            <div class="dialog-grid">
              <div class="field">
                <label for="nombre">Nombre</label>
                <input type="text" pInputText id="nombre" [(ngModel)]="categoria.nombre" required fluid />
                <small class="text-red-500" *ngIf="submitted && !categoria.nombre">Nombre es obligatorio.</small>
              </div>

              <div class="field">
                <label for="descripcion">Descripcion</label>
                <textarea id="descripcion" pTextarea [(ngModel)]="categoria.descripcion" rows="4" cols="20" fluid></textarea>
              </div>
            </div>
          </ng-template>

          <ng-template #footer>
            <p-button label="Cancelar" icon="pi pi-times" text (onClick)="hideDialog()" />
            <p-button label="Guardar" icon="pi pi-check" (onClick)="saveCategoria()" />
          </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
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

    .categorias-shell {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1600px;
      margin: 0 auto;
      width: 100%;
      padding: 24px 32px;
      box-sizing: border-box;
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

    h2 { 
      margin: 0; 
      font-size: 2rem; 
      font-weight: 800; 
      letter-spacing: -0.03em; 
      display: inline-flex; 
      align-items: center; 
      gap: 12px; 
      color: var(--text-primary);
    }

    h2 i { 
      width: 44px; 
      height: 44px; 
      border-radius: 12px;
      display: inline-flex; 
      align-items: center; 
      justify-content: center;
      background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
      color: #db2777 !important;
      font-size: 1.1rem;
    }

    .hero p { 
      margin: 4px 0 0; 
      color: var(--text-tertiary); 
      font-size: 0.9375rem; 
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
      letter-spacing: 0.01em;
    }

    .caption-subtitle {
      font-size: 0.85rem;
      color: var(--text-secondary, #475569);
    }

    .caption-search {
      width: 340px;
      max-width: 100%;
    }

    .dialog-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 4px;
    }

    .field label {
      display: block;
      font-weight: 700;
      margin-bottom: 8px;
      color: var(--text-primary, #0f172a);
    }

    .empty {
      padding: 26px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--text-tertiary, #64748b);
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

    :host ::ng-deep .p-toolbar {
      border-radius: 14px;
      border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      background:
        radial-gradient(1000px 380px at -10% -40%, color-mix(in srgb, var(--accent-primary, #10b981) 8%, transparent), transparent 55%),
        var(--bg-secondary, #ffffff);
    }

    :host ::ng-deep .p-datatable {
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
    }

    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      background: color-mix(in srgb, var(--app-primary, #0ea5e9) 7%, #ffffff);
      color: var(--text-primary, #0f172a);
      font-weight: 800;
      font-size: 0.84rem;
      letter-spacing: 0.01em;
      border-color: var(--border-color, rgba(15, 23, 42, 0.08));
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr {
      transition: background-color 180ms ease;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
      background: color-mix(in srgb, var(--accent-primary, #10b981) 6%, transparent);
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      border-color: var(--border-color, rgba(15, 23, 42, 0.08));
    }

    :host ::ng-deep .p-dialog .p-dialog-header {
      border-bottom: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      background: color-mix(in srgb, var(--app-primary, #0ea5e9) 6%, #ffffff);
    }

    :host ::ng-deep .p-dialog .p-dialog-content {
      padding-top: 12px;
    }

    :host ::ng-deep .p-button.p-button-outlined {
      border-width: 1px;
    }

    @keyframes pageFadeIn {
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
      .caption {
        flex-direction: column;
        align-items: stretch;
      }

      .caption-search {
        width: 100%;
      }
    }

    .hero-badge {
      color: #065f46;
    }

    h2 { color: var(--text-primary); }
    .hero p { color: var(--text-tertiary); }
    h2 i { color: #db2777 !important; }

    @media (prefers-color-scheme: dark) {
      .hero-badge {
        background: linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.08) 100%);
        border-color: rgba(52,211,153,0.25);
        color: #34d399;
      }
      h2 i { background: linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%); color: #c4b5fd !important; }
    }

    :root.dark .hero-badge {
      background: linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.08) 100%);
      border-color: rgba(52,211,153,0.25);
      color: #34d399;
    }

    :root.dark h2 { color: #f1f5f9; }
    :root.dark .hero p { color: #64748b; }
    :root.dark h2 i { background: linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%); color: #c4b5fd !important; }

    @media (max-width: 640px) {
      h2 { font-size: 1.5rem; }
    }
  `],
  providers: [MessageService, ConfirmationService]
})
export class CategoriasListComponent implements OnInit {
  private readonly categoriasService = inject(CategoriasService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  protected readonly categorias = signal<Categoria[]>([]);

  protected categoriaDialog = false;
  protected submitted = false;

  protected categoria: Partial<Categoria> = {};
  protected selectedCategorias: Categoria[] | null = null;

  @ViewChild('dt') protected dt!: Table;

  protected cols: Column[] = [
    { field: 'nombre', header: 'Nombre' },
    { field: 'descripcion', header: 'Descripcion' }
  ];

  ngOnInit(): void {
    this.cargarCategorias();
  }

  protected exportCSV(): void {
    this.dt.exportCSV();
  }

  protected onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  protected openNew(): void {
    this.categoria = {};
    this.submitted = false;
    this.categoriaDialog = true;
  }

  protected editCategoria(categoria: Categoria): void {
    this.categoria = { ...categoria };
    this.categoriaDialog = true;
  }

  protected deleteSelectedCategorias(): void {
    if (!this.selectedCategorias?.length) return;

    const ids = this.selectedCategorias.map((c) => c.id);
    this.confirmationService.confirm({
      message: '¿Seguro que deseas eliminar las categorias seleccionadas?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let eliminadas = 0;
        ids.forEach((id) => {
          this.categoriasService.delete(id).subscribe({
            next: () => {
              eliminadas += 1;
              this.categorias.set(this.categorias().filter((c) => c.id !== id));
              if (eliminadas === ids.length) {
                this.selectedCategorias = null;
                this.messageService.add({
                  severity: 'success',
                  summary: 'OK',
                  detail: 'Categorias eliminadas',
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
    this.categoriaDialog = false;
    this.submitted = false;
  }

  protected deleteCategoria(categoria: Categoria): void {
    this.confirmationService.confirm({
      message: `¿Seguro que deseas eliminar "${categoria.nombre}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.categoriasService.delete(categoria.id).subscribe({
          next: () => {
            this.categorias.set(this.categorias().filter((c) => c.id !== categoria.id));
            this.categoria = {};
            this.messageService.add({
              severity: 'success',
              summary: 'OK',
              detail: 'Categoria eliminada',
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

  protected saveCategoria(): void {
    this.submitted = true;
    const nombre = this.categoria.nombre?.trim();

    if (!nombre) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validacion',
        detail: 'Nombre es requerido',
        life: 3500
      });
      return;
    }

    if (this.categoria.id) {
      this.categoriasService.update(this.categoria.id, this.categoria).subscribe({
        next: (updated) => {
          const id = this.categoria.id as string;
          const nextCategoria: Categoria = (updated as Categoria) || (this.categoria as Categoria);
          const list = this.categorias();
          const index = list.findIndex((c) => c.id === id);
          if (index >= 0) {
            const next = [...list];
            next[index] = nextCategoria;
            this.categorias.set(next);
          } else {
            this.categorias.set([nextCategoria, ...list]);
          }

          this.messageService.add({
            severity: 'success',
            summary: 'OK',
            detail: 'Categoria actualizada',
            life: 3000
          });
          this.categoriaDialog = false;
          this.categoria = {};
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

    this.categoriasService.create(this.categoria).subscribe({
      next: (created) => {
        const nextCategoria = (created as Categoria) || (this.categoria as Categoria);
        this.categorias.set([nextCategoria, ...this.categorias()]);
        this.messageService.add({
          severity: 'success',
          summary: 'OK',
          detail: 'Categoria creada',
          life: 3000
        });
        this.categoriaDialog = false;
        this.categoria = {};
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

  private cargarCategorias(): void {
    this.categoriasService.getAll().subscribe({
      next: (categorias) => this.categorias.set(categorias),
      error: (e: unknown) => {
        this.categorias.set([]);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: e instanceof Error ? e.message : 'No se pudo cargar categorias',
          life: 3500
        });
      }
    });
  }
}
