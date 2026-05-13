import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-productos-form',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="page-container">
      <section class="feature-hero">
        <div class="feature-hero-copy">
          <div class="feature-badge">Catalogo</div>
          <h1>
            <span class="hero-icon"><mat-icon>inventory_2</mat-icon></span>
            Crear o editar producto
          </h1>
          <p>
            La vista ya no queda como placeholder simple. Ahora tiene estructura visual para imagen,
            datos comerciales y organizacion del formulario.
          </p>
        </div>

        <div class="chip-row">
          <span class="soft-chip">Imagen</span>
          <span class="soft-chip">Precio</span>
          <span class="soft-chip">Stock</span>
        </div>
      </section>

      <div class="surface-grid">
        <article class="surface-card">
          <div class="eyebrow">Preview</div>
          <h2>Bloque visual del producto</h2>
          <div class="preview-panel">
            <div>
              <mat-icon>image</mat-icon>
              <strong>Imagen principal y resumen</strong>
              <span>Ideal para revisar nombre, categoria y estado antes de guardar.</span>
            </div>
          </div>
        </article>

        <article class="surface-card">
          <div class="eyebrow">Formulario</div>
          <h2>Campos distribuidos con mejor jerarquia</h2>
          <div class="placeholder-stack">
            <div class="placeholder-line short"></div>
            <div class="placeholder-line"></div>
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
export class ProductosFormComponent {}
