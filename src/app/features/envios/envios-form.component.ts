import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-envios-form',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div class="page-container">
      <h1>Envíos - Actualizar</h1>
      <p>Coming soon - Registrar guía y actualizar estado</p>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 0;
    }
  `]
})
export class EnviosFormComponent {}
