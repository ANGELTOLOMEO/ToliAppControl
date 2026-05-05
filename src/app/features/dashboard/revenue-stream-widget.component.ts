import { afterNextRender, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { LayoutService } from '../../layout/service/layout.service';

@Component({
  standalone: true,
  selector: 'app-revenue-stream-widget',
  imports: [CommonModule, ButtonModule, ChartModule],
  template: `
    <div class="card">
      <div class="header">
        <div class="heading">
          <div class="title-row">
            <div class="title">Revenue Stream</div>
            <span class="pill">{{ rangeLabel() }}</span>
          </div>
          <div class="subtitle">Ingresos por canal</div>
        </div>

        <div class="meta">
          <div class="kpi">
            <div class="kpi-label">Total</div>
            <div class="kpi-value">{{ totalRevenue() | currency: 'USD' }}</div>
            <div class="kpi-trend" [class.up]="trendPct() >= 0" [class.down]="trendPct() < 0">
              <span class="mono">{{ trendPct() >= 0 ? '+' : '' }}{{ trendPct() | number: '1.1-1' }}%</span>
              <span class="kpi-trend-label">vs periodo anterior</span>
            </div>
          </div>

          <div class="segmented" role="group" aria-label="Rango">
            <button
              pButton
              type="button"
              label="Sem"
              class="seg-btn"
              [class.active]="range() === 'W'"
              (onClick)="setRange('W')"
            ></button>
            <button
              pButton
              type="button"
              label="Mes"
              class="seg-btn"
              [class.active]="range() === 'M'"
              (onClick)="setRange('M')"
            ></button>
            <button
              pButton
              type="button"
              label="Trim"
              class="seg-btn"
              [class.active]="range() === 'Q'"
              (onClick)="setRange('Q')"
            ></button>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <p-chart type="bar" [data]="chartData()" [options]="chartOptions()" class="chart" />
    </div>
  `,
  styles: [`
    .card {
      background:
        radial-gradient(1200px 220px at 10% -10%, rgba(16, 185, 129, 0.14), transparent 60%),
        radial-gradient(900px 200px at 100% 0%, rgba(59, 130, 246, 0.12), transparent 55%),
        #ffffff;
      border-radius: 18px;
      border: 1px solid rgba(15, 23, 42, 0.08);
      box-shadow: 0 14px 36px rgba(15, 23, 42, 0.10);
      padding: 16px 16px 14px;
    }

    :host-context(.dark) .card {
      background:
        radial-gradient(1200px 220px at 10% -10%, rgba(16, 185, 129, 0.22), transparent 60%),
        radial-gradient(900px 200px at 100% 0%, rgba(59, 130, 246, 0.18), transparent 55%),
        rgba(17, 24, 39, 0.72);
      border-color: rgba(148, 163, 184, 0.20);
      box-shadow: 0 18px 52px rgba(0, 0, 0, 0.42);
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 10px;
    }

    .heading {
      min-width: 0;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .title {
      font-weight: 700;
      font-size: 18px;
      color: var(--text-color, #0f172a);
      letter-spacing: -0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      height: 22px;
      padding: 0 10px;
      border-radius: 999px;
      border: 1px solid rgba(15, 23, 42, 0.10);
      background: rgba(255, 255, 255, 0.75);
      color: rgba(15, 23, 42, 0.70);
      font-weight: 700;
      font-size: 12px;
      flex: 0 0 auto;
    }

    :host-context(.dark) .pill {
      border-color: rgba(148, 163, 184, 0.25);
      background: rgba(15, 23, 42, 0.28);
      color: rgba(226, 232, 240, 0.82);
    }

    .subtitle {
      margin-top: 4px;
      font-size: 12.5px;
      color: rgba(15, 23, 42, 0.60);
    }

    :host-context(.dark) .subtitle {
      color: rgba(226, 232, 240, 0.62);
    }

    .meta {
      display: inline-flex;
      align-items: flex-start;
      gap: 14px;
      flex: 0 0 auto;
    }

    .kpi {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
      min-width: 160px;
    }

    .kpi-label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: rgba(15, 23, 42, 0.55);
      text-transform: uppercase;
    }

    :host-context(.dark) .kpi-label {
      color: rgba(226, 232, 240, 0.55);
    }

    .kpi-value {
      font-size: 18px;
      font-weight: 800;
      color: var(--text-color, #0f172a);
      letter-spacing: -0.01em;
    }

    .kpi-trend {
      display: inline-flex;
      align-items: baseline;
      gap: 8px;
      font-size: 12px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid rgba(15, 23, 42, 0.10);
      background: rgba(255, 255, 255, 0.7);
      color: rgba(15, 23, 42, 0.78);
    }

    :host-context(.dark) .kpi-trend {
      border-color: rgba(148, 163, 184, 0.25);
      background: rgba(15, 23, 42, 0.28);
      color: rgba(226, 232, 240, 0.82);
    }

    .kpi-trend.up {
      border-color: color-mix(in srgb, var(--p-primary-color, #10b981) 35%, rgba(15, 23, 42, 0.10));
    }

    .kpi-trend.down {
      border-color: color-mix(in srgb, #ef4444 40%, rgba(15, 23, 42, 0.10));
    }

    .kpi-trend-label {
      font-weight: 700;
      color: rgba(15, 23, 42, 0.55);
    }

    :host-context(.dark) .kpi-trend-label {
      color: rgba(226, 232, 240, 0.55);
    }

    .segmented {
      display: inline-flex;
      align-items: center;
      padding: 4px;
      border-radius: 12px;
      border: 1px solid rgba(15, 23, 42, 0.10);
      background: rgba(255, 255, 255, 0.75);
      gap: 4px;
    }

    :host-context(.dark) .segmented {
      border-color: rgba(148, 163, 184, 0.25);
      background: rgba(15, 23, 42, 0.28);
    }

    :host ::ng-deep .seg-btn.p-button {
      padding: 0.45rem 0.65rem;
      border-radius: 10px;
      border: 1px solid transparent;
      background: transparent;
      color: rgba(15, 23, 42, 0.70);
      font-weight: 800;
      font-size: 12px;
      line-height: 1;
      box-shadow: none;
    }

    :host-context(.dark) :host ::ng-deep .seg-btn.p-button {
      color: rgba(226, 232, 240, 0.78);
    }

    :host ::ng-deep .seg-btn.p-button.active {
      background: color-mix(in srgb, var(--p-primary-color, #10b981) 12%, rgba(255, 255, 255, 0.92));
      border-color: color-mix(in srgb, var(--p-primary-color, #10b981) 24%, rgba(15, 23, 42, 0.10));
      color: rgba(15, 23, 42, 0.88);
    }

    :host-context(.dark) :host ::ng-deep .seg-btn.p-button.active {
      background: color-mix(in srgb, var(--p-primary-color, #10b981) 18%, rgba(15, 23, 42, 0.28));
      border-color: color-mix(in srgb, var(--p-primary-color, #10b981) 35%, rgba(148, 163, 184, 0.25));
      color: rgba(226, 232, 240, 0.92);
    }

    .divider {
      height: 1px;
      background: rgba(15, 23, 42, 0.08);
      margin: 10px 0 10px;
    }

    :host-context(.dark) .divider {
      background: rgba(148, 163, 184, 0.20);
    }

    .chart {
      display: block;
      height: 260px;
    }

    .mono {
      font-variant-numeric: tabular-nums;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    }

    @media (max-width: 920px) {
      .header {
        flex-direction: column;
        align-items: stretch;
      }

      .meta {
        justify-content: space-between;
      }

      .kpi {
        align-items: flex-start;
      }
    }
  `]
})
export class RevenueStreamWidget {
  private readonly layoutService = inject(LayoutService);

  protected readonly range = signal<'W' | 'M' | 'Q'>('Q');

  chartData = signal<any>(null);
  chartOptions = signal<any>(null);

  protected readonly rangeLabel = computed(() => {
    const r = this.range();
    if (r === 'W') return 'Semanal';
    if (r === 'M') return 'Mensual';
    return 'Trimestral';
  });

  protected readonly totalRevenue = computed(() => {
    const data = this.chartData();
    const totals = this.totalsByLabel(data);
    return totals.reduce((acc, v) => acc + v, 0);
  });

  protected readonly trendPct = computed(() => {
    const data = this.chartData();
    const totals = this.totalsByLabel(data);
    if (totals.length < 2) return 0;
    const prev = totals[totals.length - 2];
    const last = totals[totals.length - 1];
    if (!prev) return 0;
    return ((last - prev) / prev) * 100;
  });

  constructor() {
    afterNextRender(() => {
      setTimeout(() => this.initChart(), 150);
    });

    effect(() => {
      this.layoutService.layoutConfig().darkTheme;
      this.layoutService.layoutConfig().primaryColor;
      this.range();
      setTimeout(() => this.initChart(), 150);
    });
  }

  protected setRange(range: 'W' | 'M' | 'Q'): void {
    this.range.set(range);
  }

  initChart(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const borderColor = documentStyle.getPropertyValue('--surface-border');
    const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

    const palette = {
      a: documentStyle.getPropertyValue('--p-primary-400'),
      b: documentStyle.getPropertyValue('--p-primary-300'),
      c: documentStyle.getPropertyValue('--p-primary-200')
    };

    const range = this.range();
    const base =
      range === 'W'
        ? {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            subs: [1100, 1800, 1600, 2100],
            adv: [700, 900, 800, 1200],
            aff: [500, 650, 720, 900]
          }
        : range === 'M'
          ? {
              labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
              subs: [5200, 6100, 7400, 7900, 8600, 9400],
              adv: [2400, 3100, 2800, 3500, 3900, 4200],
              aff: [1300, 1500, 1700, 2100, 2300, 2600]
            }
          : {
              labels: ['Q1', 'Q2', 'Q3', 'Q4'],
              subs: [4000, 10000, 15000, 4000],
              adv: [2100, 8400, 2400, 7500],
              aff: [4100, 5200, 3400, 7400]
            };

    this.chartData.set({
      labels: base.labels,
      datasets: [
        {
          type: 'bar',
          label: 'Subscriptions',
          backgroundColor: palette.a,
          data: base.subs,
          barThickness: 32
        },
        {
          type: 'bar',
          label: 'Advertising',
          backgroundColor: palette.b,
          data: base.adv,
          barThickness: 32
        },
        {
          type: 'bar',
          label: 'Affiliate',
          backgroundColor: palette.c,
          data: base.aff,
          borderRadius: {
            topLeft: 8,
            topRight: 8,
            bottomLeft: 0,
            bottomRight: 0
          },
          borderSkipped: false,
          barThickness: 32
        }
      ]
    });

    this.chartOptions.set({
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: textMutedColor
          },
          grid: {
            color: 'transparent',
            borderColor: 'transparent'
          }
        },
        y: {
          stacked: true,
          ticks: {
            color: textMutedColor
          },
          grid: {
            color: borderColor,
            borderColor: 'transparent',
            drawTicks: false
          }
        }
      }
    });
  }

  private totalsByLabel(data: any): number[] {
    const labels: any[] = data?.labels ?? [];
    const datasets: any[] = data?.datasets ?? [];
    if (!Array.isArray(labels) || !Array.isArray(datasets) || labels.length === 0) return [];

    const totals = new Array(labels.length).fill(0);
    for (const ds of datasets) {
      const values: any[] = ds?.data ?? [];
      for (let i = 0; i < totals.length; i++) {
        totals[i] += Number(values[i] ?? 0);
      }
    }
    return totals;
  }
}

