import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../core/auth/auth.service';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';

/**
 * LayoutComponent - Shell principal de la aplicación con Sidenav
 * Containers: sidebar + contenido principal
 * Modo: 'side' (desktop) / 'over' (mobile)
 */
@Component({
  selector: 'app-layout',
  standalone: true,
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
    <mat-sidenav-container class="sidenav-container">
      <!-- Sidebar -->
      <mat-sidenav
        #sidenav
        [mode]="sidenavMode()"
        [opened]="sidenavOpened()"
        class="sidenav"
        [class.overlay]="sidenavMode() === 'over'"
      >
        <app-sidebar (navigate)="onNavigate()"></app-sidebar>
      </mat-sidenav>

      <!-- Contenido Principal -->
      <mat-sidenav-content class="main-content">
        <!-- Header -->
        <app-header
          [sidenav]="sidenav"
          (logout)="onLogout()"
        ></app-header>

        <!-- Router Outlet -->
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
      width: 100vw;
    }

    .sidenav {
      width: 250px;
      background: #1a1a2e;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
    }

    .sidenav.overlay {
      width: 280px;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      background: #0f0f1a;
    }

    .content-area {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      background: #0f0f1a;
    }

    @media (max-width: 768px) {
      .content-area {
        padding: 16px;
      }
    }
  `]
})
export class LayoutComponent implements OnInit {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Signal para modo del sidenav (responsive)
  readonly sidenavMode = signal<'side' | 'over'>('side');

  // Signal para opened (solo en desktop)
  readonly sidenavOpened = signal(true);

  // Signal para el título de la página actual
  readonly pageTitle = signal('Dashboard');

  ngOnInit(): void {
    // Observar cambios de breakpoint para responsive sidenav
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
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
      })
    ).subscribe(title => {
      this.pageTitle.set(title);
    });
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

  /**
   * Obtener título desde la ruta
   */
  private getTitleFromRoute(url: string): string {
    const path = url.split('/')[1] || 'dashboard';
    const titles: Record<string, string> = {
      'dashboard': 'Dashboard',
      'usuarios': 'Usuarios',
      'productos': 'Productos',
      'pedidos': 'Pedidos',
      'envios': 'Envíos',
      'pagos': 'Pagos',
      'notificaciones': 'Notificaciones'
    };
    return titles[path] || 'Dashboard';
  }
}