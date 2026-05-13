import { ChangeDetectionStrategy, Component, inject, output, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../core/auth/auth.service';

/**
 * Interfaz para items del menú
 */
interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

/**
 * SidebarComponent - Menú de navegación dinámico según rol
 * Muestra/oculta items según permisos del usuario
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
<div class="sidebar-container">
      <div class="section-title">HOGAR</div>

      <!-- Menú -->
      <mat-nav-list class="menu-list">
        @for (item of homeMenuItems(); track item.route) {
          <a
            mat-list-item
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            class="menu-item"
            (click)="onItemClick()"
          >
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
          </a>
        }
      </mat-nav-list>

      @if (managementMenuItems().length > 0) {
        <div class="section-title section-title-secondary">GESTIÓN</div>

        <mat-nav-list class="menu-list menu-list-secondary">
          @for (item of managementMenuItems(); track item.route) {
            <a
              mat-list-item
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              class="menu-item"
              (click)="onItemClick()"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      }

      <!-- Footer -->
      <div class="sidebar-footer">
        <div class="version-info">v1.0.0</div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 0;
      background: var(--bg-secondary, #ffffff);
      border-radius: 18px;
      border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
      overflow: hidden;
    }

    .sidebar-top {
      padding: 14px 14px 8px;
      display: grid;
      gap: 12px;
    }

    .workspace-card {
      display: grid;
      grid-template-columns: 42px 1fr;
      gap: 12px;
      align-items: center;
      padding: 12px;
      border-radius: 14px;
      border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      background: var(--bg-tertiary, #eef2f7);
    }

    .workspace-mark {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background: color-mix(in srgb, var(--accent-primary, #10b981) 16%, transparent);
      color: var(--text-primary, #0f172a);
      font-weight: 900;
      letter-spacing: 0.08em;
    }

    .workspace-copy {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .workspace-copy strong {
      color: var(--text-primary, #0f172a);
      font-size: 0.94rem;
      line-height: 1.15;
    }

    .workspace-copy span {
      color: var(--text-secondary, #475569);
      font-size: 0.77rem;
      line-height: 1.35;
    }

    .profile-card {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 12px;
      border-radius: 14px;
      border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      background: var(--bg-secondary, #ffffff);
    }

    .profile-avatar {
      width: 38px;
      height: 38px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      background: color-mix(in srgb, var(--accent-primary, #10b981) 18%, transparent);
      color: var(--text-primary, #0f172a);
      font-size: 0.78rem;
      font-weight: 900;
      letter-spacing: 0.04em;
    }

    .profile-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .profile-name {
      color: var(--text-primary, #0f172a);
      font-weight: 800;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .profile-role {
      color: var(--text-secondary, #475569);
      font-size: 0.78rem;
      line-height: 1.35;
    }

    .profile-chip {
      width: fit-content;
      min-height: 26px;
      display: inline-flex;
      align-items: center;
      padding: 0 10px;
      border-radius: 999px;
      border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      background: var(--bg-tertiary, #eef2f7);
      color: var(--text-secondary, #475569);
      font-size: 0.75rem;
      font-weight: 800;
    }

:host-context(.dark) .profile-card {
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.62), rgba(15, 23, 42, 0.32));
    }

    :host-context(.dark) .workspace-card {
      border-color: rgba(148, 163, 184, 0.18);
    }

    :host-context(.dark) .section-title,
    :root.dark .sidebar-container .section-title {
      color: #94a3b8;
    }

    :host-context(.dark) .menu-item,
    :root.dark .sidebar-container .menu-item {
      color: #94a3b8;
    }

    :host-context(.dark) .menu-item:hover,
    :root.dark .sidebar-container .menu-item:hover {
      background: rgba(148, 163, 184, 0.08);
      color: #f1f5f9;
      border-color: rgba(148, 163, 184, 0.12);
    }

    :host-context(.dark) .menu-item.active,
    :root.dark .sidebar-container .menu-item.active {
      background: rgba(16, 185, 129, 0.12);
      color: #f1f5f9;
      border-color: rgba(16, 185, 129, 0.24);
    }

    :host-context(.dark) .menu-item.active mat-icon,
    :root.dark .sidebar-container .menu-item.active mat-icon {
      color: #34d399;
    }

    :host-context(.dark) .menu-item mat-icon,
    :root.dark .sidebar-container .menu-item mat-icon {
      color: #64748b;
    }

    :host-context(.dark) .version-info,
    :root.dark .sidebar-container .version-info {
      color: #64748b;
    }

    :host-context(.dark) .sidebar-footer,
    :root.dark .sidebar-container .sidebar-footer {
      border-color: rgba(148, 163, 184, 0.12);
    }

    .section-title {
      padding: 12px 16px 8px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: var(--text-tertiary, #64748b);
    }

    .section-title-secondary {
      padding-top: 8px;
    }

    .menu-list {
      padding: 8px 8px 10px;
      background: transparent;
      overflow: auto;
    }

    .menu-list-secondary {
      padding-bottom: 16px;
    }

    .menu-item {
      border-radius: 12px;
      margin-bottom: 6px;
      color: var(--text-secondary, #475569);
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .menu-item:hover {
      background: rgba(15, 23, 42, 0.04);
      color: var(--text-primary, #0f172a);
      border-color: rgba(15, 23, 42, 0.06);
    }

    .menu-item.active {
      background: color-mix(in srgb, var(--accent-primary, #10b981) 10%, var(--bg-tertiary, #eef2f7));
      color: var(--text-primary, #0f172a);
      border-color: color-mix(in srgb, var(--accent-primary, #10b981) 18%, rgba(15, 23, 42, 0.08));
    }

    .menu-item.active mat-icon {
      color: var(--accent-primary, #10b981);
    }

    .menu-item mat-icon {
      color: var(--text-tertiary, #64748b);
      margin-right: 12px;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      display: flex;
      justify-content: center;
    }

    .version-info {
      font-size: 12px;
      color: var(--text-tertiary, #94a3b8);
      text-align: center;
    }
  `]
})
export class SidebarComponent implements OnInit {
  private readonly authService = inject(AuthService);

  // Output para navegación
  readonly navigate = output<void>();

  // Menú completo
  private readonly menuItems: MenuItem[] = [
    { label: 'Panel', icon: 'home', route: '/dashboard', roles: ['ADMIN', 'VENTAS_VENDEDOR', 'VENTAS_SUPERVISOR', 'OPERACIONES_INVENTARIO', 'OPERACIONES_LOGISTICA', 'FINANZAS_CONTABILIDAD', 'CLIENTE'] },
    { label: 'Usuarios', icon: 'people', route: '/usuarios', roles: ['ADMIN'] },
    { label: 'Productos', icon: 'inventory_2', route: '/productos', roles: ['ADMIN', 'VENTAS_VENDEDOR', 'VENTAS_SUPERVISOR', 'OPERACIONES_INVENTARIO', 'FINANZAS_CONTABILIDAD'] },
    { label: 'Categorias', icon: 'category', route: '/categorias', roles: ['ADMIN', 'OPERACIONES_INVENTARIO'] },
    { label: 'Pedidos', icon: 'shopping_cart', route: '/pedidos', roles: ['ADMIN', 'VENTAS_VENDEDOR', 'VENTAS_SUPERVISOR', 'OPERACIONES_INVENTARIO', 'OPERACIONES_LOGISTICA', 'FINANZAS_CONTABILIDAD', 'CLIENTE'] },
    { label: 'Envíos', icon: 'local_shipping', route: '/envios', roles: ['ADMIN', 'VENTAS_SUPERVISOR', 'OPERACIONES_LOGISTICA'] },
    { label: 'Pagos', icon: 'payments', route: '/pagos', roles: ['ADMIN', 'VENTAS_SUPERVISOR', 'FINANZAS_CONTABILIDAD'] },
    { label: 'Notificaciones', icon: 'notifications', route: '/notificaciones', roles: ['ADMIN', 'VENTAS_VENDEDOR', 'VENTAS_SUPERVISOR', 'OPERACIONES_INVENTARIO', 'OPERACIONES_LOGISTICA', 'FINANZAS_CONTABILIDAD', 'CLIENTE'] }
  ];

  // Roles permitidos para cada tipo de usuario
  private readonly rolePermissions: Record<string, string[]> = {
    'ADMIN': ['ADMIN', 'VENTAS_VENDEDOR', 'VENTAS_SUPERVISOR', 'OPERACIONES_INVENTARIO', 'OPERACIONES_LOGISTICA', 'FINANZAS_CONTABILIDAD', 'CLIENTE'],
    'VENTAS_VENDEDOR': ['VENTAS_VENDEDOR', 'VENTAS_SUPERVISOR'],
    'VENTAS_SUPERVISOR': ['VENTAS_SUPERVISOR', 'VENTAS_VENDEDOR'],
    'OPERACIONES_INVENTARIO': ['OPERACIONES_INVENTARIO', 'VENTAS_SUPERVISOR'],
    'OPERACIONES_LOGISTICA': ['OPERACIONES_LOGISTICA'],
    'FINANZAS_CONTABILIDAD': ['FINANZAS_CONTABILIDAD'],
    'CLIENTE': ['CLIENTE']
  };

  ngOnInit(): void {
    // No hay inicialización needed, los menú items se computan reactivamente
  }

  /**
   * Obtener items de menú visibles según el rol del usuario
   */
  readonly visibleMenuItems = computed(() => {
    const user = this.authService.getUser();
    if (!user) return [];

    const userRol = user.rol;
    const allowedRoles = this.rolePermissions[userRol] || [];

    // Filtrar menus según los roles permitidos
    return this.menuItems.filter(item =>
      item.roles.some(role => allowedRoles.includes(role))
    );
  });

  readonly userName = () => this.authService.getUser()?.nombre || 'Usuario';
  readonly userInitials = () => {
    const parts = this.userName().trim().split(/\s+/).filter(Boolean).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() || '').join('') || 'US';
  };
  readonly userRoleLabel = () => this.formatRole(this.authService.getUser()?.rol || '');

  readonly homeMenuItems = computed(() => {
    const items = this.visibleMenuItems();
    const homeRoutes = new Set(['/dashboard', '/productos', '/categorias', '/usuarios', '/pedidos', '/notificaciones']);
    const order: Record<string, number> = {
      '/dashboard': 1,
      '/productos': 2,
      '/categorias': 3,
      '/usuarios': 4,
      '/pedidos': 5,
      '/notificaciones': 6
    };
    return items
      .filter(i => homeRoutes.has(i.route))
      .slice()
      .sort((a, b) => (order[a.route] ?? 999) - (order[b.route] ?? 999));
  });

  readonly managementMenuItems = computed(() => {
    const items = this.visibleMenuItems();
    const homeRoutes = new Set(['/dashboard', '/productos', '/categorias', '/usuarios', '/pedidos', '/notificaciones']);
    return items.filter(i => !homeRoutes.has(i.route));
  });

  /**
   * Cuando se navega a una ruta
   */
  onItemClick(): void {
    this.navigate.emit();
  }

  private formatRole(role: string): string {
    const roleLabels: Record<string, string> = {
      ADMIN: 'Administrador',
      VENTAS_VENDEDOR: 'Vendedor',
      VENTAS_SUPERVISOR: 'Supervisor de ventas',
      OPERACIONES_INVENTARIO: 'Inventario',
      OPERACIONES_LOGISTICA: 'Logistica',
      FINANZAS_CONTABILIDAD: 'Contabilidad',
      CLIENTE: 'Cliente'
    };
    return roleLabels[role] || role || 'Usuario';
  }
}
