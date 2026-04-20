# Design: Web Admin TOLI

## Technical Approach

Admin panel SPA con Angular 21 standalone components + Angular Material (dark theme).Gestión de estado local via BehaviorSubject en servicios. Routing con lazy loading para optimizar bundle (~150KB inicial vs ~800KB eager).

## Architecture Decisions

### Decision: Standalone Components

| Choice | Alternatives | Rationale |
|--------|-------------|----------|
| Angular 21 standalone | NgModules | Menos boilerplate, mejor tree-shaking, dirección oficial Angular |

### Decision: Estado Local

| Choice | Alternatives | Rationale |
|--------|-------------|----------|
| BehaviorSubject | NgRx, Signals | Overhead bajo, reactive updates, suficiente para escala |

| Criteria | BehaviorSubject | NgRx | Component |
|----------|----------------|------|-----------|
| Boilerplate | Bajo | Alto | Mínimo |
| Bundle | Pequeño | Grande | Mínimo |
| **Decisión** | **✅** | Overkill | Incompleto |

### Decision: JWT Storage

**Choice**: localStorage  
**Alternatives**: httpOnly cookies, sessionStorage  
**Rationale**: Persiste entre sesiones. httpOnly requiere backend. sessionStorage se pierde al cerrar.

### Decision: Lazy Loading

**Choice**: Route-level `loadComponent`  
**Rationale**: 7 features. Optimiza initial load ~2s vs ~5s.

```
/login → eager
/ → lazy (layout)
/dashboard → lazy
/usuarios → lazy
/productos → lazy
/pedidos → lazy
/envios → lazy
/pagos → lazy
/notificaciones → lazy
```

### Decision: HTTP Interceptor

**Choice**: HttpInterceptor  
**Alternatives**: Manual headers, HttpBackend  
**Rationale**: DRY principle. Un punto para JWT injection + 401 handling.

## Data Flow

### Login → Dashboard

```
Login → AuthService.login() → API → JWT
                                            ↓
                                     localStorage
                                            ↓
AuthGuard.canActivate() ──OK──▶ Dashboard
```

### Protected Route

```
Route.canActivate()
       │
  token? ──No──▶ /login
       │
  valid? ──No──▶ 401 → /login
       │
       └──Yes──▶ Component
```

## File Changes

### Nuevos archivos

| File | Descripción |
|------|-------------|
| `src/app/core/auth/{login,auth,guard,interceptor}.ts` | Auth layer completo |
| `src/app/core/services/{api,usuarios,productos,pedidos,envios,pagos,notificaciones,dashboard}.service.ts` | 8 servicios |
| `src/app/core/models/index.ts` | TypeScript interfaces (Usuario, Producto, Pedido, Envio, Pago, Notificacion) |
| `src/app/layout/{layout,sidebar,header}.component.ts` | Layout structure |
| `src/app/features/{dashboard,usuarios,productos,pedidos,envios,pagos,notificaciones}/**` | 7 feature modules |
| `src/app/shared/components/confirm-dialog.component.ts` | Reusable modal |
| `src/app/app.routes.ts` | Lazy routes con guards |
| `src/app/app.config.ts` | Providers (HttpClient, interceptors, animations) |

### Modifications

| File | Change |
|------|--------|
| `app.routes.ts` | Agregar todas las rutas + guards |
| `app.config.ts` | Agregar provideHttpClient + interceptors |

## Interfaces

### Modelos Core (src/app/core/models/index.ts)

```typescript
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  dni?: string;
  ruc?: string;
  rol: 'ADMIN' | 'VENTAS_VENDEDOR' | 'VENTAS_SUPERVISOR' | 'OPERACIONES_INVENTARIO' | 'OPERACIONES_LOGISTICA' | 'FINANZAS_CONTABILIDAD' | 'CLIENTE';
  activo: boolean;
  created_at?: string;
}

export interface Producto { id: number; nombre: string; descripcion?: string; precio: number; categoria_id: number; stock: number; activo?: boolean; }
export interface Pedido { id: number; numero_pedido: string; usuario_id: number; usuario?: Usuario; direccion_envio: string; subtotal: number; total: number; estado_pedido: string; items?: any[]; created_at?: string; }
export interface Envio { id: number; pedido_id: number; estado: string; numero_guia?: string; courier?: string; }
export interface Pago { id: number; pedido_id: number; estado: string; monto: number; metodo: string; created_at?: string; }
export interface Notificacion { id: number; mensaje: string; leida: boolean; created_at: string; }
export interface AuthResponse { token: string; user: Usuario; }
```

## Testing Strategy

| Layer | Approach |
|-------|----------|
| Unit | Jasmine + Karma (services, guards, pipes) |
| Integration | HttpClientTestingModule (interceptors) |
| E2E | Playwright (login, routes, RBAC) |

**Priority**: AuthService → TokenInterceptor → AuthGuard → CRUD Services

## Migration / Rollout

No migration. Frontend nuevo consume API existente.

**Fases**:
1. Login + Dashboard (MVP)
2. Usuarios (ADMIN)
3. Productos + Pedidos
4. Envíos + Pagos
5. Notificaciones

## Open Questions

- [ ] ¿Backend implementa todos los endpoints de spec.md?
- [ ] ¿Token refresh o solo JWT corto?
- [ ] ¿API base URL configurable por entorno?
- [ ] ¿Global error handler necesario?
- [ ] ¿PWA offline support?