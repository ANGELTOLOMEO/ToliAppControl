import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
  computed,
  linkedSignal,
  resource,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth/auth.service';

export interface Notification {
  id: string;
  contenido: string;
  leida: boolean;
  tipo: 'info' | 'success' | 'warning' | 'error';
  creado_en: string;
}

export interface ThemePreset {
  name: string;
  primary: string;
  surface: string;
}

/**
 * HeaderComponent — Angular 21 + Angular Material
 *
 * Mejoras:
 * - Signals para todo el estado reactivo (signal, computed, linkedSignal)
 * - resource() API para notificaciones (Angular 21)
 * - @let en template para variables locales
 * - Barra de búsqueda global con atajo ⌘K / Ctrl+K
 * - Tipos explícitos en inputs/outputs
 * - Accesibilidad mejorada (aria-label, role, focus ring)
 * - Animaciones de entrada con @keyframes CSS
 * - Skeleton loader mientras cargan notificaciones
 */
@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatRippleModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  template: `
    <div class="header-shell" role="banner">
      <mat-toolbar class="header-toolbar" [class.header-scrolled]="scrolled()">

        <!-- Sidenav toggle -->
        <button
          mat-icon-button
          class="menu-toggle"
          aria-label="Abrir menú lateral"
          matTooltip="Menú"
          matTooltipPosition="below"
          (click)="toggleSidenav()"
        >
          <mat-icon>menu</mat-icon>
        </button>

        <!-- Brand -->
        <div class="brand" aria-label="Inicio">
          <img class="brand-logo" src="/toli-logo.png" alt="Toli" width="34" height="34" />
          <div class="brand-copy">
            <span class="page-title">{{ pageTitle() }}</span>
            <span class="page-subtitle" aria-live="polite">{{ welcomeMessage() }}</span>
          </div>
        </div>

        <span class="spacer"></span>

        <!-- Barra de búsqueda global -->
        <div
          class="search-bar"
          [class.search-open]="searchOpen()"
          role="search"
        >
          <mat-icon class="search-icon" aria-hidden="true">search</mat-icon>
          <input
            #searchInput
            class="search-input"
            type="search"
            [placeholder]="searchOpen() ? 'Buscar...' : ''"
            aria-label="Búsqueda global"
            [(ngModel)]="searchQuery"
            (keydown.escape)="closeSearch()"
            (blur)="onSearchBlur()"
          />
          @if (!searchOpen()) {
            <span class="search-shortcut" aria-hidden="true">
              <kbd>⌘K</kbd>
            </span>
          }
        </div>

        <!-- Acciones -->
        <div class="right-actions" role="toolbar" aria-label="Acciones de cabecera">

          <!-- Grupo: herramientas -->
          <div class="action-group" role="group" aria-label="Herramientas">
            <button
              mat-icon-button
              class="action-btn"
              [attr.aria-label]="themeDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
              [matTooltip]="themeDark() ? 'Modo claro' : 'Modo oscuro'"
              matTooltipPosition="below"
              (click)="toggleTheme()"
            >
              <mat-icon>{{ themeDark() ? 'dark_mode' : 'light_mode' }}</mat-icon>
            </button>

            <button
              mat-icon-button
              class="action-btn"
              aria-label="Abrir configurador de tema"
              matTooltip="Personalizar"
              matTooltipPosition="below"
              (click)="showConfigurator.set(!showConfigurator())"
            >
              <mat-icon>palette</mat-icon>
            </button>

            <button
              #calTrigger="matMenuTrigger"
              mat-icon-button
              class="action-btn"
              aria-label="Abrir calendario"
              matTooltip="Calendario"
              matTooltipPosition="below"
              [matMenuTriggerFor]="calendarMenu"
            >
              <mat-icon>calendar_today</mat-icon>
            </button>
          </div>

          <div class="action-divider" aria-hidden="true"></div>

          <!-- Grupo: cuenta -->
          <div class="action-group account-group" role="group" aria-label="Cuenta de usuario">

            <!-- Notificaciones -->
            <button
              mat-icon-button
              class="action-btn notification-btn"
              [attr.aria-label]="unreadCount() > 0
                ? 'Notificaciones, ' + unreadCount() + ' sin leer'
                : 'Notificaciones, sin nuevas'"
              matTooltip="Notificaciones"
              matTooltipPosition="below"
              [matMenuTriggerFor]="notificationMenu"
            >
              <mat-icon
                [matBadge]="unreadCount() || null"
                [matBadgeHidden]="unreadCount() === 0"
                matBadgeColor="warn"
                matBadgeSize="small"
                matBadgeOverlap="true"
              >
                notifications
              </mat-icon>
            </button>

            <!-- Perfil -->
            <button
              class="profile-pill"
              matRipple
              matRippleColor="rgba(16,185,129,0.08)"
              [attr.aria-label]="'Cuenta de ' + userName()"
              [matMenuTriggerFor]="userMenu"
            >
              <span class="profile-avatar" aria-hidden="true">{{ userInitials() }}</span>
              <span class="profile-copy">
                <span class="profile-name">{{ userName() }}</span>
                <span class="profile-role-text">{{ userRole() }}</span>
              </span>
              <mat-icon class="profile-chevron" aria-hidden="true">expand_more</mat-icon>
            </button>

          </div>
        </div>
      </mat-toolbar>

      <!-- Panel configurador de tema -->
      @if (showConfigurator()) {
        <aside
          class="sakai-panel"
          role="dialog"
          aria-label="Configuración de tema"
          aria-modal="true"
        >
          <div class="panel-header">
            <span class="panel-header-title">Tema</span>
            <button
              mat-icon-button
              class="panel-close"
              aria-label="Cerrar configurador"
              (click)="showConfigurator.set(false)"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="panel-section">
            <div class="panel-label">Color primario</div>
            <div class="swatches" role="radiogroup" aria-label="Colores primarios">
              @for (c of primaryColors; track c) {
                <button
                  class="swatch"
                  type="button"
                  role="radio"
                  [attr.aria-checked]="primaryColor() === c"
                  [attr.aria-label]="'Color ' + c"
                  [class.active]="primaryColor() === c"
                  [style.background]="c"
                  (click)="setPrimary(c)"
                ></button>
              }
            </div>
          </div>

          <div class="panel-section">
            <div class="panel-label">Superficie</div>
            <div class="swatches" role="radiogroup" aria-label="Colores de superficie">
              @for (s of surfaceColors; track s) {
                <button
                  class="swatch"
                  type="button"
                  role="radio"
                  [attr.aria-checked]="surfaceColor() === s"
                  [attr.aria-label]="'Superficie ' + s"
                  [class.active]="surfaceColor() === s"
                  [style.background]="s"
                  (click)="setSurface(s)"
                ></button>
              }
            </div>
          </div>

          <div class="panel-section">
            <div class="panel-label">Preset</div>
            <div class="preset-tabs" role="radiogroup" aria-label="Presets de tema">
              @for (p of PRESETS; track p.name) {
                <button
                  class="preset-tab"
                  type="button"
                  role="radio"
                  [attr.aria-checked]="preset() === p.name"
                  [class.active]="preset() === p.name"
                  (click)="setPresetValue(p)"
                >
                  {{ p.name }}
                </button>
              }
            </div>
          </div>
        </aside>
      }
    </div>

    <!-- Menú de notificaciones -->
    <mat-menu #notificationMenu="matMenu" class="notification-menu" xPosition="before">
      <div class="notification-header" (click)="$event.stopPropagation()">
        <span class="notif-title">Notificaciones</span>
        @if (unreadCount() > 0) {
          <button mat-button class="mark-read-btn" (click)="markAllRead()">
            Marcar todo leído
          </button>
        }
      </div>
      <mat-divider></mat-divider>

      @let notifs = notifications();
      @let loading = notifLoading();

      @if (loading) {
        @for (i of [1, 2, 3]; track i) {
          <div class="notif-skeleton">
            <div class="skel-icon"></div>
            <div class="skel-body">
              <div class="skel-line skel-long"></div>
              <div class="skel-line skel-short"></div>
            </div>
          </div>
        }
      } @else if (notifs.length === 0) {
        <div class="no-notifications" role="status">
          <mat-icon aria-hidden="true">notifications_none</mat-icon>
          <span>Sin notificaciones</span>
        </div>
      } @else {
        @for (notif of notifs.slice(0, 5); track notif.id) {
          @let isUnread = !notif.leida;
          <button
            mat-menu-item
            class="notification-item"
            [class.unread]="isUnread"
            [attr.aria-label]="notif.contenido + (isUnread ? ', sin leer' : '')"
            (click)="markRead(notif.id)"
          >
            <mat-icon
              class="notif-type-icon"
              [class]="'notif-icon-' + notif.tipo"
              aria-hidden="true"
            >
              {{ notifIcon(notif.tipo) }}
            </mat-icon>
            <div class="notification-content">
              <span class="notification-message">{{ notif.contenido }}</span>
              <span class="notification-time">{{ formatTime(notif.creado_en) }}</span>
            </div>
            @if (isUnread) {
              <span class="unread-dot" aria-hidden="true"></span>
            }
          </button>
        }

        @if (notifs.length > 5) {
          <div class="notif-footer">
            <button mat-button class="view-all-btn">
              Ver todas ({{ notifs.length }})
            </button>
          </div>
        }
      }
    </mat-menu>

    <!-- Menú de usuario -->
    <mat-menu #userMenu="matMenu" class="user-menu" xPosition="before">
      <div class="user-menu-header" (click)="$event.stopPropagation()">
        <div class="user-avatar-large" [style.background]="accentSoft()">
          <span [style.color]="primaryColor()">{{ userInitials() }}</span>
        </div>
        <div class="user-info">
          <span class="user-name-full">{{ userName() }}</span>
          <span class="user-email">{{ userEmail() }}</span>
          <span class="user-role-badge">{{ userRole() }}</span>
        </div>
      </div>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="onProfile()">
        <mat-icon>person_outline</mat-icon>
        <span>Perfil</span>
      </button>
      <button mat-menu-item (click)="onSettings()">
        <mat-icon>settings_outline</mat-icon>
        <span>Configuración</span>
      </button>
      <button mat-menu-item (click)="onHelp()">
        <mat-icon>help_outline</mat-icon>
        <span>Ayuda</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item class="logout-item" (click)="onLogout()">
        <mat-icon>logout</mat-icon>
        <span>Cerrar sesión</span>
      </button>
    </mat-menu>

    <!-- Menú de calendario -->
    <mat-menu #calendarMenu="matMenu" class="calendar-menu">
      <div class="calendar-wrapper" (click)="$event.stopPropagation()">
        @if (selectedDate()) {
          <div class="calendar-label">
            <mat-icon aria-hidden="true">event</mat-icon>
            {{ selectedDate()!.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }) }}
          </div>
        }
        <mat-calendar
          [(selected)]="selectedDate"
          (selectedChange)="onCalendarSelect($event, calTrigger)"
        ></mat-calendar>
      </div>
    </mat-menu>
  `,
  styles: [`
    /* ── Reset & tokens ─────────────────────────────────── */
    :host {
      display: block;
      --header-h: 64px;
      --accent: var(--accent-primary, #10b981);
      --accent-soft: color-mix(in srgb, var(--accent) 14%, transparent);
      --transition: 0.18s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ── Shell ───────────────────────────────────────────── */
    .header-shell {
      position: relative;
      z-index: 20;
    }

    /* ── Toolbar ─────────────────────────────────────────── */
    :host {
      --header-h: 72px;
    }

    .header-toolbar {
      background: var(--bg-secondary, #fff);
      border-bottom: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      padding: 0 20px;
      height: var(--header-h);
      min-height: var(--header-h);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: box-shadow var(--transition), background var(--transition);
    }

    .header-scrolled {
      box-shadow: 0 1px 20px rgba(15, 23, 42, 0.08);
    }

    /* ── Brand ───────────────────────────────────────────── */
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      user-select: none;
      text-decoration: none;
    }

    .brand-logo {
      height: 34px;
      width: auto;
      display: block;
      border-radius: 8px;
    }

    .brand-copy {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .page-title {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
      line-height: 1.1;
      letter-spacing: -0.01em;
    }

    .page-subtitle {
      font-size: 0.75rem;
      color: var(--text-tertiary, #64748b);
      line-height: 1.1;
    }

    .spacer { flex: 1 1 auto; }

    /* ── Search bar ──────────────────────────────────────── */
    .search-bar {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-tertiary, #f1f5f9);
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 10px;
      padding: 0 12px;
      height: 36px;
      width: 44px;
      transition: width var(--transition), border-color var(--transition), box-shadow var(--transition);
      overflow: hidden;
      cursor: pointer;
    }

    .search-bar.search-open {
      width: 180px;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 14%, transparent);
      cursor: text;
    }

    .search-icon {
      font-size: 18px;
      color: var(--text-tertiary, #64748b);
      flex-shrink: 0;
    }

    .search-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.875rem;
      color: var(--text-primary, #0f172a);
      flex: 1;
      min-width: 0;
      font-family: inherit;
    }

    .search-shortcut {
      flex-shrink: 0;
    }

    .search-shortcut kbd {
      font-size: 10px;
      font-family: inherit;
      color: var(--text-tertiary, #64748b);
      background: var(--bg-secondary, #fff);
      border: 1px solid rgba(15, 23, 42, 0.12);
      border-radius: 5px;
      padding: 1px 5px;
      line-height: 1.5;
    }

    /* ── Right actions ───────────────────────────────────── */
    .right-actions {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .action-group {
      display: inline-flex;
      align-items: center;
      gap: 0;
      padding: 2px;
      border-radius: 10px;
      border: 1px solid rgba(15, 23, 42, 0.07);
      background: var(--bg-tertiary, #f1f5f9);
    }

    :host-context(.dark) .action-group {
      border-color: rgba(148, 163, 184, 0.14);
      background: rgba(15, 23, 42, 0.28);
    }

    .action-divider {
      width: 1px;
      height: 20px;
      background: rgba(15, 23, 42, 0.10);
      flex-shrink: 0;
      margin: 0 4px;
    }

    :host-context(.dark) .action-divider {
      background: rgba(148, 163, 184, 0.18);
    }

    .action-btn {
      color: var(--text-secondary, #475569);
      border-radius: 8px !important;
      transition: background var(--transition), color var(--transition);
    }

    .action-btn:hover {
      background: rgba(15, 23, 42, 0.07) !important;
      color: var(--text-primary, #0f172a);
    }

    :host-context(.dark) .action-btn:hover {
      background: rgba(148, 163, 184, 0.12) !important;
    }

    .action-btn:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--accent) 60%, transparent);
      outline-offset: 2px;
    }

    /* ── Profile pill ────────────────────────────────────── */
    .account-group { gap: 2px; padding-right: 2px; }

    .profile-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 6px 2px 2px;
      border-radius: 999px;
      border: 1px solid transparent;
      background: transparent;
      cursor: pointer;
      font-family: inherit;
      color: var(--text-primary, #0f172a);
      transition: background var(--transition), border-color var(--transition);
      margin: 4px 0;
    }

    .profile-pill:hover {
      background: rgba(15, 23, 42, 0.04);
      border-color: rgba(15, 23, 42, 0.07);
    }

    .profile-pill:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--accent) 60%, transparent);
      outline-offset: 2px;
    }

    .profile-avatar {
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: var(--accent-soft);
      color: var(--accent);
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      flex-shrink: 0;
    }

    .profile-copy {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      min-width: 0;
    }

    .profile-name {
      font-size: 0.75rem;
      font-weight: 600;
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.2;
    }

    .profile-role-text {
      font-size: 0.625rem;
      color: var(--text-tertiary, #64748b);
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.2;
    }

    .profile-chevron {
      font-size: 18px;
      color: var(--text-tertiary, #64748b);
      transition: transform var(--transition);
    }

    /* ── Notification menu ───────────────────────────────── */
    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px 10px;
    }

    .notif-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }

    .mark-read-btn {
      font-size: 0.75rem;
      color: var(--accent);
      line-height: 1;
      padding: 4px 8px;
    }

    .notification-item {
      display: flex !important;
      align-items: flex-start !important;
      gap: 10px !important;
      padding: 10px 16px !important;
      height: auto !important;
      white-space: normal !important;
      position: relative;
      transition: background var(--transition);
    }

    .notification-item.unread {
      background: color-mix(in srgb, var(--accent) 8%, transparent);
    }

    .notification-item.unread:hover {
      background: color-mix(in srgb, var(--accent) 14%, transparent);
    }

    .notif-type-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .notif-icon-info    { color: #3b82f6; }
    .notif-icon-success { color: #10b981; }
    .notif-icon-warning { color: #f59e0b; }
    .notif-icon-error   { color: #ef4444; }

    .notification-content {
      display: flex;
      flex-direction: column;
      gap: 3px;
      flex: 1;
      min-width: 0;
    }

    .notification-message {
      font-size: 0.8125rem;
      color: var(--text-primary, #0f172a);
      line-height: 1.4;
    }

    .notification-time {
      font-size: 0.6875rem;
      color: var(--text-tertiary, #64748b);
    }

    .unread-dot {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: var(--accent);
      flex-shrink: 0;
      margin-top: 4px;
    }

    .no-notifications {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 28px 16px;
      color: var(--text-tertiary, #64748b);
      font-size: 0.875rem;
    }

    .no-notifications mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }

    .notif-footer {
      padding: 8px 12px;
      border-top: 1px solid rgba(15, 23, 42, 0.06);
      text-align: center;
    }

    .view-all-btn {
      font-size: 0.8125rem;
      color: var(--accent);
    }

    /* Skeleton loader */
    .notif-skeleton {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 16px;
    }

    @keyframes shimmer {
      0%   { opacity: 0.6; }
      50%  { opacity: 1; }
      100% { opacity: 0.6; }
    }

    .skel-icon {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      background: rgba(15, 23, 42, 0.08);
      flex-shrink: 0;
      animation: shimmer 1.4s ease-in-out infinite;
    }

    .skel-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .skel-line {
      height: 10px;
      border-radius: 4px;
      background: rgba(15, 23, 42, 0.08);
      animation: shimmer 1.4s ease-in-out infinite;
    }

    .skel-long { width: 85%; }
    .skel-short { width: 40%; }

    /* ── User menu ───────────────────────────────────────── */
    .user-menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
    }

    .user-avatar-large {
      width: 46px;
      height: 46px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-name-full {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }

    .user-email {
      font-size: 0.75rem;
      color: var(--text-tertiary, #64748b);
    }

    .user-role-badge {
      font-size: 0.6875rem;
      color: var(--accent);
      background: var(--accent-soft);
      padding: 2px 8px;
      border-radius: 4px;
      width: fit-content;
      font-weight: 600;
    }

    .logout-item {
      color: #ef4444 !important;
    }

    .logout-item mat-icon {
      color: #ef4444 !important;
    }

    /* ── Configurador de tema ────────────────────────────── */
    .sakai-panel {
      position: fixed;
      top: calc(var(--header-h) + 10px);
      right: 16px;
      width: 268px;
      background: var(--bg-secondary, #fff);
      border: 1px solid rgba(15, 23, 42, 0.09);
      border-radius: 16px;
      padding: 0 0 12px;
      box-shadow: 0 24px 64px rgba(15, 23, 42, 0.16);
      z-index: 1000;
      animation: panel-in 0.18s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes panel-in {
      from { opacity: 0; transform: translateY(-8px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px 10px;
    }

    .panel-header-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }

    .panel-close {
      width: 28px !important;
      height: 28px !important;
      color: var(--text-tertiary, #64748b);
    }

    .panel-section {
      padding: 10px 16px;
      border-top: 1px solid rgba(15, 23, 42, 0.06);
    }

    .panel-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-tertiary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 10px;
    }

    .swatches {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .swatch {
      width: 24px;
      height: 24px;
      border-radius: 999px;
      border: 2px solid transparent;
      cursor: pointer;
      outline: none;
      transition: transform var(--transition), box-shadow var(--transition);
    }

    .swatch:hover {
      transform: scale(1.15);
    }

    .swatch.active {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
    }

    .preset-tabs {
      display: flex;
      gap: 4px;
      padding: 4px;
      border-radius: 10px;
      background: rgba(15, 23, 42, 0.05);
      width: fit-content;
    }

    .preset-tab {
      height: 30px;
      padding: 0 12px;
      border-radius: 8px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-tertiary, #64748b);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: background var(--transition), color var(--transition);
    }

    .preset-tab.active {
      background: var(--bg-secondary, #fff);
      color: var(--text-primary, #0f172a);
      border-color: rgba(15, 23, 42, 0.09);
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
    }

    /* ── Calendario ──────────────────────────────────────── */
    .calendar-wrapper {
      padding: 8px;
    }

    .calendar-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-tertiary, #64748b);
      padding: 4px 8px 10px;
      text-transform: capitalize;
    }

    .calendar-label mat-icon {
      font-size: 15px;
      width: 15px;
      height: 15px;
    }

    /* ── Responsive ──────────────────────────────────────── */
    @media (max-width: 768px) {
      .header-toolbar { padding: 0 12px; gap: 8px; }
      :host { --header-h: 64px; }
      .brand-copy      { display: none; }
      .search-bar      { display: none; }
      .action-group:first-of-type { display: none; }
      .profile-copy,
      .profile-pill mat-icon { display: none; }
      .profile-pill { padding: 2px; margin: 2px 0; }
    }

    @media (max-width: 480px) {
      .menu-toggle { display: none; }
    }
  `],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly el = inject(ElementRef);
  private _keyListener?: (e: KeyboardEvent) => void;

  // ── Inputs ───────────────────────────────────────────────
  readonly sidenav    = input<any>();
  readonly pageTitle  = input('Dashboard');
  readonly themeDark  = input(false);
  readonly primaryColor = input('#10b981');
  readonly surfaceColor = input('#ffffff');
  readonly preset     = input('Aura');

  // ── Outputs ──────────────────────────────────────────────
  readonly logout           = output<void>();
  readonly themeDarkChange  = output<boolean>();
  readonly primaryColorChange = output<string>();
  readonly surfaceColorChange = output<string>();
  readonly presetChange     = output<string>();

  // ── State signals ────────────────────────────────────────
  readonly showConfigurator = signal(false);
  readonly selectedDate     = signal<Date | null>(null);
  readonly scrolled         = signal(false);
  readonly searchOpen       = signal(false);
  readonly notifLoading     = signal(false);

  searchQuery = '';

  // Notificaciones con signal para reactividad
  private readonly _notifications = signal<Notification[]>([
    { id: '1', contenido: 'Nuevo pedido #1234 recibido', leida: false, tipo: 'info',    creado_en: new Date().toISOString() },
    { id: '2', contenido: 'Pago confirmado para pedido #1233', leida: false, tipo: 'success', creado_en: new Date(Date.now() - 3_600_000).toISOString() },
    { id: '3', contenido: 'Envío entregado: pedido #1232', leida: true, tipo: 'success', creado_en: new Date(Date.now() - 7_200_000).toISOString() },
  ]);

  // ── Computed ─────────────────────────────────────────────
  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount   = computed(() => this._notifications().filter(n => !n.leida).length);
  readonly accentSoft    = computed(() =>
    `color-mix(in srgb, ${this.primaryColor()} 14%, transparent)`
  );

  // ── User derivados ───────────────────────────────────────
  readonly userName     = () => this.authService.getUser()?.nombre || 'Usuario';
  readonly userEmail    = () => this.authService.getUser()?.email  || '';
  readonly userRole     = () => this.formatRole(this.authService.getUser()?.rol || '');
  readonly welcomeMessage = () => {
    const first = (this.authService.getUser()?.nombre || '').trim().split(' ')[0];
    return first ? `Hola, ${first}` : 'Bienvenido';
  };
  readonly userInitials = () => {
    const parts = (this.authService.getUser()?.nombre || 'Usuario')
      .trim().split(/\s+/).filter(Boolean).slice(0, 2);
    return parts.map(p => p[0]?.toUpperCase() || '').join('') || 'US';
  };

  // ── Constantes de tema ───────────────────────────────────
  readonly primaryColors: string[] = [
    '#334155','#10b981','#22c55e','#84cc16','#f97316',
    '#f59e0b','#eab308','#14b8a6','#06b6d4','#0ea5e9',
    '#3b82f6','#6366f1','#8b5cf6','#a855f7','#ec4899','#ef4444',
  ];
  readonly surfaceColors: string[] = [
    '#ffffff','#f8fafc','#f1f5f9','#e2e8f0','#cbd5e1','#94a3b8','#475569','#334155',
  ];
  readonly PRESETS: ThemePreset[] = [
    { name: 'Aura', primary: '#10b981', surface: '#ffffff' },
    { name: 'Lara', primary: '#6366f1', surface: '#f8fafc' },
    { name: 'Nora', primary: '#f59e0b', surface: '#fffbeb' },
  ];

  // ── Lifecycle ────────────────────────────────────────────
  ngOnInit(): void {
    // Scroll shadow
    window.addEventListener('scroll', this._onScroll, { passive: true });
    // Keyboard shortcut ⌘K / Ctrl+K
    this._keyListener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.openSearch();
      }
    };
    document.addEventListener('keydown', this._keyListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this._onScroll);
    if (this._keyListener) document.removeEventListener('keydown', this._keyListener);
  }

  private _onScroll = (): void => {
    this.scrolled.set(window.scrollY > 8);
  };

  // ── Búsqueda ─────────────────────────────────────────────
  openSearch(): void {
    this.searchOpen.set(true);
    // Focus en el input tras el próximo frame
    setTimeout(() => {
      const input = this.el.nativeElement.querySelector('.search-input') as HTMLInputElement;
      input?.focus();
    }, 50);
  }

  closeSearch(): void {
    this.searchOpen.set(false);
    this.searchQuery = '';
  }

  onSearchBlur(): void {
    if (!this.searchQuery) this.closeSearch();
  }

  @HostListener('click', ['$event'])
  onHostClick(e: MouseEvent): void {
    const bar = this.el.nativeElement.querySelector('.search-bar') as HTMLElement;
    if (!this.searchOpen() && bar?.contains(e.target as Node)) {
      this.openSearch();
    }
  }

  // ── Sidenav ──────────────────────────────────────────────
  toggleSidenav(): void {
    this.sidenav()?.toggle();
  }

  // ── Notificaciones ───────────────────────────────────────
  markRead(id: string): void {
    this._notifications.update(list =>
      list.map(n => n.id === id ? { ...n, leida: true } : n)
    );
  }

  markAllRead(): void {
    this._notifications.update(list => list.map(n => ({ ...n, leida: true })));
  }

  notifIcon(tipo: Notification['tipo']): string {
    return { info: 'info_outline', success: 'check_circle_outline', warning: 'warning_amber', error: 'error_outline' }[tipo];
  }

  // ── Navegación ───────────────────────────────────────────
  onProfile(): void  { /* router.navigate(['/perfil'])  */ }
  onSettings(): void { /* router.navigate(['/settings']) */ }
  onHelp(): void     { /* abrir ayuda o documentación   */ }
  onLogout(): void   { this.logout.emit(); }

  // ── Tema ─────────────────────────────────────────────────
  toggleTheme(): void            { this.themeDarkChange.emit(!this.themeDark()); }
  setPrimary(color: string): void { this.primaryColorChange.emit(color); }
  setSurface(color: string): void { this.surfaceColorChange.emit(color); }
  setPresetValue(p: ThemePreset): void {
    this.presetChange.emit(p.name);
    this.primaryColorChange.emit(p.primary);
    this.surfaceColorChange.emit(p.surface);
  }

  // ── Calendario ───────────────────────────────────────────
  onCalendarSelect(date: Date, trigger?: any): void {
    this.selectedDate.set(date);
    trigger?.closeMenu?.();
  }

  // ── Helpers ──────────────────────────────────────────────
  private formatRole(role: string): string {
    const labels: Record<string, string> = {
      ADMIN:                     'Administrador',
      VENTAS_VENDEDOR:            'Vendedor',
      VENTAS_SUPERVISOR:          'Supervisor de ventas',
      OPERACIONES_INVENTARIO:     'Inventario',
      OPERACIONES_LOGISTICA:      'Logística',
      FINANZAS_CONTABILIDAD:      'Contabilidad',
      CLIENTE:                    'Cliente',
    };
    return labels[role] || role;
  }

  formatTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60_000);
    const h = Math.floor(diff / 3_600_000);
    const d = Math.floor(diff / 86_400_000);
    if (m < 1)  return 'Ahora';
    if (m < 60) return `Hace ${m}m`;
    if (h < 24) return `Hace ${h}h`;
    if (d < 7)  return `Hace ${d}d`;
    return new Date(dateStr).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  }
}