import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-productos-form',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div class="page-container">
      <h1>Productos - Crear / Editar</h1>
      <p>Coming soon - CRUD de productos</p>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 0;
    }
  `]
})
export class ProductosFormComponent {}
