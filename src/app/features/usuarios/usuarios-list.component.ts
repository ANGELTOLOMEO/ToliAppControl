import { Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
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

        <div class="intro-stack">
          <section class="feature-hero list-hero">
            <div class="feature-hero-copy">
              <div class="feature-badge">Administracion</div>
              <h1>
                <span class="hero-icon"><i class="pi pi-users"></i></span>
                Usuarios
              </h1>
              <p>Controla accesos, roles y actividad del sistema desde una vista mas clara y ordenada.</p>
            </div>

            <div class="chip-row">
              <span class="soft-chip">Roles y permisos</span>
              <span class="soft-chip">Actividad reciente</span>
              <span class="soft-chip">Exportacion</span>
            </div>
</section>
        </div>

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
          [tableStyle]="{ 'min-width': '60rem' }"
          [rowHover]="true"
          dataKey="id"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
          [showCurrentPageReport]="true"
          [rowsPerPageOptions]="[10, 20, 30]"
        >
          <ng-template #caption>
            <div class="caption">
              <div class="caption-left">
                <div class="caption-title">Directorio</div>
                <div class="caption-subtitle">Busca, filtra y revisa accesos del sistema</div>
              </div>
              <p-iconfield class="caption-search">
                <p-inputicon styleClass="pi pi-search" />
                <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
              </p-iconfield>
            </div>
          </ng-template>

          <ng-template #header>
            <tr>
              <th pSortableColumn="nombre" style="min-width: 13rem">
                Nombre
                <p-sortIcon field="nombre" />
              </th>
              <th pSortableColumn="email" style="min-width: 15rem">
                Email
                <p-sortIcon field="email" />
              </th>
              <th pSortableColumn="rol" style="min-width: 12rem">
                Rol
                <p-sortIcon field="rol" />
              </th>
              <th pSortableColumn="activo" style="min-width: 10rem">
                Estado
                <p-sortIcon field="activo" />
              </th>
              <th pSortableColumn="creado_en" style="min-width: 12rem">
                Creado
                <p-sortIcon field="creado_en" />
              </th>
              <th pSortableColumn="ultimo_login" style="min-width: 12rem">
                Último login
                <p-sortIcon field="ultimo_login" />
              </th>
              <th class="acciones-col" style="min-width: 8rem">Acciones</th>
            </tr>
          </ng-template>

          <ng-template #body let-user>
            <tr>
              <td>
                <div class="user-cell">
                  <span class="user-avatar">{{ getInitials(user.nombre) }}</span>
                  <span class="user-name">{{ user.nombre }}</span>
                </div>
              </td>
              <td><span class="email-text">{{ user.email }}</span></td>
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
              <td class="acciones-col">
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
                  <i class="pi pi-users"></i>
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
    :host {
      display: block;
      animation: pageFadeIn 240ms ease-out;
    }

    .page-container {
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
    }

    .actions-cell {
      display: flex;
      align-items: center;
      gap: 4px;
      justify-content: flex-start;
      white-space: nowrap;
    }

    .user-cell {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent-primary, #10b981) 14%, transparent);
      color: var(--text-primary, #0f172a);
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.04em;
    }

    .user-name {
      min-width: 0;
      color: var(--text-primary, #0f172a);
      font-weight: 700;
    }

    .email-text {
      color: var(--text-secondary, #475569);
      font-weight: 500;
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

    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      background: var(--bg-tertiary, #eef2f7);
      color: var(--text-primary, #0f172a);
      font-weight: 800;
      font-size: 0.84rem;
      letter-spacing: 0.01em;
      border-color: var(--border-color, rgba(15, 23, 42, 0.08));
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr {
      transition: background-color 180ms ease;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr:nth-child(even) {
      background: rgba(15, 23, 42, 0.015);
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
      background: rgba(15, 23, 42, 0.03);
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      border-color: var(--border-color, rgba(15, 23, 42, 0.08));
    }

    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th.acciones-col,
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td.acciones-col {
      position: sticky;
      right: 0;
      z-index: 2;
      background: var(--bg-secondary, #ffffff);
      box-shadow: -8px 0 12px -14px rgba(15, 23, 42, 0.18);
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
  protected readonly totalUsuarios = computed(() => this.usuarios().length);
  protected readonly usuariosActivos = computed(() => this.usuarios().filter((user) => !!user.activo).length);
  protected readonly usuariosAdmin = computed(() => this.usuarios().filter((user) => (user.rol || '').toUpperCase() === 'ADMIN').length);

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

  protected getInitials(nombre: string): string {
    return (nombre || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'US';
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
