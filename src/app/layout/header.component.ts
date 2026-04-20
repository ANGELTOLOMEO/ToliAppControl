import { Component, inject, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../core/auth/auth.service';

/**
 * HeaderComponent - Header con título, usuario y logout
 * Muestra: título de página, nombre de usuario, notificaciones, logout
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
  ],
  template: `
    <mat-toolbar class="header-toolbar">
      <!-- Botón toggle sidebar (mobile) -->
      <button mat-icon-button class="menu-toggle" (click)="toggleSidenav()">
        <mat-icon>menu</mat-icon>
      </button>

      <!-- Espaciador -->
      <span class="spacer"></span>

      <!-- Notificaciones -->
      <button
        mat-icon-button
        class="notification-btn"
        [matMenuTriggerFor]="notificationMenu"
        [matBadge]="unreadCount()"
        [matBadgeHidden]="unreadCount() === 0"
        matBadgeColor="warn"
        matBadgeSize="small"
      >
        <mat-icon>notifications</mat-icon>
      </button>

      <mat-menu #notificationMenu="matMenu" class="notification-menu">
        <div class="notification-header">
          <span>Notificaciones</span>
          @if (unreadCount() > 0) {
            <button mat-button color="primary" (click)="markAllRead()">Markar todo leído</button>
          }
        </div>
        <mat-divider></mat-divider>
        @if (notifications().length === 0) {
          <div class="no-notifications">
            <mat-icon>notifications_none</mat-icon>
            <span>Sin notificaciones</span>
          </div>
        } @else {
          @for (notif of notifications().slice(0, 5); track notif.id) {
            <button mat-menu-item class="notification-item" [class.unread]="!notif.leida">
              <mat-icon [class.unread-icon]="!notif.leida">
                {{ notif.leida ? 'notifications' : 'fiber_manual_record' }}
              </mat-icon>
              <div class="notification-content">
                <span class="notification-message">{{ notif.contenido }}</span>
                <span class="notification-time">{{ formatTime(notif.creado_en) }}</span>
              </div>
            </button>
          }
        }
      </mat-menu>

      <!-- Usuario -->
      <button mat-button class="user-button" [matMenuTriggerFor]="userMenu">
        <mat-icon class="user-avatar">account_circle</mat-icon>
        <span class="user-name">{{ userName() }}</span>
        <mat-icon>expand_more</mat-icon>
      </button>

      <mat-menu #userMenu="matMenu">
        <div class="user-menu-header">
          <mat-icon class="user-avatar-large">account_circle</mat-icon>
          <div class="user-info">
            <span class="user-name-full">{{ userName() }}</span>
            <span class="user-email">{{ userEmail() }}</span>
            <span class="user-role">{{ userRole() }}</span>
          </div>
        </div>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="onProfile()">
          <mat-icon>person</mat-icon>
          <span>Perfil</span>
        </button>
        <button mat-menu-item (click)="onSettings()">
          <mat-icon>settings</mat-icon>
          <span>Configuración</span>
        </button>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="onLogout()" class="logout-item">
          <mat-icon>logout</mat-icon>
          <span>Cerrar Sesión</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [
    `
      .header-toolbar {
        background: #1a1a2e;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding: 0 16px;
        height: 64px;
        display: flex;
        align-items: center;
      }

      .menu-toggle {
        color: #a1a1aa;
      }

      .menu-toggle:hover {
        color: #fff;
      }

      .spacer {
        flex: 1 1 auto;
      }

      .notification-btn {
        color: #a1a1aa;
        margin-right: 8px;
      }

      .notification-btn:hover {
        color: #fff;
      }

      .user-button {
        color: #fff;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px 4px 4px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
      }

      .user-button:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .user-avatar {
        color: #71717a;
      }

      .user-name {
        font-size: 14px;
        font-weight: 500;
      }

      /* Notification menu styles */
      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        font-weight: 600;
        color: #fff;
      }

      .no-notifications {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 24px;
        color: #52525b;
      }

      .no-notifications mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .notification-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 16px;
        height: auto;
        white-space: normal;
      }

      .notification-item.unread {
        background: rgba(99, 102, 241, 0.1);
      }

      .unread-icon {
        color: #6366f1;
        font-size: 12px;
        width: 12px;
        height: 12px;
      }

      .notification-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-width: 250px;
      }

      .notification-message {
        font-size: 13px;
        color: #e4e4e7;
        line-height: 1.4;
      }

      .notification-time {
        font-size: 11px;
        color: #71717a;
      }

      /* User menu styles */
      .user-menu-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
      }

      .user-avatar-large {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #71717a;
      }

      .user-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .user-name-full {
        font-size: 14px;
        font-weight: 600;
        color: #fff;
      }

      .user-email {
        font-size: 12px;
        color: #a1a1aa;
      }

      .user-role {
        font-size: 11px;
        color: #6366f1;
        background: rgba(99, 102, 241, 0.2);
        padding: 2px 8px;
        border-radius: 4px;
        width: fit-content;
      }

      .logout-item {
        color: #ef4444;
      }

      .logout-item mat-icon {
        color: #ef4444;
      }

      @media (max-width: 768px) {
        .header-toolbar {
          padding: 0 8px;
        }

        .user-name {
          display: none;
        }
      }
    `,
  ],
})
export class HeaderComponent implements OnInit {
  private readonly authService = inject(AuthService);

  // Input para el sidenav
  readonly sidenav = input<any>();

  // Output para logout
  readonly logout = output<void>();

  // Lista de notificaciones (simulada por ahora)
  private _notifications = [
    {
      id: '1',
      contenido: 'Nuevo pedido #1234 recibido',
      leida: false,
      creado_en: new Date().toISOString(),
    },
    {
      id: '2',
      contenido: 'Pago confirmado para pedido #1233',
      leida: false,
      creado_en: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      contenido: 'Envío entregado: pedido #1232',
      leida: true,
      creado_en: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  // Getters del usuario
  readonly userName = () => this.authService.getUser()?.nombre || 'Usuario';
  readonly userEmail = () => this.authService.getUser()?.email || '';
  readonly userRole = () => this.formatRole(this.authService.getUser()?.rol || '');

  // Notificaciones
  readonly notifications = () => this._notifications;
  readonly unreadCount = () => this._notifications.filter((n) => !n.leida).length;

  ngOnInit(): void {
    // Por ahora las notificaciones son hardcodeadas
    // TODO: implementar servicio de notificaciones
  }

  /**
   * Toggle del sidenav
   */
  toggleSidenav(): void {
    const sidenav = this.sidenav();
    if (sidenav) {
      sidenav.toggle();
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  markAllRead(): void {
    this._notifications = this._notifications.map((n) => ({ ...n, leida: true }));
  }

  /**
   * Navegar a perfil
   */
  onProfile(): void {
    // TODO: implementar ruta de perfil
  }

  /**
   * Navegar a configuración
   */
  onSettings(): void {
    // TODO: implementar ruta de settings
  }

  /**
   * Logout
   */
  onLogout(): void {
    this.logout.emit();
  }

  /**
   * Formatear rol para display
   */
  private formatRole(role: string): string {
    const roleLabels: Record<string, string> = {
      ADMIN: 'Administrador',
      VENTAS_VENDEDOR: 'Vendedor',
      VENTAS_SUPERVISOR: 'Supervisor Ventas',
      OPERACIONES_INVENTARIO: 'Operario Inventario',
      OPERACIONES_LOGISTICA: 'Operario Logística',
      FINANZAS_CONTABILIDAD: 'Contabilidad',
      CLIENTE: 'Cliente',
    };
    return roleLabels[role] || role;
  }

  /**
   * Formatear tiempo relativo
   */
  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;

    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  }
}
