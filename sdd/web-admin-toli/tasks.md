# Tasks: Web Admin TOLI

## Fase 1: Foundation

- [ ] 1.1 Instalar Angular Material: `ng add @angular/material` (configurar dark theme)
- [ ] 1.2 Crear `src/app/core/models/index.ts` con interfaces (Usuario, Producto, Pedido, Envio, Pago, Notificacion, AuthResponse)
- [ ] 1.3 Crear `src/environments/environment.ts` con `API_URL: 'http://localhost:3000/api'`
- [ ] 1.4 Crear `src/environments/environment.prod.ts`
- [ ] 1.5 Crear `src/app/core/services/api.service.ts` con HttpClient base

## Fase 2: Auth

- [ ] 2.1 Crear `src/app/core/auth/auth.service.ts` (login, logout, getUser, isLoggedIn, token getter)
- [ ] 2.2 Crear `src/app/core/auth/token.interceptor.ts` (agrega Authorization header + 401 handler)
- [ ] 2.3 Crear `src/app/core/auth/auth.guard.ts` (canActivate: verifica token + rol)
- [ ] 2.4 Crear `src/app/core/auth/login.component.ts` (template driven form, validaciones)

## Fase 3: Layout

- [x] 3.1 Crear `src/app/layout/layout.component.ts` (shell with router-outlet)
- [x] 3.2 Crear `src/app/layout/sidebar.component.ts` (menú dinámico por rol desde AuthService)
- [x] 3.3 Crear `src/app/layout/header.component.ts` (user name + logout button)
- [x] 3.4 Agregar estilos en `src/app/layout/layout.component.scss`

## Fase 4: Dashboard

- [ ] 4.1 Crear `src/app/core/services/dashboard.service.ts` (KPIs endpoint)
- [ ] 4.2 Crear `src/app/features/dashboard/dashboard.component.ts` (4 KPI cards)
- [ ] 4.3 Agregar tabla de últimos 10 pedidos en DashboardComponent
- [ ] 4.4 Agregar navegación a detalle de pedido

## Fase 5: Usuarios (ADMIN only)

- [ ] 5.1 Crear `src/app/core/services/usuarios.service.ts` (CRUD + listar roles)
- [ ] 5.2 Crear `src/app/features/usuarios/usuarios-list.component.ts` (MatTable, paginator, filter)
- [ ] 5.3 Crear `src/app/features/usuarios/usuario-form.component.ts` (create/edit, reactive form)
- [ ] 5.4 Agregar rutas en `usuarios.routes.ts` (list, new, edit/:id)

## Fase 6: Productos

- [ ] 6.1 Crear `src/app/core/services/productos.service.ts` (CRUD + listar categorías)
- [ ] 6.2 Crear `src/app/features/productos/productos-list.component.ts` (filtros, MatTable)
- [ ] 6.3 Crear `src/app/features/productos/producto-form.component.ts` (create/edit)
- [ ] 6.4 Agregar rutas en `productos.routes.ts`

## Fase 7: Pedidos

- [ ] 7.1 Crear `src/app/core/services/pedidos.service.ts` (list, detail, update status)
- [ ] 7.2 Crear `src/app/features/pedidos/pedidos-list.component.ts` (filtros por estado)
- [ ] 7.3 Crear `src/app/features/pedidos/pedido-detail.component.ts` (items, timeline, cambios de estado)
- [ ] 7.4 Agregar rutas en `pedidos.routes.ts`

## Fase 8: Envíos

- [ ] 8.1 Crear `src/app/core/services/envios.service.ts` (CRUD)
- [ ] 8.2 Crear `src/app/features/envios/envios-list.component.ts` (tabla)
- [ ] 8.3 Crear `src/app/features/envios/envio-form.component.ts` (registrar guía)
- [ ] 8.4 Agregar rutas en `envios.routes.ts`

## Fase 9: Pagos

- [ ] 9.1 Crear `src/app/core/services/pagos.service.ts` (list, confirmar)
- [ ] 9.2 Crear `src/app/features/pagos/pagos-list.component.ts` (tabla)
- [ ] 9.3 Agregar botón confirmar en PagosListComponent
- [ ] 9.4 Agregar rutas en `pagos.routes.ts`

## Fase 10: Notificaciones

- [ ] 10.1 Crear `src/app/core/services/notificaciones.service.ts` (list, mark read)
- [ ] 10.2 Crear `src/app/features/notificaciones/notificaciones-panel.component.ts` (lista, unread first)
- [ ] 10.3 Agregar rutas en `notificaciones.routes.ts`

## Fase 11: Routing

- [ ] 11.1 Configurar `src/app/app.routes.ts` con lazy loading (loadComponent)
- [ ] 11.2 Agregar AuthGuard a todas las rutas protegidas (excepto /login)
- [ ] 11.3 Agregar redirect `/ → /dashboard`
- [ ] 11.4 Crear `app.config.ts` con provideHttpClient + interceptors

## Fase 12: Shared

- [ ] 12.1 Crear `src/app/shared/components/confirm-dialog.component.ts` (MatDialog)
- [ ] 12.2 Crear `src/app/shared/pipes/format-status.pipe.ts`
- [ ] 12.3 Agregar estilos globales en `styles.scss` (variables, reset)

## Testing (post-implementación)

- [ ] T1 Unit tests: AuthService, TokenInterceptor, AuthGuard
- [ ] T2 Unit tests: CRUD services (Usuarios, Productos, Pedidos)
- [ ] T3 Integration: Login flow con HttpClientTestingModule
- [ ] T4 E2E: Login, navegación por rol (Playwright)