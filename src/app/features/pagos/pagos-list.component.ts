import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-pagos-list',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="page-container">
      <h1>Pagos</h1>
      <p>Gestión de pagos</p>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 20px;
    }
  `]
})
export class PagosListComponent {}