import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login.component';
import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guard';

/**
 * Constantes de roles para usar en las rutas
 */
const ROLES = {
  ADMIN: 'ADMIN',
  OPERACIONES_INVENTARIO: 'OPERACIONES_INVENTARIO',
  OPERACIONES_LOGISTICA: 'OPERACIONES_LOGISTICA',
  VENTAS_LOCAL: 'VENTAS_LOCAL',
  VENTAS_ONLINE: 'VENTAS_ONLINE',
  FINANZAS_COBRANZAS: 'FINANZAS_COBRANZAS',
  FINANZAS_CONTABILIDAD: 'FINANZAS_CONTABILIDAD',
  CLIENTE: 'CLIENTE'
} as const;

export const routes: Routes = [
  // ============================================
  // RUTAS PÚBLICAS
  // ============================================
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard]
  },

  // ============================================
  // RUTAS PROTEGIDAS (con autenticación)
  // ============================================
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      // ----------------------------------------
      // Dashboard - Accesible por todos los roles autenticados
      // ----------------------------------------
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // ----------------------------------------
      // Usuarios - Solo ADMIN
      // ----------------------------------------
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: { allowRoles: [ROLES.ADMIN] } },
        loadComponent: () => import('./features/usuarios/usuarios-list.component').then(m => m.UsuariosListComponent)
      },
      {
        path: 'usuarios/nuevo',
        canActivate: [roleGuard],
        data: { roles: { allowRoles: [ROLES.ADMIN] } },
        loadComponent: () => import('./features/usuarios/usuarios-form.component').then(m => m.UsuariosFormComponent)
      },
      {
        path: 'usuarios/:id',
        canActivate: [roleGuard],
        data: { roles: { allowRoles: [ROLES.ADMIN] } },
        loadComponent: () => import('./features/usuarios/usuarios-form.component').then(m => m.UsuariosFormComponent)
      },

      // ----------------------------------------
      // Productos - ADMIN, OPERACIONES_INVENTARIO
      // ----------------------------------------
      {
        path: 'productos',
        canActivate: [roleGuard],
        data: { roles: { allowRoles: [ROLES.ADMIN, ROLES.OPERACIONES_INVENTARIO] } },
        loadComponent: () => import('./features/productos/productos-list.component').then(m => m.ProductosListComponent)
      },
      {
        path: 'productos/nuevo',
        canActivate: [roleGuard],
        data: { roles: { allowRoles: [ROLES.ADMIN, ROLES.OPERACIONES_INVENTARIO] } },
        loadComponent: () => import('./features/productos/productos-form.component').then(m => m.ProductosFormComponent)
      },
      {
        path: 'productos/:id',
        canActivate: [roleGuard],
        data: { roles: { allowRoles: [ROLES.ADMIN, ROLES.OPERACIONES_INVENTARIO] } },
        loadComponent: () => import('./features/productos/productos-form.component').then(m => m.ProductosFormComponent)
      },

      // ----------------------------------------
      // Categorias - ADMIN, OPERACIONES_INVENTARIO
      // ----------------------------------------
      {
        path: 'categorias',
        canActivate: [roleGuard],
        data: { roles: { allowRoles: [ROLES.ADMIN, ROLES.OPERACIONES_INVENTARIO] } },
        loadComponent: () => import('./features/categorias/categorias-list.component').then(m => m.CategoriasListComponent)
      },

      // ----------------------------------------
      // Pedidos - ADMIN, VENTAS_*, OPERACIONES_*, FINANZAS_*, CLIENTE
      // ----------------------------------------
      {
        path: 'pedidos',
        canActivate: [roleGuard],
        data: { 
          roles: { 
            allowRoles: [
              ROLES.ADMIN, 
              ROLES.VENTAS_LOCAL, 
              ROLES.VENTAS_ONLINE,
              ROLES.OPERACIONES_INVENTARIO,
              ROLES.OPERACIONES_LOGISTICA,
              ROLES.FINANZAS_COBRANZAS,
              ROLES.FINANZAS_CONTABILIDAD,
              ROLES.CLIENTE
            ],
            allowPrefixes: ['VENTAS', 'OPERACIONES', 'FINANZAS']
          } 
        },
        loadComponent: () => import('./features/pedidos/pedidos-list.component').then(m => m.PedidosListComponent)
      },
      {
        path: 'pedidos/:id',
        canActivate: [roleGuard],
        data: { 
          roles: { 
            allowRoles: [
              ROLES.ADMIN, 
              ROLES.VENTAS_LOCAL, 
              ROLES.VENTAS_ONLINE,
              ROLES.OPERACIONES_INVENTARIO,
              ROLES.OPERACIONES_LOGISTICA,
              ROLES.FINANZAS_COBRANZAS,
              ROLES.FINANZAS_CONTABILIDAD,
              ROLES.CLIENTE
            ],
            allowPrefixes: ['VENTAS', 'OPERACIONES', 'FINANZAS']
          } 
        },
        loadComponent: () => import('./features/pedidos/pedidos-form.component').then(m => m.PedidosFormComponent)
      },

      // ----------------------------------------
      // Envíos - ADMIN, OPERACIONES_LOGISTICA, CLIENTE
      // ----------------------------------------
      {
        path: 'envios',
        canActivate: [roleGuard],
        data: { 
          roles: { 
            allowRoles: [
              ROLES.ADMIN, 
              ROLES.OPERACIONES_LOGISTICA,
              ROLES.CLIENTE
            ],
            allowPrefixes: ['OPERACIONES', 'FINANZAS']
          } 
        },
        loadComponent: () => import('./features/envios/envios-list.component').then(m => m.EnviosListComponent)
      },
      {
        path: 'envios/:id',
        canActivate: [roleGuard],
        data: { 
          roles: { 
            allowRoles: [
              ROLES.ADMIN, 
              ROLES.OPERACIONES_LOGISTICA,
              ROLES.CLIENTE
            ],
            allowPrefixes: ['OPERACIONES', 'FINANZAS']
          } 
        },
        loadComponent: () => import('./features/envios/envios-form.component').then(m => m.EnviosFormComponent)
      },

      // ----------------------------------------
      // Pagos - ADMIN, FINANZAS_*, CLIENTE
      // ----------------------------------------
      {
        path: 'pagos',
        canActivate: [roleGuard],
        data: { 
          roles: { 
            allowRoles: [
              ROLES.ADMIN, 
              ROLES.FINANZAS_COBRANZAS,
              ROLES.FINANZAS_CONTABILIDAD,
              ROLES.CLIENTE
            ],
            allowPrefixes: ['FINANZAS']
          } 
        },
        loadComponent: () => import('./features/pagos/pagos-list.component').then(m => m.PagosListComponent)
      },
      {
        path: 'pagos/:id',
        canActivate: [roleGuard],
        data: { 
          roles: { 
            allowRoles: [
              ROLES.ADMIN, 
              ROLES.FINANZAS_COBRANZAS,
              ROLES.FINANZAS_CONTABILIDAD,
              ROLES.CLIENTE
            ],
            allowPrefixes: ['FINANZAS']
          } 
        },
        loadComponent: () => import('./features/pagos/pagos-form.component').then(m => m.PagosFormComponent)
      },

      // ----------------------------------------
      // Notificaciones - Accesible por todos los roles autenticados
      // ----------------------------------------
      {
        path: 'notificaciones',
        loadComponent: () => import('./features/notificaciones/notificaciones-panel.component').then(m => m.NotificacionesPanelComponent)
      },
      {
        path: 'notificaciones/:id',
        loadComponent: () => import('./features/notificaciones/notificaciones-form.component').then(m => m.NotificacionesFormComponent)
      }
    ]
  },

  // ============================================
  // WILDCARD - Redirección final
  // ============================================
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
