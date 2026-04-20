# Web Admin TOLI - Specification

## Purpose

This specification defines the TOLI Web Admin application built with Angular 21 standalone components. It provides a comprehensive administrative interface for managing users, products, orders, shipments, payments, and notifications with role-based access control.

## Affected Areas

- **Auth**: JWT authentication with role-based guards
- **Layout**: Dynamic sidebar and header by user role
- **Dashboard**: KPIs and recent orders
- **Usuarios**: User management (ADMIN only)
- **Productos**: Product catalog management
- **Pedidos**: Order lifecycle management
- **Envíos**: Shipment tracking
- **Pagos**: Payment confirmation
- **Notificaciones**: Notification system

---

## Auth Specification

### Requirement: JWT Login

The system MUST authenticate users via email/password credentials and return a JWT token for subsequent requests.

#### Scenario: Successful Login

- GIVEN user enters valid email and password
- WHEN user submits login form
- THEN system returns JWT token and user role
- AND token is stored in localStorage

#### Scenario: Invalid Credentials

- GIVEN user enters invalid email or password
- WHEN user submits login form
- THEN system returns 401 error
- AND error message is displayed

### Requirement: Authenticated Requests

The system MUST include JWT token in all authenticated API requests via HTTP interceptor.

#### Scenario: Request with Token

- GIVEN user is authenticated with valid JWT
- WHEN user makes API request
- THEN interceptor adds `Authorization: Bearer {token}` header
- AND request succeeds

#### Scenario: Expired Token

- GIVEN JWT token has expired
- WHEN user makes API request
- THEN server returns 401
- AND user is redirected to login

### Requirement: Route Protection

The system MUST protect routes based on user roles using AuthGuard.

#### Scenario: Unauthorized Access

- GIVEN authenticated user lacks required role
- WHEN user navigates to protected route
- THEN guard redirects to unauthorized page
- AND access is denied

### Requirement: Logout

The system MUST clear JWT token and redirect to login on logout action.

#### Scenario: User Logout

- GIVEN authenticated user clicks logout
- WHEN logout action is triggered
- THEN localStorage token is cleared
- AND user is redirected to login

---

## Layout Specification

### Requirement: Dynamic Sidebar

The system MUST display navigation menu items based on user role.

#### Scenario: ADMIN Role Menu

- GIVEN logged-in user has ADMIN role
- WHEN sidebar renders
- THEN menu shows: Dashboard, Usuarios, Productos, Pedidos, Envíos, Pagos, Notificaciones
- AND all menu items are accessible

#### Scenario: VENTAS_VENDEDOR Role Menu

- GIVEN logged-in user has VENTAS_VENDEDOR role
- WHEN sidebar renders
- THEN menu shows: Dashboard, Pedidos
- AND restricted items are hidden

#### Scenario: OPERACIONES_INVENTARIO Role Menu

- GIVEN logged-in user has OPERACIONES_INVENTARIO role
- WHEN sidebar renders
- THEN menu shows: Dashboard, Productos
- AND restricted items are hidden

### Requirement: Header

The system MUST display user name and logout button in the header.

#### Scenario: Header Display

- GIVEN user is authenticated
- WHEN page renders
- THEN header shows user name and logout button
- AND clicking logout triggers logout action

---

## Dashboard Specification

### Requirement: KPI Cards

The system MUST display four metric cards with real-time data.

#### Scenario: Dashboard Load

- GIVEN user navigates to Dashboard
- WHEN page loads
- THEN cards display: usuarios activos, pedidos hoy, productos low stock, ingresos del mes
- AND values are fetched from API

### Requirement: Recent Orders List

The system MUST display a list of the 10 most recent orders.

#### Scenario: Recent Orders Display

- GIVEN user views Dashboard
- WHEN orders are fetched
- THEN table shows: ID, Cliente, Fecha, Estado, Total
- AND sortable by date

---

## Usuarios Specification (ADMIN Only)

### Requirement: List Users

The system MUST fetch and display all users from the API.

#### Scenario: Fetch User List

- GIVEN ADMIN navigates to Usuarios page
- WHEN GET /api/admin/usuarios is called
- THEN table displays: Nombre, Email, Rol, Estado, Fecha creación
- AND pagination is supported

### Requirement: Create User

The system MUST create a new user via form submission.

#### Scenario: Create New User

- GIVEN ADMIN fills user form with valid data
- WHEN POST /api/admin/usuarios is submitted
- THEN new user is created
- AND user appears in list

#### Scenario: Duplicate Email

- GIVEN ADMIN enters existing email
- WHEN form is submitted
- THEN validation error is displayed
- AND user is not created

### Requirement: Edit User

The system MUST update existing user information.

#### Scenario: Edit User

- GIVEN ADMIN modifies user data
- WHEN PUT /api/admin/usuarios/:id is submitted
- THEN user is updated
- AND changes reflect in list

### Requirement: Deactivate User

The system MUST deactivate (soft delete) a user.

#### Scenario: Deactivate User

- GIVEN ADMIN clicks deactivate button
- WHEN DELETE /api/admin/usuarios/:id is called
- THEN user status changes to inactivo
- AND user is hidden from active list

### Requirement: Role List

The system MUST fetch available roles for user assignment.

#### Scenario: Fetch Roles

- GIVEN ADMIN opens user form
- WHEN GET /api/admin/roles is called
- THEN dropdown shows: ADMIN, VENTAS_VENDEDOR, VENTAS_SUPERVISOR, OPERACIONES_INVENTARIO, OPERACIONES_LOGISTICA, FINANZAS_CONTABILIDAD, CLIENTE

---

## Productos Specification

### Requirement: Product List

The system MUST fetch products with optional filters.

#### Scenario: Filter Products

