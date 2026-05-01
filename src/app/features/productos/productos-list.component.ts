import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-container">
      <h1>Productos</h1>
      <p>Catálogo de productos</p>

      <div class="actions">
        <button mat-raised-button color="primary" routerLink="/productos/nuevo">
          <mat-icon>add</mat-icon>
          Crear producto
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 20px;
    }

    .actions {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class ProductosListComponent {}
