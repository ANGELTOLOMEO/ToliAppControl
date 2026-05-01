import { Injectable, effect, signal } from '@angular/core';

export interface LayoutConfig {
  darkTheme: boolean;
  primaryColor: string;
  surfaceColor: string;
  preset: string;
}

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly _layoutConfig = signal<LayoutConfig>(this.readInitialConfig());
  readonly layoutConfig = this._layoutConfig.asReadonly();

  constructor() {
    effect(() => {
      const config = this._layoutConfig();
      this.writeStorage('toli-theme-dark', String(config.darkTheme));
      this.writeStorage('toli-theme-primary', config.primaryColor);
      this.writeStorage('toli-theme-surface', config.surfaceColor);
      this.writeStorage('toli-theme-preset', config.preset);
      this.applyCssVars(config);
    });
  }

  setDarkTheme(darkTheme: boolean): void {
    this._layoutConfig.update((c) => ({ ...c, darkTheme }));
  }

  setPrimaryColor(primaryColor: string): void {
    this._layoutConfig.update((c) => ({ ...c, primaryColor }));
  }

  setSurfaceColor(surfaceColor: string): void {
    this._layoutConfig.update((c) => ({ ...c, surfaceColor }));
  }

  setPreset(preset: string): void {
    this._layoutConfig.update((c) => ({ ...c, preset }));
    if (preset === 'Aura') this.setPrimaryColor('#10b981');
    if (preset === 'Lara') this.setPrimaryColor('#3b82f6');
    if (preset === 'Nora') this.setPrimaryColor('#8b5cf6');
  }

  private readInitialConfig(): LayoutConfig {
    const savedDark = this.readStorage('toli-theme-dark') ?? this.readStorage('login-dark');
    const darkTheme =
      savedDark === 'true'
        ? true
        : savedDark === 'false'
          ? false
          : typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;

    return {
      darkTheme,
      primaryColor: this.readStorage('toli-theme-primary') || this.readStorage('login-primary') || '#10b981',
      surfaceColor: this.readStorage('toli-theme-surface') || this.readStorage('login-surface') || '#ffffff',
      preset: this.readStorage('toli-theme-preset') || this.readStorage('login-preset') || 'Aura'
    };
  }

  private applyCssVars(config: LayoutConfig): void {
    try {
      if (typeof window === 'undefined') return;
      const root = document.documentElement;
      const textColor = config.darkTheme ? 'rgb(248, 250, 252)' : 'rgb(15, 23, 42)';
      const textMutedColor = config.darkTheme ? 'rgb(148, 163, 184)' : 'rgb(100, 116, 139)';
      const borderColor = config.darkTheme ? 'rgba(148, 163, 184, 0.20)' : 'rgba(15, 23, 42, 0.08)';

      root.style.setProperty('--text-color', textColor);
      root.style.setProperty('--text-color-secondary', textMutedColor);
      root.style.setProperty('--surface-border', borderColor);

      root.style.setProperty('--p-primary-400', config.primaryColor);
      root.style.setProperty('--p-primary-300', this.mixWithWhite(config.primaryColor, 0.22));
      root.style.setProperty('--p-primary-200', this.mixWithWhite(config.primaryColor, 0.38));
    } catch {}
  }

  private mixWithWhite(color: string, amount: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;
    const r = Math.round(rgb.r + (255 - rgb.r) * amount);
    const g = Math.round(rgb.g + (255 - rgb.g) * amount);
    const b = Math.round(rgb.b + (255 - rgb.b) * amount);
    return `rgb(${r}, ${g}, ${b})`;
  }

  private hexToRgb(color: string): { r: number; g: number; b: number } | null {
    const hex = (color || '').trim();
    const match = /^#?([0-9a-f]{6})$/i.exec(hex);
    if (!match) return null;
    const intVal = parseInt(match[1], 16);
    return {
      r: (intVal >> 16) & 255,
      g: (intVal >> 8) & 255,
      b: intVal & 255
    };
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

