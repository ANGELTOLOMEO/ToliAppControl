import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { MessageService } from 'primeng/api';
import { UsuariosService } from '../../core/services/usuarios.service';
import { Usuario } from '../../core/models';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    TableModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    TagModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule
  ],
  template: `
    <div class="page-container">
      <div class="card-container">
        <p-toast />

        @if (loading()) {
          <div class="status">Cargando usuarios...</div>
        }
        @if (loadError()) {
          <div class="status status-error">{{ loadError() }}</div>
        }

        <p-toolbar styleClass="mb-6">
          <ng-template #start>
            <p-button label="Nuevo" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="goToNuevoUsuario()" />
          </ng-template>

          <ng-template #end>
            <p-button label="Exportar" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
          </ng-template>
        </p-toolbar>

        <p-table
          #dt
          [value]="usuarios()"
          [rows]="10"
          [paginator]="true"
          [globalFilterFields]="['nombre', 'email', 'rol']"
          [tableStyle]="{ 'min-width': '70rem' }"
          [rowHover]="true"
          dataKey="id"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
          [showCurrentPageReport]="true"
          [rowsPerPageOptions]="[10, 20, 30]"
        >
          <ng-template #caption>
            <div class="caption">
              <div class="caption-left">
                <div class="caption-title">Usuarios</div>
                <div class="caption-subtitle">Listado de usuarios del sistema</div>
              </div>
              <p-iconfield class="caption-search">
                <p-inputicon styleClass="pi pi-search" />
                <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
              </p-iconfield>
            </div>
          </ng-template>

          <ng-template #header>
            <tr>
              <th pSortableColumn="nombre" style="min-width: 16rem">
                Nombre
                <p-sortIcon field="nombre" />
              </th>
              <th pSortableColumn="email" style="min-width: 18rem">
                Email
                <p-sortIcon field="email" />
              </th>
              <th pSortableColumn="rol" style="min-width: 14rem">
                Rol
                <p-sortIcon field="rol" />
              </th>
              <th pSortableColumn="activo" style="min-width: 10rem">
                Estado
                <p-sortIcon field="activo" />
              </th>
              <th pSortableColumn="creado_en" style="min-width: 14rem">
                Creado
                <p-sortIcon field="creado_en" />
              </th>
              <th pSortableColumn="ultimo_login" style="min-width: 14rem">
                Último login
                <p-sortIcon field="ultimo_login" />
              </th>
              <th style="min-width: 10rem">Acciones</th>
            </tr>
          </ng-template>

          <ng-template #body let-user>
            <tr>
              <td>{{ user.nombre }}</td>
              <td>{{ user.email }}</td>
              <td>
                <p-tag [value]="user.rol" [severity]="getRolSeverity(user.rol)" />
              </td>
              <td>
                <p-tag [value]="user.activo ? 'ACTIVO' : 'INACTIVO'" [severity]="user.activo ? 'success' : 'danger'" />
              </td>
              <td>{{ user.creado_en | date: 'dd/MM/yyyy HH:mm' }}</td>
              <td>
                @if (user.ultimo_login) {
                  {{ user.ultimo_login | date: 'dd/MM/yyyy HH:mm' }}
                } @else {
                  <span class="muted">-</span>
                }
              </td>
              <td>
                <div class="actions-cell">
                  <p-button icon="pi pi-pencil" [text]="true" severity="secondary" (onClick)="goToEditUsuario(user.id)" />
                  <p-button icon="pi pi-trash" [text]="true" severity="danger" (onClick)="deleteUsuario(user)" />
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
                <td colspan="7">
                <div class="empty">
                  <div class="empty-title">Sin usuarios</div>
                  <div class="empty-subtitle">No hay registros para mostrar.</div>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 0;
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

    .muted {
      color: var(--text-tertiary, #64748b);
    }

    .status {
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      background: rgba(15, 23, 42, 0.03);
      color: var(--text-secondary, #475569);
      font-weight: 700;
      margin-bottom: 12px;
    }

    .status-error {
      background: color-mix(in srgb, #ef4444 10%, transparent);
      border-color: color-mix(in srgb, #ef4444 25%, rgba(15, 23, 42, 0.08));
      color: var(--text-primary, #0f172a);
    }

    .empty {
      padding: 22px 10px;
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
    }

    .actions-cell {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `]
  ,
  providers: [MessageService]
})
export class UsuariosListComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);

  @ViewChild('dt') protected dt!: Table;

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  protected exportCSV(): void {
    this.dt.exportCSV();
  }

  protected onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  protected goToNuevoUsuario(): void {
    this.router.navigate(['/usuarios/nuevo']);
  }

  protected goToEditUsuario(id: string): void {
    this.router.navigate(['/usuarios', id]);
  }

  protected deleteUsuario(user: Usuario): void {
    const ok = window.confirm(`¿Seguro que deseas eliminar a "${user.nombre}"?`);
    if (!ok) return;

    this.usuariosService.delete(user.id).subscribe({
      next: () => {
        this.usuarios.set(this.usuarios().filter((u) => u.id !== user.id));
        this.messageService.add({
          severity: 'success',
          summary: 'OK',
          detail: 'Usuario eliminado',
          life: 3000
        });
      },
      error: (e: unknown) => {
        const message = e instanceof Error ? e.message : 'No se pudo eliminar usuario';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: message,
          life: 3500
        });
      }
    });
  }

  protected getRolSeverity(rol: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const r = (rol ?? '').toUpperCase();
    if (r === 'ADMIN') return 'danger';
    if (r.startsWith('FINANZAS')) return 'warn';
    if (r.startsWith('OPERACIONES')) return 'info';
    if (r.startsWith('VENTAS')) return 'success';
    return 'secondary';
  }

  private cargarUsuarios(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.usuariosService.getAll().subscribe({
      next: (list) => {
        this.usuarios.set(list);
        this.loading.set(false);
      },
      error: (e: unknown) => {
        this.usuarios.set([]);
        this.loading.set(false);
        const message = e instanceof Error ? e.message : 'No se pudo cargar usuarios';
        this.loadError.set(message);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: message,
          life: 3500
        });
      }
    });
  }
}
