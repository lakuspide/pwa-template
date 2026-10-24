import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { SiteService } from '../services/site.service';
import { SectorPresetId } from '../../site/site.types';
import { IconComponent } from '../shared/icon.component';

/**
 * Demo-only sector switcher.
 *
 * Rendered by the shell only when `DEMO_MODE` is true. It is intentionally
 * touch-first: a large floating button, a full-width sheet and an explicit close
 * button, with no dependency on the Escape key.
 */
@Component({
  selector: 'app-sector-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <button (click)="open.set(true)"
            aria-haspopup="dialog"
            [attr.aria-expanded]="open()"
            aria-label="Switch demo sector"
            class="fixed left-4 bottom-6 z-[900] h-12 pl-3 pr-4 rounded-full bg-[var(--bg-surface)]/85 backdrop-blur-md border border-[var(--border-main)] shadow-xl flex items-center gap-2 text-[var(--text-main)] hover:bg-[var(--bg-hover)] active:scale-95 transition-all">
      <mat-icon class="text-[20px] !w-5 !h-5 text-[var(--color-accent)]">swap_horiz</mat-icon>
      <span class="text-xs font-bold max-w-[9rem] truncate">{{ currentLabel() }}</span>
      <span class="text-[10px] text-[var(--text-dim)] uppercase tracking-wide">demo</span>
    </button>

    @if (open()) {
      <div class="fixed inset-0 z-[2200] flex items-end sm:items-center justify-center">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
             (click)="open.set(false)"
             (keydown.enter)="open.set(false)"
             role="button"
             tabindex="0"
             aria-label="Close the sector switcher"></div>

        <div class="relative w-full max-w-lg max-h-[85dvh] m-3 sm:m-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up"
             role="dialog"
             aria-modal="true"
             aria-labelledby="sector-switcher-title">
          <div class="flex items-start justify-between gap-4 p-6 border-b border-[var(--border-main)]">
            <div>
              <h2 id="sector-switcher-title" class="font-montserrat font-black text-xl text-[var(--text-main)]">Demo sector</h2>
              <p class="text-[var(--text-muted)] text-xs mt-1 leading-relaxed">
                Switch catalog, copy, prices and enabled features instantly.
              </p>
            </div>
            <button (click)="open.set(false)"
                    aria-label="Close the sector switcher"
                    class="w-11 h-11 shrink-0 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="p-4 overflow-y-auto touch-pan-y custom-scrollbar flex flex-col gap-2">
            @for (preset of site.presets; track preset.id) {
              <button (click)="select(preset.id)"
                      [attr.aria-pressed]="preset.id === site.preset()"
                      class="w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 active:scale-[0.99]"
                      [style.border-color]="preset.id === site.preset() ? 'var(--color-accent)' : 'var(--border-main)'"
                      [style.background-color]="preset.id === site.preset() ? 'var(--bg-hover)' : 'transparent'">
                <span class="w-11 h-11 shrink-0 rounded-xl bg-[var(--bg-main)]/60 border border-[var(--border-main)] flex items-center justify-center">
                  <mat-icon class="text-[var(--text-muted)]">{{ preset.icon }}</mat-icon>
                </span>
                <span class="flex-1 min-w-0">
                  <span class="block text-[var(--text-main)] font-bold text-sm">{{ preset.label }}</span>
                  <span class="block text-[var(--text-muted)] text-xs leading-snug mt-0.5">{{ preset.description }}</span>
                </span>
                @if (preset.id === site.preset()) {
                  <mat-icon class="text-[var(--color-accent)] shrink-0">check_circle</mat-icon>
                }
              </button>
            }
          </div>

          <p class="px-6 py-4 border-t border-[var(--border-main)] text-[var(--text-dim)] text-[10px] leading-relaxed">
            Demo only. Generated projects set <code class="font-mono">DEMO_MODE = false</code> and pin one preset.
          </p>
        </div>
      </div>
    }
  `,
})
export class SectorSwitcherComponent {
  readonly site = inject(SiteService);
  readonly open = signal(false);

  readonly currentLabel = computed(
    () => this.site.presets.find((preset) => preset.id === this.site.preset())?.label ?? 'Sector',
  );

  /** Emits only when the preset actually changed, so the shell can reset state. */
  presetChanged = output<void>();

  select(id: SectorPresetId): void {
    const changed = this.site.applyPreset(id);
    this.open.set(false);
    if (changed) {
      this.presetChanged.emit();
    }
  }
}
