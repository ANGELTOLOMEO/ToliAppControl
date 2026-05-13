import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ViewChild, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { filter, map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../core/auth/auth.service';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';
import { LayoutService } from './service/layout.service';

/**
 * LayoutComponent - Shell principal de la aplicación con Sidenav
 * Containers: sidebar + contenido principal
 * Modo: 'side' (desktop) / 'over' (mobile)
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.dark]': 'isDark()'
  },
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    SidebarComponent,
    HeaderComponent
  ],
  template: `
    <div class="app-shell" [style.--app-primary]="primaryColor()" [style.--app-surface]="surfaceColor()">
      <app-header
        [sidenav]="sidenav"
        [pageTitle]="pageTitle()"
        (logout)="onLogout()"
        [themeDark]="isDark()"
        [primaryColor]="primaryColor()"
        [surfaceColor]="surfaceColor()"
        [preset]="preset()"
        (themeDarkChange)="setTheme($event)"
        (primaryColorChange)="setPrimaryColor($event)"
        (surfaceColorChange)="setSurfaceColor($event)"
        (presetChange)="setPreset($event)"
      ></app-header>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav
          #sidenavRef
          [mode]="sidenavMode()"
          [opened]="sidenavOpened()"
          class="sidenav"
          [class.overlay]="sidenavMode() === 'over'"
        >
          <app-sidebar (navigate)="onNavigate()"></app-sidebar>
        </mat-sidenav>

        <mat-sidenav-content class="main-content">
          <main class="content-area">
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit, AfterViewInit {
  @ViewChild('sidenavRef') sidenav?: MatSidenav;

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly layoutService = inject(LayoutService);

  // Signal para modo del sidenav (responsive)
  readonly sidenavMode = signal<'side' | 'over'>('side');

  // Signal para opened (solo en desktop)
  readonly sidenavOpened = signal(true);

  // Signal para el título de la página actual
  readonly pageTitle = signal('Dashboard');

  readonly isDark = computed(() => this.layoutService.layoutConfig().darkTheme);
  readonly primaryColor = computed(() => this.layoutService.layoutConfig().primaryColor);
  readonly surfaceColor = computed(() => this.layoutService.layoutConfig().surfaceColor);
  readonly preset = computed(() => this.layoutService.layoutConfig().preset);

  constructor() {
    effect(() => {
      const dark = this.isDark();
      const primary = this.primaryColor();
      const surface = this.surfaceColor();

      if (typeof document === 'undefined') return;

      const root = document.documentElement;
      root.classList.toggle('dark', dark);
      root.style.setProperty('--app-primary', primary);
      root.style.setProperty('--app-surface', this.coerceSurfaceForMode(surface, dark));
    });
  }

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    // Observar cambios de breakpoint para responsive sidenav
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result.matches) {
          // Mobile/tablet: modo overlay
          this.sidenavMode.set('over');
          this.sidenavOpened.set(false);
        } else {
          // Desktop: modo side
          this.sidenavMode.set('side');
          this.sidenavOpened.set(true);
        }
      });

    // Actualizar título según ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => {
        const nav = event as NavigationEnd;
        return this.getTitleFromRoute(nav.urlAfterRedirects);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(title => this.pageTitle.set(title));
  }

  /**
   * Manejar navegación - cerrar sidenav en mobile
   */
  onNavigate(): void {
    if (this.sidenavMode() === 'over') {
      // El sidebar se cierra automáticamente via event
    }
  }

  /**
   * Manejar logout
   */
  onLogout(): void {
    this.authService.logout();
  }

  setTheme(isDark: boolean): void {
    this.layoutService.setDarkTheme(isDark);
  }

  setPrimaryColor(color: string): void {
    this.layoutService.setPrimaryColor(color);
  }

  setSurfaceColor(color: string): void {
    this.layoutService.setSurfaceColor(color);
  }

  setPreset(preset: string): void {
    this.layoutService.setPreset(preset);
  }

  /**
   * Obtener título desde la ruta
   */
  private getTitleFromRoute(url: string): string {
    const path = url.split('/')[1] || 'dashboard';
    const titles: Record<string, string> = {
      'dashboard': 'Dashboard',
      'usuarios': 'Usuarios',
      'productos': 'Productos',
      'categorias': 'Categorias',
      'pedidos': 'Pedidos',
      'envios': 'Envíos',
      'pagos': 'Pagos',
      'notificaciones': 'Notificaciones'
    };
    return titles[path] || 'Dashboard';
  }

  private coerceSurfaceForMode(value: string, dark: boolean): string {
    const fallback = dark ? '#0f172a' : '#ffffff';
    const hex = this.normalizeHexColor(value);
    if (!hex) return fallback;

    const lum = this.relativeLuminance(hex);
    if (dark && lum > 0.55) return '#0f172a';
    if (!dark && lum < 0.25) return '#ffffff';
    return hex;
  }

  private normalizeHexColor(value: string): string | null {
    const v = (value ?? '').trim();
    if (!v) return null;
    const m = /^#?([0-9a-fA-F]{6})$/.exec(v);
    if (!m) return null;
    return `#${m[1].toLowerCase()}`;
  }

  private relativeLuminance(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    const rl = toLinear(r);
    const gl = toLinear(g);
    const bl = toLinear(b);
    return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
  }
}
