import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { UsuariosService } from '../../core/services/usuarios.service';
import { Usuario } from '../../core/models';

@Component({
  selector: 'app-usuarios-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, ToastModule],
  template: `
    <div class="page-container">
      <p-toast />

      <div class="card-container form-wrap">
        <h1>{{ isEditMode() ? 'Editar usuario' : 'Nuevo usuario' }}</h1>

        <form [formGroup]="form" (ngSubmit)="save()" class="form-grid">
          <div class="field">
            <label for="nombre">Nombre</label>
            <input id="nombre" pInputText formControlName="nombre" />
          </div>

          <div class="field">
            <label for="email">Email</label>
            <input id="email" pInputText formControlName="email" type="email" />
          </div>

          <div class="field">
            <label for="rol">Rol</label>
            <input id="rol" pInputText formControlName="rol" list="roles" />
            <datalist id="roles">
              @for (rol of roles; track rol) {
                <option [value]="rol"></option>
              }
            </datalist>
          </div>

          <div class="field">
            <label for="telefono">Telefono</label>
            <input id="telefono" pInputText formControlName="telefono" />
          </div>

          <div class="field">
            <label for="dni">DNI</label>
            <input id="dni" pInputText formControlName="dni" />
          </div>

          <div class="field">
            <label for="ruc">RUC</label>
            <input id="ruc" pInputText formControlName="ruc" />
          </div>

          <div class="field field-full">
            <label for="password">Password {{ isEditMode() ? '(opcional)' : '' }}</label>
            <input id="password" pInputText formControlName="password" type="password" />
          </div>

          <div class="actions">
            <p-button label="Cancelar" severity="secondary" (onClick)="backToList()" />
            @if (isEditMode()) {
              <p-button label="Eliminar" severity="danger" (onClick)="remove()" />
            }
            <p-button type="submit" [label]="isEditMode() ? 'Guardar cambios' : 'Crear usuario'" [loading]="saving()" />
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 0;
    }

    .form-wrap h1 {
      margin: 0 0 16px;
      font-size: 1.2rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-full {
      grid-column: 1 / -1;
    }

    .field label {
      font-weight: 700;
      font-size: 0.9rem;
    }

    .actions {
      grid-column: 1 / -1;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
  ,
  providers: [MessageService]
})
export class UsuariosFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usuariosService = inject(UsuariosService);
  private readonly messageService = inject(MessageService);

  protected readonly roles = [
    'ADMIN',
    'VENTAS_VENDEDOR',
    'VENTAS_SUPERVISOR',
    'OPERACIONES_INVENTARIO',
    'OPERACIONES_LOGISTICA',
    'FINANZAS_CONTABILIDAD',
    'FINANZAS_COBRANZAS',
    'CLIENTE'
  ];

  protected readonly isEditMode = signal(false);
  protected readonly saving = signal(false);
  private userId: string | null = null;

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    rol: ['', [Validators.required]],
    telefono: [''],
    dni: [''],
    ruc: [''],
    password: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.userId = id;
    this.isEditMode.set(true);
    this.usuariosService.getById(id).subscribe({
      next: (user) => {
        if (!user) return;
        this.patchUser(user);
      },
      error: (e: unknown) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: e instanceof Error ? e.message : 'No se pudo cargar el usuario',
          life: 3500
        });
      }
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Validacion', detail: 'Completa los campos requeridos', life: 3000 });
      return;
    }

    const value = this.form.getRawValue();
    if (!this.isEditMode() && !value.password?.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validacion', detail: 'Password es requerido para crear usuario', life: 3000 });
      return;
    }

    this.saving.set(true);
    const payload = {
      nombre: value.nombre ?? '',
      email: value.email ?? '',
      rol: value.rol ?? '',
      telefono: value.telefono || null,
      dni: value.dni || null,
      ruc: value.ruc || null,
      password: value.password || undefined
    };

    const request$ = this.isEditMode() && this.userId
      ? this.usuariosService.update(this.userId, payload)
      : this.usuariosService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'OK',
          detail: this.isEditMode() ? 'Usuario actualizado' : 'Usuario creado',
          life: 2500
        });
        this.backToList();
      },
      error: (e: unknown) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: e instanceof Error ? e.message : 'No se pudo guardar usuario',
          life: 3500
        });
      }
    });
  }

  protected remove(): void {
    if (!this.userId) return;
    const ok = window.confirm('¿Seguro que deseas eliminar este usuario?');
    if (!ok) return;

    this.usuariosService.delete(this.userId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'OK', detail: 'Usuario eliminado', life: 2500 });
        this.backToList();
      },
      error: (e: unknown) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: e instanceof Error ? e.message : 'No se pudo eliminar usuario',
          life: 3500
        });
      }
    });
  }

  protected backToList(): void {
    this.router.navigate(['/usuarios']);
  }

  private patchUser(user: Usuario): void {
    this.form.patchValue({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      telefono: user.telefono ?? '',
      dni: user.dni ?? '',
      ruc: user.ruc ?? '',
      password: ''
    });
  }
}
