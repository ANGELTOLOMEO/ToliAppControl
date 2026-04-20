import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="page-container">
      <h1>Pedidos</h1>
      <p>Gestión de pedidos</p>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 20px;
    }
  `]
})
export class PedidosListComponent {}