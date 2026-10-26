import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../shared/icon.component';
import { SiteService } from '../services/site.service';
import { ThemeService } from '../services/theme.service';

/** Fixed header: navigation trigger, home button and theme switch. */
@Component({
  selector: 'app-top-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="w-full max-w-md mx-auto px-4 mt-2 mb-2 z-[200] relative pointer-events-auto">
      <div class="flex items-center gap-4">

        <!-- Navigation (left) -->
        <button (click)="openSidebar.emit()" aria-label="Abrir navegación"
                class="w-[54px] h-[54px] shrink-0 rounded-2xl bg-[var(--bg-surface)]/80 border border-[var(--border-main)] flex flex-col items-center justify-center gap-[5px] hover:bg-[var(--bg-hover)] transition-colors backdrop-blur-md shadow-lg pointer-events-auto">
          <div class="w-6 h-[2px] bg-[var(--text-muted)] rounded-full"></div>
          <div class="w-6 h-[2px] bg-[var(--text-muted)] rounded-full"></div>
          <div class="w-6 h-[2px] bg-[var(--text-muted)] rounded-full"></div>
        </button>

        <!-- Brand (middle) -->
        <button (click)="resetView.emit()" aria-label="Volver al inicio del catálogo"
                class="flex-1 h-[54px] bg-[var(--bg-surface)]/80 border border-[var(--border-main)] rounded-2xl px-6 backdrop-blur-md hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-center shadow-lg pointer-events-auto group overflow-hidden relative">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent to-[#ffffff]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span class="font-montserrat font-semibold tracking-tight text-[var(--text-main)] text-sm drop-shadow-md">{{ site.identity().appName }}</span>
        </button>

        <!-- Theme toggle (right) -->
        <button (click)="theme.toggle()" aria-label="Cambiar entre tema claro y oscuro"
                class="w-[54px] h-[54px] shrink-0 rounded-2xl bg-[var(--bg-surface)]/80 border border-[var(--border-main)] flex flex-col items-center justify-center hover:bg-[var(--bg-hover)] transition-colors backdrop-blur-md shadow-lg pointer-events-auto group">
          <mat-icon class="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">
            {{ theme.isLight() ? 'dark_mode' : 'light_mode' }}
          </mat-icon>
        </button>

      </div>
    </div>
  `,
})
export class TopHeaderComponent {
  readonly site = inject(SiteService);
  readonly theme = inject(ThemeService);

  resetView = output<void>();
  openSidebar = output<void>();
}
