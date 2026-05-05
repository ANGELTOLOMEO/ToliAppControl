import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-notificaciones-form',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div class="page-container">
      <h1>Notificaciones - Detalle</h1>
      <p>Coming soon - Ver y marcar como leída</p>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 0;
    }
  `]
})
export class NotificacionesFormComponent {}
