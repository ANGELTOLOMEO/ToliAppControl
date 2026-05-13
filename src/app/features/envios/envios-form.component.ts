import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-envios-form',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="page-container">
      <section class="feature-hero">
        <div class="feature-hero-copy">
          <div class="feature-badge">Logistica</div>
          <h1>
            <span class="hero-icon"><mat-icon>local_shipping</mat-icon></span>
            Actualizar envio
          </h1>
          <p>
            Reordenamos la pantalla para que el detalle del envio tenga mejor lectura visual y espacio
            para guia, courier, estado e incidencias.
          </p>
        </div>

        <div class="chip-row">
          <span class="soft-chip">Guia</span>
          <span class="soft-chip">Courier</span>
          <span class="soft-chip">Seguimiento</span>
        </div>
      </section>

      <div class="surface-grid">
        <article class="surface-card section-stack">
          <div>
            <div class="eyebrow">Operacion</div>
            <h2>Control visual del despacho</h2>
            <p class="app-note">
              La estructura queda lista para editar estado, registrar observaciones y actualizar fechas.
            </p>
          </div>

          <dl class="info-kv">
            <dt>Referencia</dt>
            <dd>Pedido y numero de guia</dd>
            <dt>Estado</dt>
            <dd>Preparado, en ruta, entregado o incidencia</dd>
            <dt>Accion</dt>
            <dd>Actualizar trazabilidad</dd>
            <dt>Apoyo visual</dt>
            <dd>Layout mas limpio y consistente</dd>
          </dl>
        </article>

        <article class="surface-card">
          <div class="eyebrow">Formulario</div>
          <h2>Campos y timeline preparados</h2>
          <div class="placeholder-stack">
            <div class="placeholder-line short"></div>
            <div class="placeholder-line"></div>
            <div class="placeholder-line"></div>
            <div class="placeholder-line tall"></div>
          </div>
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
export class EnviosFormComponent {}
