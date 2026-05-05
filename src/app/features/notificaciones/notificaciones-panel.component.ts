import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';

type Filtro = 'todas' | 'no_leidas';

interface NotifUi {
  id: string;
  titulo: string;
  contenido: string;
  tipo: 'venta' | 'sistema' | 'pago' | 'soporte' | 'inventario';
  leida: boolean;
  creado_en: string;
}

@Component({
  selector: 'app-notificaciones-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, ButtonModule, SelectButtonModule, TagModule],
  template: `
    <div class="page-container">
      <div class="card-container notifications-shell">
        <div class="hero">
          <div>
            <h2>Centro de notificaciones</h2>
            <p>Revisa actividad reciente y mantn tu equipo al da.</p>
          </div>
          <div class="hero-actions">
            <p-tag severity="info" [value]="pendingCount() + ' pendientes'" />
            <p-button label="Marcar todo leido" icon="pi pi-check" severity="secondary" (onClick)="markAllAsRead()" />
          </div>
        </div>

        <div class="toolbar">
          <p-selectbutton [options]="filtros" [(ngModel)]="filtro" optionLabel="label" optionValue="value" />
          <p-button label="Limpiar leidas" icon="pi pi-trash" severity="danger" [outlined]="true" (onClick)="removeRead()" />
        </div>

        @if (!grouped().length) {
          <div class="empty">
            <i class="pi pi-bell"></i>
            <div class="empty-title">Sin notificaciones</div>
            <div class="empty-subtitle">No hay elementos para el filtro actual.</div>
          </div>
        } @else {
          @for (section of grouped(); track section.label) {
            <section class="section">
              <div class="section-label">{{ section.label }}</div>
              <ul class="notif-list">
                @for (n of section.items; track n.id) {
                  <li class="notif-item" [class.not-read]="!n.leida">
                    <div class="icon-circle" [ngClass]="iconClass(n.tipo)">
                      <i class="pi" [ngClass]="iconName(n.tipo)"></i>
                    </div>
                    <div class="message">
                      <div class="row">
                        <div class="message-title">{{ n.titulo }}</div>
                        <time class="time">{{ n.creado_en | date: 'dd/MM HH:mm' }}</time>
                      </div>
                      <div class="message-body">{{ n.contenido }}</div>
                    </div>
                    <div class="actions">
                      @if (!n.leida) {
                        <p-button icon="pi pi-eye" [text]="true" severity="secondary" (onClick)="markAsRead(n.id)" />
                      }
                      <p-button icon="pi pi-times" [text]="true" severity="danger" (onClick)="removeOne(n.id)" />
                    </div>
                  </li>
                }
              </ul>
            </section>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .notifications-shell {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .hero {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 14px;
      border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      background:
        radial-gradient(500px 150px at 10% 0%, color-mix(in srgb, var(--accent-primary, #10b981) 18%, transparent), transparent 60%),
        var(--bg-tertiary, #f1f5f9);
    }

    h2 {
      margin: 0;
      font-size: 1.2rem;
      color: var(--text-primary, #0f172a);
    }

    .hero p {
      margin: 6px 0 0;
      color: var(--text-secondary, #475569);
    }

    .hero-actions, .toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-label {
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: var(--text-tertiary, #64748b);
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .notif-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .notif-item {
      display: grid;
      grid-template-columns: 44px 1fr auto;
      gap: 12px;
      align-items: center;
      padding: 10px;
      border: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
      border-radius: 12px;
      background: var(--bg-secondary, #fff);
    }

    .notif-item.not-read {
      border-color: color-mix(in srgb, var(--accent-primary, #10b981) 32%, var(--border-color, rgba(15, 23, 42, 0.08)));
      box-shadow: 0 8px 18px rgba(16, 185, 129, 0.08);
    }

    .icon-circle {
      width: 40px;
      height: 40px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }

    .icon-sale { background: rgba(59, 130, 246, 0.14); color: #2563eb; }
    .icon-system { background: rgba(245, 158, 11, 0.14); color: #d97706; }
    .icon-pay { background: rgba(16, 185, 129, 0.14); color: #059669; }
    .icon-help { background: rgba(236, 72, 153, 0.14); color: #db2777; }
    .icon-stock { background: rgba(107, 114, 128, 0.14); color: #4b5563; }

    .message { min-width: 0; }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .message-title {
      font-weight: 700;
      color: var(--text-primary, #0f172a);
    }

    .message-body {
      margin-top: 2px;
      color: var(--text-secondary, #475569);
      font-size: 0.9rem;
    }

    .time {
      font-size: 0.75rem;
      color: var(--text-tertiary, #64748b);
      white-space: nowrap;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .empty {
      border: 1px dashed var(--border-color, rgba(15, 23, 42, 0.12));
      border-radius: 14px;
      padding: 22px;
      text-align: center;
      color: var(--text-secondary, #475569);
    }

    .empty i { font-size: 1.2rem; margin-bottom: 6px; }
    .empty-title { font-weight: 800; color: var(--text-primary, #0f172a); }

    @media (max-width: 768px) {
      .hero { flex-direction: column; }
      .toolbar { flex-direction: column; align-items: stretch; }
      .notif-item { grid-template-columns: 40px 1fr; }
      .actions { grid-column: 1 / -1; justify-content: flex-end; }
    }
  `]
})
export class NotificacionesPanelComponent {
  protected readonly filtros = [
    { label: 'Todas', value: 'todas' },
    { label: 'No leidas', value: 'no_leidas' }
  ];

