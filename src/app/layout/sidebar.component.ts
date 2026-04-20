import { Component, inject, output, computed, OnInit } from '@angular/core';
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
      <!-- Logo -->
      <div class="logo-section">
        <div class="logo">
          <span class="logo-icon">T</span>
        </div>
        <span class="logo-text">TOLI</span>
      </div>

      <!-- Menú -->
      <mat-nav-list class="menu-list">
        @for (item of visibleMenuItems(); track item.route) {
          <a
            mat-list-item
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            class="menu-item"
          >
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
          </a>
        }
      </mat-nav-list>

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
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .logo {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-icon {
      font-size: 22px;
      font-weight: 700;
      color: white;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 1px;
    }

    .menu-list {
      flex: 1;
      padding: 16px 8px;
      background: transparent;
    }

    .menu-item {
      border-radius: 8px;
      margin-bottom: 4px;
      color: #a1a1aa;
      transition: all 0.2s ease;
    }

    .menu-item:hover {
      background: rgba(99, 102, 241, 0.1);
      color: #fff;
    }

    .menu-item.active {
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
    }

    .menu-item.active mat-icon {
      color: #818cf8;
    }

    .menu-item mat-icon {
      color: #71717a;
      margin-right: 12px;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .version-info {
      font-size: 12px;
      color: #52525b;
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
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['ADMIN', 'VENTAS_VENDEDOR', 'VENTAS_SUPERVISOR', 'OPERACIONES_INVENTARIO', 'OPERACIONES_LOGISTICA', 'FINANZAS_CONTABILIDAD', 'CLIENTE'] },
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

  /**
   * Cuando se navega a una ruta
   */
  onItemClick(): void {
    this.navigate.emit();
  }
}