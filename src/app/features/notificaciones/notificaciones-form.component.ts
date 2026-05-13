import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-notificaciones-form',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="page-container">
      <section class="feature-hero">
        <div class="feature-hero-copy">
          <div class="feature-badge">Seguimiento</div>
          <h1>
            <span class="hero-icon"><mat-icon>notifications_active</mat-icon></span>
            Detalle de notificacion
          </h1>
          <p>
            Esta pantalla ya tiene una base visual mas clara para mostrar contexto, acciones y la
            entidad relacionada sin sentirse vacia.
          </p>
        </div>

        <div class="chip-row">
          <span class="soft-chip">Leida</span>
          <span class="soft-chip">Prioridad</span>
          <span class="soft-chip">Origen</span>
        </div>
      </section>

      <div class="surface-grid">
        <article class="surface-card">
          <div class="eyebrow">Vista previa</div>
          <h2>Mensaje y accion relacionada</h2>
          <div class="preview-panel">
            <div>
              <mat-icon>campaign</mat-icon>
              <strong>Notificacion lista para detalle</strong>
              <span>Contenido, fecha, tipo y accion rapida en una sola vista.</span>
            </div>
          </div>
        </article>

        <article class="surface-card">
          <div class="eyebrow">Metadatos</div>
          <h2>Jerarquia visual preparada</h2>
          <dl class="info-kv">
            <dt>Tipo</dt>
            <dd>Sistema, venta, pago o soporte</dd>
            <dt>Accion</dt>
            <dd>Marcar como leida o navegar</dd>
            <dt>Referencia</dt>
            <dd>Pedido, pago o incidencia</dd>
            <dt>Lectura</dt>
            <dd>Estado visible y consistente</dd>
          </dl>
        </article>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      animation: pageFadeIn 240ms ease-out;
    }

    .page-container {
      padding: 0;
    }

    .preview-panel span {
      display: block;
      margin-top: 4px;
    }

    @keyframes pageFadeIn {
      from {
        opacity: 0;
        transform: translateY(6px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class NotificacionesFormComponent {}
