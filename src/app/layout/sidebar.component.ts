import { ChangeDetectionStrategy, Component, inject, output, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../core/auth/auth.service';
import { Usuario } from '../core/models';

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
      border-radius: 14px;
      border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.10);
      overflow: hidden;
    }

    .section-title {
      padding: 18px 16px 8px;
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
      border-radius: 10px;
      margin-bottom: 4px;
      color: var(--text-secondary, #475569);
      transition: all 0.2s ease;
    }

    .menu-item:hover {
      background: rgba(15, 23, 42, 0.04);
      color: var(--text-primary, #0f172a);
    }

    .menu-item.active {
      background: color-mix(in srgb, var(--accent-primary, #10b981) 14%, transparent);
      color: var(--text-primary, #0f172a);
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

  readonly homeMenuItems = computed(() => {
    const items = this.visibleMenuItems();
    const homeRoutes = new Set(['/dashboard', '/productos', '/usuarios', '/pedidos', '/notificaciones']);
    const order: Record<string, number> = {
      '/dashboard': 1,
      '/productos': 2,
      '/usuarios': 3,
      '/pedidos': 4,
      '/notificaciones': 5
    };
    return items
      .filter(i => homeRoutes.has(i.route))
      .slice()
      .sort((a, b) => (order[a.route] ?? 999) - (order[b.route] ?? 999));
  });

  readonly managementMenuItems = computed(() => {
    const items = this.visibleMenuItems();
    const homeRoutes = new Set(['/dashboard', '/productos', '/usuarios', '/pedidos', '/notificaciones']);
    return items.filter(i => !homeRoutes.has(i.route));
  });

  /**
   * Cuando se navega a una ruta
   */
  onItemClick(): void {
    this.navigate.emit();
  }
}
