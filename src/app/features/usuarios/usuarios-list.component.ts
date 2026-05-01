import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-container">
      <h1>Usuarios</h1>
      <p>Gestión de usuarios (ADMIN only)</p>

      <div class="actions">
        <button mat-raised-button color="primary" routerLink="/usuarios/nuevo">
          <mat-icon>person_add</mat-icon>
          Crear usuario
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
export class UsuariosListComponent {}
