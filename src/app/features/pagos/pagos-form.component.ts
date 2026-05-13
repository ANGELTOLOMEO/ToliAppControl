import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pagos-form',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="page-container">
      <section class="feature-hero">
        <div class="feature-hero-copy">
          <div class="feature-badge">Validacion</div>
          <h1>
            <span class="hero-icon"><mat-icon>verified</mat-icon></span>
            Confirmar pago
          </h1>
          <p>
            La vista de detalle ahora tiene una estructura clara para mostrar comprobante,
            observaciones y resultado de la validacion.
          </p>
        </div>

        <div class="chip-row">
          <span class="soft-chip">Comprobante</span>
          <span class="soft-chip">Revision</span>
          <span class="soft-chip">Aprobacion</span>
        </div>
      </section>

      <div class="surface-grid">
        <article class="surface-card section-stack">
          <div>
            <div class="eyebrow">Detalle operativo</div>
            <h2>Espacio para validacion del pago</h2>
            <p class="app-note">
              Aqui quedara el detalle del metodo de pago, monto recibido, referencia y evidencia.
            </p>
          </div>

          <dl class="info-kv">
            <dt>Metodo</dt>
            <dd>Transferencia o pasarela</dd>
            <dt>Accion principal</dt>
            <dd>Confirmar o rechazar</dd>
            <dt>Soporte</dt>
            <dd>Adjunto y observaciones</dd>
            <dt>Trazabilidad</dt>
            <dd>Registro de quien valida</dd>
          </dl>
        </article>

        <article class="surface-card">
          <div class="eyebrow">Formulario</div>
          <h2>Distribucion visual preparada</h2>
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
export class PagosFormComponent {}
