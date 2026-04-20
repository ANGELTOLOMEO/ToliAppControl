/**
 * Modelos TypeScript para el Web Admin TOLI
 */

// ============================================
// MODELO: USUARIO
// ============================================
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  dni?: string;
  ruc?: string;
  rol: string;
  activo: boolean;
  creado_en: string;
}

// ============================================
// MODELO: PRODUCTO
// ============================================
export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precio_mayor?: number;
  cantidad_minimaMayor?: number;
  categoria_id: string;
  categoria_nombre?: string;
  stock?: number;
  sku?: string;
  activo: boolean;
}

// ============================================
// MODELO: CATEGORIA
// ============================================
export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
}

// ============================================
// MODELO: PEDIDO
// ============================================
export interface Pedido {
  id: string;
  numero_pedido: string;
  usuario_id: string;
  direccion_envio: any;
  subtotal: number;
  descuento: number;
  total: number;
  estado_pedido: string;
  creado_en: string;
  estado_pago?: string;
  estado_envio?: string;
}

// ============================================
// MODELO: ITEM PEDIDO
// ============================================
export interface ItemPedido {
  cantidad: number;
  precio_unitario: number;
  producto_nombre: string;
  producto_imagen?: string;
}

// ============================================
// MODELO: ENVIO
// ============================================
export interface Envio {
  id: string;
  pedido_id: string;
  estado: string;
  numero_guia?: string;
  courier?: string;
  entregado_en?: string;
}

// ============================================
// MODELO: PAGO
// ============================================
export interface Pago {
  id: string;
  pedido_id: string;
  estado: string;
  monto: number;
  metodo?: string;
  pagado_en?: string;
}

// ============================================
// MODELO: NOTIFICACION
// ============================================
export interface Notificacion {
  id: string;
  titulo?: string;
  contenido: string;
  tipo: string;
  leida: boolean;
  link?: string;
  creado_en: string;
}

// ============================================
// MODELO: ROL
// ============================================
export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
}

// ============================================
// TIPO: DATA DE LOGIN (respuesta del endpoint auth)
// ============================================
export interface LoginResponse {
  usuario: Usuario;
  token: string;
}

// ============================================
// TIPO: RESPUESTA DE AUTENTICACION (wrapper)
// ============================================
export interface AuthResponse {
  data: LoginResponse;
}

// ============================================
// TIPO: RESPUESTA GENERICA DE API
// ============================================
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// ============================================
// TIPO: DIRECCION DE ENVIO
// ============================================
export interface DireccionEnvio {
  direccion: string;
  referencia?: string;
  distrito: string;
  provincia: string;
  departamento: string;
  codigo_postal?: string;
}
