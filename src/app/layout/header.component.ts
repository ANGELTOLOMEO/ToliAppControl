import { ChangeDetectionStrategy, Component, inject, input, output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthService } from '../core/auth/auth.service';

/**
 * HeaderComponent - Header con título, usuario y logout
 * Muestra: título de página, nombre de usuario, notificaciones, logout
 */
@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="header-shell">
      <mat-toolbar class="header-toolbar">
        <button mat-icon-button class="menu-toggle" (click)="toggleSidenav()">
          <mat-icon>menu</mat-icon>
        </button>

        <div class="brand">
          <img class="brand-logo" src="/toli-logo.png" alt="Toli" />
          <div class="brand-copy">
            <div class="page-title">{{ pageTitle() }}</div>
            <div class="page-subtitle">{{ welcomeMessage() }}</div>
          </div>
        </div>

        <span class="spacer"></span>

        <div class="right-actions">
          <div class="action-group top-actions">
            <button mat-icon-button class="top-action" aria-label="Tema" (click)="toggleTheme()">
              <mat-icon>{{ themeDark() ? 'dark_mode' : 'light_mode' }}</mat-icon>
            </button>
            <button mat-icon-button class="top-action" aria-label="Paleta" (click)="showConfigurator.set(!showConfigurator())">
              <mat-icon>palette</mat-icon>
            </button>
            <button
              #calTrigger="matMenuTrigger"
              mat-icon-button
              class="top-action"
              aria-label="Calendario"
              [matMenuTriggerFor]="calendarMenu"
            >
              <mat-icon>calendar_today</mat-icon>
            </button>
          </div>

          <div class="action-divider" aria-hidden="true"></div>

          <div class="action-group">
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

            <button mat-icon-button class="top-action" aria-label="Usuario" [matMenuTriggerFor]="userMenu">
              <mat-icon>person</mat-icon>
            </button>
          </div>
        </div>

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

      @if (showConfigurator()) {
        <div class="sakai-panel" role="dialog" aria-label="Configuración">
          <div class="panel-section">
            <div class="panel-label">Primario</div>
            <div class="swatches">
              @for (c of primaryColors; track c) {
                <button class="swatch" type="button" [class.active]="primaryColor() === c" [style.background]="c" (click)="setPrimary(c)"></button>
              }
            </div>
          </div>

          <div class="panel-section">
            <div class="panel-label">Superficie</div>
            <div class="swatches">
              @for (s of surfaceColors; track s) {
                <button class="swatch" type="button" [class.active]="surfaceColor() === s" [style.background]="s" (click)="setSurface(s)"></button>
              }
            </div>
          </div>

          <div class="panel-section">
            <div class="panel-label">Ajustes predefinidos</div>
            <div class="preset-tabs">
              @for (p of presets; track p) {
                <button class="preset-tab" type="button" [class.active]="preset() === p" (click)="setPresetValue(p)">{{ p }}</button>
              }
            </div>
          </div>
        </div>
      }
    </div>

    <mat-menu #calendarMenu="matMenu" class="calendar-menu">
      <div class="calendar-wrapper">
        @if (selectedDate()) {
          <div class="calendar-label">Fecha: {{ selectedDate()!.toLocaleDateString('es-PE') }}</div>
        }
        <mat-calendar (selectedChange)="onCalendarSelect($event, calTrigger)"></mat-calendar>
      </div>
    </mat-menu>
  `,
  styles: [
    `
      .header-shell {
        position: relative;
        z-index: 20;
      }

      .header-toolbar {
        background:
          radial-gradient(1100px 180px at 10% 0%, rgba(16, 185, 129, 0.10), transparent 55%),
          radial-gradient(900px 180px at 100% 0%, rgba(59, 130, 246, 0.08), transparent 55%),
          color-mix(in srgb, var(--bg-secondary, #ffffff) 92%, transparent);
        border-bottom: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
        padding: 0 18px;
        height: 64px;
        display: flex;
        align-items: center;
        gap: 10px;
        backdrop-filter: blur(12px);
      }

      .menu-toggle {
        color: var(--text-primary, #0f172a);
      }

      .menu-toggle:hover {
        background: rgba(15, 23, 42, 0.06);
      }

      .spacer {
        flex: 1 1 auto;
      }

      .brand {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding-left: 4px;
        user-select: none;
      }

      .brand-copy {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
      }

      .page-title {
        font-size: 0.98rem;
        font-weight: 800;
        letter-spacing: 0.01em;
        color: var(--text-primary, #0f172a);
        line-height: 1.1;
      }

      .page-subtitle {
        font-size: 0.75rem;
        color: var(--text-tertiary, #64748b);
        line-height: 1.1;
      }

      .brand-logo {
        height: 40px;
        width: auto;
        display: block;
      }

      .right-actions {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .action-group {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px;
        border-radius: 14px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        background: rgba(255, 255, 255, 0.65);
      }

      :host-context(.dark) .action-group {
        border-color: rgba(148, 163, 184, 0.20);
        background: rgba(15, 23, 42, 0.24);
      }

      .action-divider {
        width: 1px;
        height: 26px;
        background: rgba(15, 23, 42, 0.12);
      }

      :host-context(.dark) .action-divider {
        background: rgba(148, 163, 184, 0.22);
      }

      .top-actions {
        margin-right: 0;
      }

      .top-action {
        color: var(--text-primary, #0f172a);
      }

      .top-action:hover {
        background: rgba(15, 23, 42, 0.06);
      }

      .top-action:focus-visible,
      .notification-btn:focus-visible,
      .menu-toggle:focus-visible {
        outline: 2px solid color-mix(in srgb, var(--accent-primary, #10b981) 65%, transparent);
        outline-offset: 2px;
      }

      .notification-btn {
        color: var(--text-primary, #0f172a);
      }

      .notification-btn:hover {
        background: rgba(15, 23, 42, 0.06);
      }

      /* Notification menu styles */
      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        font-weight: 600;
        color: var(--text-primary, #0f172a);
      }

      .no-notifications {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 24px;
        color: var(--text-tertiary, #64748b);
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
        background: color-mix(in srgb, var(--accent-primary, #10b981) 12%, transparent);
      }

      .unread-icon {
        color: var(--accent-primary, #10b981);
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
        color: var(--text-primary, #0f172a);
        line-height: 1.4;
      }

      .notification-time {
        font-size: 11px;
        color: var(--text-tertiary, #64748b);
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
        color: var(--text-tertiary, #64748b);
      }

      .user-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .user-name-full {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary, #0f172a);
      }

      .user-email {
        font-size: 12px;
        color: var(--text-tertiary, #64748b);
      }

      .user-role {
        font-size: 11px;
        color: var(--accent-primary, #10b981);
        background: color-mix(in srgb, var(--accent-primary, #10b981) 16%, transparent);
        padding: 2px 8px;
        border-radius: 4px;
        width: fit-content;
      }

      .sakai-panel {
        position: fixed;
        top: 74px;
        right: 16px;
        width: 260px;
        background: var(--bg-secondary, #ffffff);
        border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
        border-radius: 14px;
        padding: 14px;
        box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18);
        z-index: 10000;
      }

      .panel-section {
        display: grid;
        gap: 10px;
        padding: 10px 0;
        border-top: 1px solid rgba(15, 23, 42, 0.06);
      }

      .panel-section:first-of-type {
        border-top: none;
        padding-top: 0;
      }

      .panel-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-tertiary, #64748b);
      }

      .swatches {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .swatch {
        height: 26px;
        width: 26px;
        border-radius: 999px;
        border: 2px solid rgba(0, 0, 0, 0);
        cursor: pointer;
      }

      .swatch.active {
        border-color: var(--accent-primary, #10b981);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-primary, #10b981) 12%, transparent);
      }

      .preset-tabs {
        display: flex;
        gap: 6px;
        padding: 6px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.06);
        width: fit-content;
      }

      .preset-tab {
        height: 32px;
        padding: 0 14px;
        border-radius: 10px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--text-tertiary, #64748b);
        font-weight: 700;
        cursor: pointer;
      }

      .preset-tab.active {
        background: var(--bg-secondary, #ffffff);
        color: var(--text-primary, #0f172a);
        border-color: rgba(15, 23, 42, 0.08);
        box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08);
      }

      .calendar-wrapper {
        padding: 8px;
      }

      .calendar-label {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-tertiary, #64748b);
        padding: 6px 8px 10px;
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
        .brand-copy {
          display: none;
        }
        .top-actions {
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
  readonly pageTitle = input('Dashboard');

  // Output para logout
  readonly logout = output<void>();

  readonly themeDark = input(false);
  readonly primaryColor = input('#10b981');
  readonly surfaceColor = input('#ffffff');
  readonly preset = input('Aura');

  readonly themeDarkChange = output<boolean>();
  readonly primaryColorChange = output<string>();
  readonly surfaceColorChange = output<string>();
  readonly presetChange = output<string>();

  readonly showConfigurator = signal(false);
  readonly selectedDate = signal<Date | null>(null);
  readonly primaryColors = [
    '#334155',
    '#10b981',
    '#22c55e',
    '#84cc16',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#ec4899',
    '#ef4444'
  ];
  readonly surfaceColors = ['#ffffff', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155'];
  readonly presets = ['Aura', 'Lara', 'Nora'];

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
  readonly welcomeMessage = () => {
    const firstName = (this.authService.getUser()?.nombre || '').trim().split(' ')[0];
    return firstName ? `Hola, ${firstName}` : 'Bienvenido';
  };

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

  toggleTheme(): void {
    this.themeDarkChange.emit(!this.themeDark());
  }

  setPrimary(color: string): void {
    this.primaryColorChange.emit(color);
  }

  setSurface(color: string): void {
    this.surfaceColorChange.emit(color);
  }

  setPresetValue(preset: string): void {
    this.presetChange.emit(preset);
  }

  onCalendarSelect(date: Date, trigger?: any): void {
    this.selectedDate.set(date);
    if (trigger?.closeMenu) trigger.closeMenu();
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
