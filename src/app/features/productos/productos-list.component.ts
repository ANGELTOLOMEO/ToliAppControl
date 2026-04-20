import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="page-container">
      <h1>Productos</h1>
      <p>Catálogo de productos</p>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 20px;
    }
  `]
})
export class ProductosListComponent {}