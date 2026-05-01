import { afterNextRender, Component, effect, inject, signal } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { LayoutService } from '../../layout/service/layout.service';

@Component({
  standalone: true,
  selector: 'app-revenue-stream-widget',
  imports: [ChartModule],
  template: `
    <div class="card">
      <div class="title">Revenue Stream</div>
      <p-chart type="bar" [data]="chartData()" [options]="chartOptions()" class="chart" />
    </div>
  `,
  styles: [`
    .card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid rgba(15, 23, 42, 0.08);
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.10);
      padding: 16px;
    }

    :host-context(.dark) .card {
      background: rgba(17, 24, 39, 0.72);
      border-color: rgba(148, 163, 184, 0.20);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
    }

    .title {
      font-weight: 700;
      font-size: 18px;
      margin-bottom: 12px;
      color: var(--text-color, #0f172a);
    }

    .chart {
      display: block;
      height: 260px;
    }
  `]
})
export class RevenueStreamWidget {
  private readonly layoutService = inject(LayoutService);

  chartData = signal<any>(null);
  chartOptions = signal<any>(null);

  constructor() {
    afterNextRender(() => {
      setTimeout(() => this.initChart(), 150);
    });

    effect(() => {
      this.layoutService.layoutConfig().darkTheme;
      this.layoutService.layoutConfig().primaryColor;
      setTimeout(() => this.initChart(), 150);
    });
  }

  initChart(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const borderColor = documentStyle.getPropertyValue('--surface-border');
    const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

    this.chartData.set({
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          type: 'bar',
          label: 'Subscriptions',
          backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
          data: [4000, 10000, 15000, 4000],
          barThickness: 32
        },
        {
          type: 'bar',
          label: 'Advertising',
          backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
          data: [2100, 8400, 2400, 7500],
          barThickness: 32
        },
        {
          type: 'bar',
          label: 'Affiliate',
          backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
          data: [4100, 5200, 3400, 7400],
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
          labels: {
            color: textColor
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
}