- GIVEN user enters search term or category filter
- WHEN GET /api/productos is called with params
- THEN filtered results are displayed
- AND pagination works

### Requirement: Create Product

The system MUST create a new product (requires permission).

#### Scenario: Create New Product

- GIVEN user fills product form with valid data
- WHEN POST /api/productos is submitted
- THEN new product is created
- AND appears in list

### Requirement: Edit Product

The system MUST update product information.

#### Scenario: Edit Product

- GIVEN user modifies product data
- WHEN PUT /api/productos/:id is submitted
- THEN product is updated
- AND changes reflect in list

### Requirement: Delete Product

The system MUST soft-delete a product.

#### Scenario: Delete Product

- GIVEN user clicks delete button
- WHEN DELETE /api/productos/:id is called
- THEN product is marked as deleted
- AND hidden from active list

### Requirement: Category List

The system MUST fetch categories for product categorization.

#### Scenario: Fetch Categories

- GIVEN user opens product form
- WHEN GET /api/categorias is called
- THEN category dropdown is populated

---

## Pedidos Specification

### Requirement: Order List

The system MUST fetch all orders with optional filters.

#### Scenario: Fetch Orders

- GIVEN user navigates to Pedidos page
- WHEN GET /api/pedidos is called
- THEN table displays: ID, Cliente, Fecha, Estado, Total
- AND filtering by status works

### Requirement: Order Detail

- GIVEN user clicks on order row
- WHEN GET /api/pedidos/:id is called
- THEN detail view shows: items, shipping address, payment info, timeline
- AND all order data is displayed

### Requirement: Update Order Status

The system MUST allow status changes with proper permissions.

#### Scenario: Status Transition

- GIVEN user selects new status
- WHEN PUT /api/pedidos/:id is submitted
- THEN status is updated
- AND timeline entry is added

#### Valid Status Flow
- pendiente → confirmado → preparando → enviado → entregado
- Any status → cancelado

---

## Envíos Specification

### Requirement: Shipment List

The system MUST fetch all shipments.

#### Scenario: Fetch Shipments

- GIVEN user navigates to Envíos page
- WHEN GET /api/envios is called
- THEN table displays: Pedido ID, Transportista, Tracking, Estado
- AND filtering works

### Requirement: Create Shipment

The system MUST create a shipment for an order.

#### Scenario: Create Shipment

- GIVEN order ID and carrier info provided
- WHEN POST /api/envios/:pedido_id is called
- THEN shipment is created
- AND order status updates to enviado

### Requirement: Update Shipment

The system MUST update shipment tracking information.

#### Scenario: Update Tracking

- GIVEN tracking number entered
- WHEN PUT /api/envios/:pedido_id is submitted
- THEN tracking is updated
- AND shipment status reflects change

---

## Pagos Specification

### Requirement: Payment List

The system MUST fetch all payment records.

#### Scenario: Fetch Payments

- GIVEN user navigates to Pagos page
- WHEN GET /api/pagos is called
- THEN table displays: Pedido ID, Método, Monto, Estado, Fecha
- AND filtering works

### Requirement: Confirm Payment

The system MUST confirm a payment for an order.

#### Scenario: Confirm Payment

- GIVEN payment verification complete
- WHEN PUT /api/pagos/:pedido_id/confirmar is called
- THEN payment status changes to confirmado
- AND order is notified

---

## Notificaciones Specification

### Requirement: Notification List

The system MUST fetch user notifications.

#### Scenario: Fetch Notifications

- GIVEN user views Notificaciones page
- WHEN GET /api/notificaciones is called
- THEN list shows: Mensaje, Fecha, Leída
- AND unread first sorting

### Requirement: Mark as Read

The system MUST mark a notification as read.

#### Scenario: Mark Read

- GIVEN user clicks notification
- WHEN PUT /api/notificaciones/:id/leer is called
- THEN notification is marked leída
- AND visual indicator updates

---

## Role Permissions Matrix

| Feature | ADMIN | VENTAS_VENDEDOR | VENTAS_SUPERVISOR | OPERACIONES_INVENTARIO | OPERACIONES_LOGISTICA | FINANZAS_CONTABILIDAD | CLIENTE |
|---------|------|----------------|------------------|------------------------|-----------------------|---------------------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Usuarios | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Productos Ver | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Productos Crear | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Productos Editar | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Pedidos Ver | ✅ | Propios | Todos | ✅ | ✅ | ✅ | Propios |
| Pedidos Editar | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Envíos | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Pagos | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Notificaciones | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## API Endpoints Summary

### Auth
- `POST /api/auth/login` - Authenticate user

### Admin (ADMIN only)
- `GET /api/admin/usuarios` - List users
- `POST /api/admin/usuarios` - Create user
- `PUT /api/admin/usuarios/:id` - Update user
- `DELETE /api/admin/usuarios/:id` - Deactivate user
- `GET /api/admin/roles` - List roles

### Productos
- `GET /api/productos` - List products
- `POST /api/productos` - Create product
- `PUT /api/productos/:id` - Update product
- `DELETE /api/productos/:id` - Delete product
- `GET /api/categorias` - List categories

### Pedidos
- `GET /api/pedidos` - List orders
- `GET /api/pedidos/:id` - Order detail
- `PUT /api/pedidos/:id` - Update status

### Envíos
- `GET /api/envios` - List shipments
- `POST /api/envios/:pedido_id` - Create shipment
- `PUT /api/envios/:pedido_id` - Update shipment

### Pagos
- `GET /api/pagos` - List payments
- `PUT /api/pagos/:pedido_id/confirmar` - Confirm payment

### Notificaciones
- `GET /api/notificaciones` - List notifications
- `PUT /api/notificaciones/:id/leer` - Mark read