import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from './auth.service';

/**
 * LoginComponent - Componente de inicio de sesión
 * Standalone Component de Angular 17+
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="logo-container">
            <div class="logo">
              <span class="logo-icon">T</span>
            </div>
            <mat-card-title>TOLI</mat-card-title>
            <mat-card-subtitle>Web Admin</mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <!-- Campo Email -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="admin&#64;toli.com"
              />
              <mat-icon matPrefix>email</mat-icon>
              @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                <mat-error>El email es requerido</mat-error>
              }
              @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
                <mat-error>Ingrese un email válido</mat-error>
              }
            </mat-form-field>

            <!-- Campo Password -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                formControlName="password"
                placeholder="••••••••"
              />
              <mat-icon matPrefix>lock</mat-icon>
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword.set(!hidePassword())"
                [attr.aria-label]="'Ocultar contraseña'"
              >
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <mat-error>La contraseña es requerida</mat-error>
              }
            </mat-form-field>

            <!-- Recordar sesión -->
            <div class="remember-row">
              <mat-checkbox formControlName="rememberMe" color="primary">
                Recordar sesión
              </mat-checkbox>
            </div>

            <!-- Error message -->
            @if (errorMessage()) {
              <div class="error-alert">
                <mat-icon>error</mat-icon>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- Botón Login -->
            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="login-button"
              [disabled]="isLoading()"
            >
              @if (isLoading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <mat-icon>login</mat-icon>
                <span>Iniciar Sesión</span>
              }
            </button>
          </form>

          <!-- Footer -->
          <mat-divider class="divider"></mat-divider>
          <div class="footer-links">
            <a href="javascript:void(0)">¿Olvidaste tu contraseña?</a>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      padding: 20px;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 0;
    }

    mat-card-header {
      display: flex;
      justify-content: center;
      padding: 32px 24px 16px;
    }

    .logo-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .logo {
      width: 72px;
      height: 72px;
      border-radius: 16px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
    }

    .logo-icon {
      font-size: 36px;
      font-weight: 700;
      color: white;
    }

    mat-card-title {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }

    mat-card-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    mat-card-content {
      padding: 16px 24px 32px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }

    .remember-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #dc2626;
      margin-bottom: 16px;
      font-size: 14px;
    }

    .login-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
    }

    .login-button mat-icon,
    .login-button mat-spinner {
      margin-right: 8px;
    }

    .login-button mat-spinner {
      display: inline-block;
    }

    .divider {
      margin: 24px 0;
    }

    .footer-links {
      text-align: center;
    }

    .footer-links a {
      color: #6366f1;
      text-decoration: none;
      font-size: 14px;
    }

    .footer-links a:hover {
      text-decoration: underline;
    }

    ::ng-deep .mat-mdc-form-field-icon-prefix {
      padding-right: 8px;
    }

    ::ng-deep .mat-mdc-form-field-icon-suffix {
      padding-left: 8px;
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signals
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hidePassword = signal(true);

  // Form
  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err?.message || 'Credenciales inválidas';
        this.errorMessage.set(message);
      }
    });
  }
}