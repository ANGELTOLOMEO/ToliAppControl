import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from './auth.service';

/**
 * LoginComponent - Componente de inicio de sesión
 * Standalone Component de Angular 17+
 */
@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page" [class.dark]="isDark()" [style.--login-primary]="primaryColor()" [style.--login-surface]="surfaceColor()">
      <div class="sakai-tools">
        <button class="sakai-btn" type="button" (click)="setTheme(!isDark())" aria-label="Cambiar tema">
          @if (isDark()) {
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M12 18.5A6.5 6.5 0 0 1 12 5.5a7.1 7.1 0 0 0 0 13Z" />
            </svg>
          }
          @if (!isDark()) {
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          }
        </button>

        <button class="sakai-btn sakai-btn-accent" type="button" (click)="showConfigurator.set(!showConfigurator())" aria-label="Configuración">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M12 3a9 9 0 1 0 9 9c0-2.2-.8-4.2-2.1-5.7A6.5 6.5 0 0 1 12 3Z" />
            <path d="M6.5 12a1.5 1.5 0 1 0 0 .01Z" />
            <path d="M12 7.5a1.5 1.5 0 1 0 0 .01Z" />
            <path d="M16.5 12.5a1.5 1.5 0 1 0 0 .01Z" />
            <path d="M12.5 16.5a1.5 1.5 0 1 0 0 .01Z" />
          </svg>
        </button>

        @if (showConfigurator()) {
          <div class="sakai-panel" role="dialog" aria-label="Configuración">
            <div class="panel-section">
              <div class="panel-label">Primario</div>
              <div class="swatches swatches-primary">
                @for (c of primaryColors; track c) {
                  <button class="swatch" type="button" [class.active]="primaryColor() === c" [style.background]="c" (click)="setPrimaryColor(c)" aria-label="Cambiar primario"></button>
                }
              </div>
            </div>

            <div class="panel-section">
              <div class="panel-label">Superficie</div>
              <div class="swatches swatches-surface">
                @for (s of surfaceColors; track s) {
                  <button class="swatch" type="button" [class.active]="surfaceColor() === s" [style.background]="s" (click)="setSurfaceColor(s)" aria-label="Cambiar superficie"></button>
                }
              </div>
            </div>

            <div class="panel-section">
              <div class="panel-label">Ajustes predefinidos</div>
              <div class="preset-tabs">
                @for (p of presets; track p) {
                  <button class="preset-tab" type="button" [class.active]="preset() === p" (click)="setPreset(p)">{{ p }}</button>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <div class="card-shell">
        <div class="card">
          <div class="header">
            @if (!useFallbackLogo()) {
              <img class="logo" [src]="logoSrc()" alt="Toli" (error)="onLogoError()" />
            }
            @if (useFallbackLogo()) {
              <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M17.1637 19.2467C17.1566 19.4033 17.1529 19.561 17.1529 19.7194C17.1529 25.3503 21.7203 29.915 27.3546 29.915C32.9887 29.915 37.5561 25.3503 37.5561 19.7194C37.5561 19.5572 37.5524 19.3959 37.5449 19.2355C38.5617 19.0801 39.5759 18.9013 40.5867 18.6994L40.6926 18.6782C40.7191 19.0218 40.7326 19.369 40.7326 19.7194C40.7326 27.1036 34.743 33.0896 27.3546 33.0896C19.966 33.0896 13.9765 27.1036 13.9765 19.7194C13.9765 19.374 13.9896 19.0316 14.0154 18.6927L14.0486 18.6994C15.0837 18.9062 16.1223 19.0886 17.1637 19.2467ZM33.3284 11.4538C31.6493 10.2396 29.5855 9.52381 27.3546 9.52381C25.1195 9.52381 23.0524 10.2421 21.3717 11.4603C20.0078 11.3232 18.6475 11.1387 17.2933 10.907C19.7453 8.11308 23.3438 6.34921 27.3546 6.34921C31.36 6.34921 34.9543 8.10844 37.4061 10.896C36.0521 11.1292 34.692 11.3152 33.3284 11.4538ZM43.826 18.0518C43.881 18.6003 43.9091 19.1566 43.9091 19.7194C43.9091 28.8568 36.4973 36.2642 27.3546 36.2642C18.2117 36.2642 10.8 28.8568 10.8 19.7194C10.8 19.1615 10.8276 18.61 10.8816 18.0663L7.75383 17.4411C7.66775 18.1886 7.62354 18.9488 7.62354 19.7194C7.62354 30.6102 16.4574 39.4388 27.3546 39.4388C38.2517 39.4388 47.0855 30.6102 47.0855 19.7194C47.0855 18.9439 47.0407 18.1789 46.9536 17.4267L43.826 18.0518ZM44.2613 9.54743L40.9084 10.2176C37.9134 5.95821 32.9593 3.1746 27.3546 3.1746C21.7442 3.1746 16.7856 5.96385 13.7915 10.2305L10.4399 9.56057C13.892 3.83178 20.1756 0 27.3546 0C34.5281 0 40.8075 3.82591 44.2613 9.54743Z"
                  fill="var(--login-primary)"
                />
                <mask id="mask0_1413_1551" style="mask-type: alpha" maskUnits="userSpaceOnUse" x="0" y="8" width="54" height="11">
                  <path d="M27 18.3652C10.5114 19.1944 0 8.88892 0 8.88892C0 8.88892 16.5176 14.5866 27 14.5866C37.4824 14.5866 54 8.88892 54 8.88892C54 8.88892 43.4886 17.5361 27 18.3652Z" fill="var(--login-primary)" />
                </mask>
                <g mask="url(#mask0_1413_1551)">
                  <path
                    d="M-4.673e-05 8.88887L3.73084 -1.91434L-8.00806 17.0473L-4.673e-05 8.88887ZM27 18.3652L26.4253 6.95109L27 18.3652ZM54 8.88887L61.2673 17.7127L50.2691 -1.91434L54 8.88887ZM-4.673e-05 8.88887C-8.00806 17.0473 -8.00469 17.0505 -8.00132 17.0538C-8.00018 17.055 -7.99675 17.0583 -7.9944 17.0607C-7.98963 17.0653 -7.98474 17.0701 -7.97966 17.075C-7.96949 17.0849 -7.95863 17.0955 -7.94707 17.1066C-7.92401 17.129 -7.89809 17.1539 -7.86944 17.1812C-7.8122 17.236 -7.74377 17.3005 -7.66436 17.3743C-7.50567 17.5218 -7.30269 17.7063 -7.05645 17.9221C-6.56467 18.3532 -5.89662 18.9125 -5.06089 19.5534C-3.39603 20.83 -1.02575 22.4605 1.98012 24.0457C7.97874 27.2091 16.7723 30.3226 27.5746 29.7793L26.4253 6.95109C20.7391 7.23699 16.0326 5.61231 12.6534 3.83024C10.9703 2.94267 9.68222 2.04866 8.86091 1.41888C8.45356 1.10653 8.17155 0.867278 8.0241 0.738027C7.95072 0.673671 7.91178 0.637576 7.90841 0.634492C7.90682 0.63298 7.91419 0.639805 7.93071 0.65557C7.93897 0.663455 7.94952 0.673589 7.96235 0.686039C7.96883 0.692262 7.97582 0.699075 7.98338 0.706471C7.98719 0.710167 7.99113 0.714014 7.99526 0.718014C7.99729 0.720008 8.00047 0.723119 8.00148 0.724116C8.00466 0.727265 8.00796 0.730446 -4.673e-05 8.88887ZM27.5746 29.7793C37.6904 29.2706 45.9416 26.3684 51.6602 23.6054C54.5296 22.2191 56.8064 20.8465 58.4186 19.7784C59.2265 19.2431 59.873 18.7805 60.3494 18.4257C60.5878 18.2482 60.7841 18.0971 60.9374 17.977C61.014 17.9169 61.0799 17.8645 61.1349 17.8203C61.1624 17.7981 61.1872 17.7781 61.2093 17.7602C61.2203 17.7512 61.2307 17.7427 61.2403 17.7348C61.2452 17.7308 61.2499 17.727 61.2544 17.7233C61.2566 17.7215 61.2598 17.7188 61.261 17.7179C61.2642 17.7153 61.2673 17.7127 54 8.88887C46.7326 0.0650536 46.7357 0.0625219 46.7387 0.0600241C46.7397 0.0592345 46.7427 0.0567658 46.7446 0.0551857C46.7485 0.0520238 46.7521 0.0489887 46.7557 0.0460799C46.7628 0.0402623 46.7694 0.0349487 46.7753 0.0301318C46.7871 0.0204986 46.7966 0.0128495 46.8037 0.00712562C46.818 -0.00431848 46.8228 -0.00808311 46.8184 -0.00463784C46.8096 0.00228345 46.764 0.0378652 46.6828 0.0983779C46.5199 0.219675 46.2165 0.439161 45.7812 0.727519C44.9072 1.30663 43.5257 2.14765 41.7061 3.02677C38.0469 4.79468 32.7981 6.63058 26.4253 6.95109L27.5746 29.7793ZM54 8.88887C50.2691 -1.91433 50.27 -1.91467 50.271 -1.91498C50.2712 -1.91506 50.272 -1.91535 50.2724 -1.9155C50.2733 -1.91581 50.274 -1.91602 50.2743 -1.91616C50.2752 -1.91643 50.275 -1.91636 50.2738 -1.91595C50.2714 -1.91515 50.2652 -1.91302 50.2552 -1.9096C50.2351 -1.90276 50.1999 -1.89078 50.1503 -1.874C50.0509 -1.84043 49.8938 -1.78773 49.6844 -1.71863C49.2652 -1.58031 48.6387 -1.377 47.8481 -1.13035C46.2609 -0.635237 44.0427 0.0249875 41.5325 0.6823C36.215 2.07471 30.6736 3.15796 27 3.15796V26.0151C33.8087 26.0151 41.7672 24.2495 47.3292 22.7931C50.2586 22.026 52.825 21.2618 54.6625 20.6886C55.5842 20.4011 56.33 20.1593 56.8551 19.986C57.1178 19.8993 57.3258 19.8296 57.4735 19.7797C57.5474 19.7548 57.6062 19.7348 57.6493 19.72C57.6709 19.7127 57.6885 19.7066 57.7021 19.7019C57.7089 19.6996 57.7147 19.6976 57.7195 19.696C57.7219 19.6952 57.7241 19.6944 57.726 19.6938C57.7269 19.6934 57.7281 19.693 57.7286 19.6929C57.7298 19.6924 57.7309 19.692 54 8.88887ZM27 3.15796C23.3263 3.15796 17.7849 2.07471 12.4674 0.6823C9.95717 0.0249875 7.73904 -0.635237 6.15184 -1.13035C5.36118 -1.377 4.73467 -1.58031 4.3155 -1.71863C4.10609 -1.78773 3.94899 -1.84043 3.84961 -1.874C3.79994 -1.89078 3.76474 -1.90276 3.74471 -1.9096C3.73469 -1.91302 3.72848 -1.91515 3.72613 -1.91595C3.72496 -1.91636 3.72476 -1.91643 3.72554 -1.91616C3.72593 -1.91602 3.72657 -1.91581 3.72745 -1.9155C3.72789 -1.91535 3.72874 -1.91506 3.72896 -1.91498C3.72987 -1.91467 3.73084 -1.91433 -4.673e-05 8.88887C-3.73093 19.692 -3.72983 19.6924 -3.72868 19.6929C-3.72821 19.693 -3.72698 19.6934 -3.72603 19.6938C-3.72415 19.6944 -3.72201 19.6952 -3.71961 19.696C-3.71482 19.6976 -3.70901 19.6996 -3.7022 19.7019C-3.68858 19.7066 -3.67095 19.7127 -3.6494 19.72C-3.60629 19.7348 -3.54745 19.7548 -3.47359 19.7797C-3.32589 19.8296 -3.11788 19.8993 -2.85516 19.986C-2.33008 20.1593 -1.58425 20.4011 -0.662589 20.6886C1.17485 21.2618 3.74125 22.026 6.67073 22.7931C12.2327 24.2495 20.1913 26.0151 27 26.0151V3.15796Z"
                    fill="var(--login-primary)"
                  />
                </g>
              </svg>
            }

            <div class="title">Welcome to Toli!</div>
            <div class="subtitle">Sign in to continue</div>
          </div>

          <form class="form" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="field">
              <label for="email1" class="label">Email</label>
              <input id="email1" type="email" class="input" placeholder="Email address" formControlName="email" autocomplete="email" />
              @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                <div class="field-error">El email es requerido</div>
              }
              @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
                <div class="field-error">Ingrese un email válido</div>
              }
            </div>

            <div class="field">
              <label for="password1" class="label">Password</label>
              <div class="password-row">
                <input
                  id="password1"
                  [type]="hidePassword() ? 'password' : 'text'"
                  class="input"
                  placeholder="Password"
                  formControlName="password"
                  autocomplete="current-password"
                />
                <button class="toggle" type="button" (click)="hidePassword.set(!hidePassword())">
                  {{ hidePassword() ? 'Vista' : 'Ocultar' }}
                </button>
              </div>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <div class="field-error">La contraseña es requerida</div>
              }
            </div>

            <div class="row">
              <label class="checkbox">
                <input type="checkbox" formControlName="rememberMe" />
                <span>Remember me</span>
              </label>
              <a class="link" href="javascript:void(0)">Forgot password?</a>
            </div>

            @if (errorMessage()) {
              <div class="error-alert">
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <button class="btn" type="submit" [disabled]="isLoading()">
              @if (isLoading()) {
                <mat-spinner diameter="18"></mat-spinner>
              }
              @if (!isLoading()) {
                <span>Sign In</span>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --login-primary: #10b981;
      --login-surface: #ffffff;
      display: block;
    }

    .page {
      min-height: 100vh;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: #f8fafc;
      overflow: hidden;
    }

    .card-shell {
      border-radius: 56px;
      padding: 0.3rem;
      background: linear-gradient(180deg, var(--login-primary) 10%, rgba(33, 150, 243, 0) 30%);
    }

    .card {
      width: min(520px, calc(100vw - 48px));
      background: var(--login-surface);
      border-radius: 53px;
      padding: 80px 64px;
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
    }

    .sakai-tools {
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 10000;
    }

    .sakai-btn {
      height: 40px;
      width: 40px;
      border-radius: 999px;
      border: 2px solid rgba(15, 23, 42, 0.22);
      background: rgba(255, 255, 255, 0.95);
      color: #0f172a;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
      transition: transform 0.12s ease;
    }

    .sakai-btn:hover {
      transform: translateY(-1px);
    }

    .sakai-btn:focus {
      outline: none;
      border-color: var(--login-primary);
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
    }

    .sakai-btn-accent {
      background: var(--login-primary);
      border-color: rgba(0, 0, 0, 0);
      color: #ffffff;
    }

    .sakai-panel {
      position: absolute;
      top: 52px;
      right: 0;
      width: 260px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px;
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18);
    }

    .panel-section {
      display: grid;
      gap: 10px;
      padding: 10px 0;
      border-top: 1px solid #eef2f7;
    }

    .panel-section:first-of-type {
      border-top: none;
      padding-top: 0;
    }

    .panel-label {
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
    }

    .swatches {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .swatch {
      height: 26px;
      width: 26px;
      border-radius: 999px;
      border: 2px solid rgba(0, 0, 0, 0);
      cursor: pointer;
    }

    .swatch.active {
      border-color: var(--login-primary);
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.12);
    }

    .preset-tabs {
      display: flex;
      gap: 6px;
      padding: 6px;
      border-radius: 12px;
      background: #f1f5f9;
      width: fit-content;
    }

    .preset-tab {
      height: 32px;
      padding: 0 14px;
      border-radius: 10px;
      border: 1px solid transparent;
      background: transparent;
      color: #64748b;
      font-weight: 700;
      cursor: pointer;
    }

    .preset-tab.active {
      background: #ffffff;
      color: #0f172a;
      border-color: rgba(15, 23, 42, 0.08);
      box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08);
    }

    .header {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo {
      width: 220px;
      max-width: 70%;
      height: auto;
      display: block;
      margin: 0 auto 32px;
      flex-shrink: 0;
    }

    .title {
      color: #0f172a;
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 10px;
      letter-spacing: -0.01em;
    }

    .subtitle {
      color: #64748b;
      font-weight: 500;
    }

    .form {
      display: grid;
      gap: 18px;
    }

    .field {
      display: grid;
      gap: 8px;
    }

    .label {
      color: #0f172a;
      font-size: 18px;
      font-weight: 600;
    }

    .input {
      height: 48px;
      width: 100%;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 0 14px;
      font-size: 16px;
      outline: none;
      background: var(--login-surface);
      color: #0f172a;
      box-sizing: border-box;
    }

    .input:focus {
      border-color: var(--login-primary);
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
    }

    .password-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
      align-items: center;
    }

    .toggle {
      height: 48px;
      border-radius: 12px;
      border: 1px solid #cbd5e1;
      background: var(--login-surface);
      color: #0f172a;
      padding: 0 14px;
      font-weight: 600;
      cursor: pointer;
    }

    .toggle:focus {
      outline: none;
      border-color: var(--login-primary);
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
    }

    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-top: 6px;
    }

    .checkbox {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #0f172a;
      font-weight: 500;
      user-select: none;
      cursor: pointer;
    }

    .checkbox input {
      width: 18px;
      height: 18px;
      accent-color: var(--login-primary);
      cursor: pointer;
    }

    .link {
      color: var(--login-primary);
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
    }

    .link:hover {
      text-decoration: underline;
    }

    .field-error {
      color: #dc2626;
      font-size: 13px;
      font-weight: 500;
    }

    .error-alert {
      padding: 12px 14px;
      border-radius: 12px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      font-weight: 600;
      font-size: 14px;
    }

    .btn {
      margin-top: 6px;
      height: 48px;
      width: 100%;
      border: none;
      border-radius: 12px;
      background: var(--login-primary);
      color: white;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    @media (max-width: 640px) {
      .card {
        padding: 56px 24px;
      }

      .label {
        font-size: 16px;
      }

      .row {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .page.dark {
      background: #020617;
    }

    .page.dark .card {
      background: #0b1220;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    }

    .page.dark .sakai-btn {
      border-color: rgba(248, 250, 252, 0.25);
      background: rgba(2, 6, 23, 0.8);
      color: #f8fafc;
    }

    .page.dark .sakai-panel {
      background: #0b1220;
      border-color: #334155;
    }

    .page.dark .panel-section {
      border-top-color: rgba(148, 163, 184, 0.18);
    }

    .page.dark .panel-label {
      color: #94a3b8;
    }

    .page.dark .preset-tabs {
      background: rgba(148, 163, 184, 0.12);
    }

    .page.dark .preset-tab {
      color: #94a3b8;
    }

    .page.dark .preset-tab.active {
      background: rgba(2, 6, 23, 0.8);
      color: #f8fafc;
      border-color: #334155;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.35);
    }

    .page.dark .title {
      color: #f8fafc;
    }

    .page.dark .subtitle {
      color: #94a3b8;
    }

    .page.dark .label {
      color: #f8fafc;
    }

    .page.dark .input,
    .page.dark .toggle {
      background: #0b1220;
      border-color: #334155;
      color: #f8fafc;
    }

    .page.dark .checkbox {
      color: #e2e8f0;
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
  readonly isDark = signal(this.readInitialDark());
  readonly primaryColor = signal(this.readInitialPrimaryColor());
  readonly surfaceColor = signal(this.readInitialSurfaceColor());
  readonly preset = signal(this.readInitialPreset());
  readonly showConfigurator = signal(false);
  readonly primaryColors = [
    '#334155',
    '#10b981',
    '#22c55e',
    '#84cc16',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#ec4899',
    '#ef4444'
  ];
  readonly surfaceColors = ['#ffffff', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155'];
  readonly presets = ['Aura', 'Lara', 'Nora'];
  readonly useFallbackLogo = signal(false);
  readonly logoCandidates = ['/toli-logo.png', 'toli-logo.png'];
  readonly logoIndex = signal(0);
  readonly logoSrc = computed(() => this.logoCandidates[this.logoIndex()] ?? '');

  onLogoError(): void {
    const nextIndex = this.logoIndex() + 1;
    if (nextIndex < this.logoCandidates.length) {
      this.logoIndex.set(nextIndex);
      return;
    }
    this.useFallbackLogo.set(true);
  }

  setTheme(isDark: boolean): void {
    this.isDark.set(isDark);
    this.writeStorage('toli-theme-dark', String(isDark));
    this.writeStorage('login-dark', String(isDark));
  }

  setPrimaryColor(color: string): void {
    this.primaryColor.set(color);
    this.writeStorage('toli-theme-primary', color);
    this.writeStorage('login-primary', color);
  }

  setSurfaceColor(color: string): void {
    this.surfaceColor.set(color);
    this.writeStorage('toli-theme-surface', color);
    this.writeStorage('login-surface', color);
  }

  setPreset(preset: string): void {
    this.preset.set(preset);
    this.writeStorage('toli-theme-preset', preset);
    this.writeStorage('login-preset', preset);
    if (preset === 'Aura') this.setPrimaryColor('#10b981');
    if (preset === 'Lara') this.setPrimaryColor('#3b82f6');
    if (preset === 'Nora') this.setPrimaryColor('#8b5cf6');
  }

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

  private readInitialDark(): boolean {
    const saved = this.readStorage('toli-theme-dark') || this.readStorage('login-dark');
    if (saved === 'true') return true;
    if (saved === 'false') return false;
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  }

  private readInitialPrimaryColor(): string {
    return this.readStorage('toli-theme-primary') || this.readStorage('login-primary') || '#10b981';
  }

  private readInitialSurfaceColor(): string {
    return this.readStorage('toli-theme-surface') || this.readStorage('login-surface') || '#ffffff';
  }

  private readInitialPreset(): string {
    return this.readStorage('toli-theme-preset') || this.readStorage('login-preset') || 'Aura';
  }

  private readStorage(key: string): string | null {
    try {
      if (typeof window === 'undefined') return null;
      return window.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private writeStorage(key: string, value: string): void {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage?.setItem(key, value);
    } catch {}
  }
}