  protected filtro: Filtro = 'todas';

  private readonly notificaciones = signal<NotifUi[]>([
    { id: 'n1', titulo: 'Nueva venta', contenido: 'Pedido #A-193 por S/ 79.00 confirmado.', tipo: 'venta', leida: false, creado_en: new Date().toISOString() },
    { id: 'n2', titulo: 'Retiro en proceso', contenido: 'Tu solicitud de retiro por S/ 2500.00 fue iniciada.', tipo: 'pago', leida: false, creado_en: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    { id: 'n3', titulo: 'Soporte', contenido: 'Jane Davis public una pregunta sobre un producto.', tipo: 'soporte', leida: true, creado_en: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: 'n4', titulo: 'Inventario', contenido: 'El producto "Polo Azul" baj de stock mnimo.', tipo: 'inventario', leida: true, creado_en: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
    { id: 'n5', titulo: 'Sistema', contenido: 'Actualizacin de seguridad aplicada correctamente.', tipo: 'sistema', leida: true, creado_en: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() }
  ]);

  protected readonly pendingCount = computed(() => this.notificaciones().filter((n) => !n.leida).length);

  protected readonly grouped = computed(() => {
    const source = this.filtro === 'no_leidas'
      ? this.notificaciones().filter((n) => !n.leida)
      : this.notificaciones();

    const todayKey = this.dayKey(new Date());
    const yesterdayKey = this.dayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));

    const groups = {
      hoy: [] as NotifUi[],
      ayer: [] as NotifUi[],
      anteriores: [] as NotifUi[]
    };

    source
      .slice()
      .sort((a, b) => +new Date(b.creado_en) - +new Date(a.creado_en))
      .forEach((n) => {
        const key = this.dayKey(new Date(n.creado_en));
        if (key === todayKey) groups.hoy.push(n);
        else if (key === yesterdayKey) groups.ayer.push(n);
        else groups.anteriores.push(n);
      });

    return [
      { label: 'Hoy', items: groups.hoy },
      { label: 'Ayer', items: groups.ayer },
      { label: 'Anteriores', items: groups.anteriores }
    ].filter((g) => g.items.length);
  });

  protected markAsRead(id: string): void {
    this.notificaciones.update((list) => list.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  }

  protected markAllAsRead(): void {
    this.notificaciones.update((list) => list.map((n) => ({ ...n, leida: true })));
  }

  protected removeOne(id: string): void {
    this.notificaciones.update((list) => list.filter((n) => n.id !== id));
  }

  protected removeRead(): void {
    this.notificaciones.update((list) => list.filter((n) => !n.leida));
  }

  protected iconClass(tipo: NotifUi['tipo']): string {
    if (tipo === 'venta') return 'icon-sale';
    if (tipo === 'sistema') return 'icon-system';
    if (tipo === 'pago') return 'icon-pay';
    if (tipo === 'soporte') return 'icon-help';
    return 'icon-stock';
  }

  protected iconName(tipo: NotifUi['tipo']): string {
    if (tipo === 'venta') return 'pi-shopping-bag';
    if (tipo === 'sistema') return 'pi-cog';
    if (tipo === 'pago') return 'pi-wallet';
    if (tipo === 'soporte') return 'pi-comment';
    return 'pi-box';
  }

  private dayKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }
}
