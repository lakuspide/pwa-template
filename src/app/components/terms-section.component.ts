import { Component, computed, input, output, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelId } from '../models/panel';
import { SiteService } from '../services/site.service';
import { IconComponent } from '../shared/icon.component';

/**
 * Legal terms panel; copy and section list come from the active preset.
 *
 * The sections are laid out as a sticky stack: each card pins below the close
 * button and the next one slides over it, so the legal text reads as a pile of
 * sheets instead of one long column. It is the only panel with that treatment.
 */
@Component({
  selector: 'app-terms-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="w-full max-w-md mt-4 mb-12 px-4 transition-all duration-500" [class.flex-1]="activeBox() === 'terms'">
      @if (activeBox() === null) {
        <button (click)="setActiveBox.emit('terms')" class="w-full bg-[var(--bg-surface)]/60 border border-[var(--border-main)] rounded-2xl py-4 px-6 backdrop-blur-md hover:bg-[var(--bg-hover)] transition-all flex items-center justify-between group shadow-lg relative overflow-hidden">
          <div class="absolute inset-0 bg-[var(--bg-main)] opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent to-[#ffffff]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="flex items-center gap-3 relative">
            <mat-icon class="text-[var(--text-muted)] text-[18px] group-hover:text-[var(--text-neutral)] transition-colors">description</mat-icon>
            <span class="text-[var(--text-muted)] font-montserrat font-bold text-xs group-hover:text-[var(--text-sec)] transition-colors">{{ site.content().terms.title }}</span>
          </div>
          <mat-icon class="text-[var(--text-dim)] text-[18px] group-hover:text-[var(--text-muted)] transition-colors relative">chevron_right</mat-icon>
        </button>
      } @else {
        <div class="fixed inset-0 z-[150] bg-[var(--bg-main)]">
          <!-- The close button stays outside the animated scroller: a transform
               on an ancestor would pin fixed children to the scrolling box. -->
          <button (click)="setActiveBox.emit(null)"
                  aria-label="Cerrar el panel de aviso legal"
                  class="absolute top-24 left-4 z-[200] w-12 h-12 rounded-full bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors shadow-lg">
            <mat-icon>close</mat-icon>
          </button>

          <div class="absolute inset-0 overflow-y-auto overscroll-contain touch-pan-y animate-slide-up">
          <div class="w-full max-w-md mx-auto px-4 pt-36 pb-10">
            <header class="mb-8 pr-2">
              <p class="text-[var(--text-dim)] font-montserrat text-[10px] uppercase tracking-[0.18em] mb-2">
                {{ site.identity().shortName }} · Legal
              </p>
              <h2 class="font-montserrat font-black text-2xl text-[var(--text-main)] drop-shadow-md">{{ site.content().terms.title }}</h2>
              <p class="text-[var(--text-muted)] text-sm leading-relaxed mt-4">{{ site.content().terms.intro }}</p>
            </header>

            <!-- Sticky stack: card i pins a little lower than card i-1, so the
                 next sheet overlaps the previous one while scrolling. -->
            <ol class="relative flex flex-col gap-4">
              @for (section of site.content().terms.sections; track section.heading; let i = $index) {
                <li class="sticky" [style.top.px]="stackTop(i)">
                  <article class="terms-sheet relative rounded-[1.75rem] border border-[var(--border-main)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden flex flex-col" [style.minHeight]="sheetMinHeight()">
                    <span aria-hidden="true"
                          class="pointer-events-none absolute -right-3 bottom-6 font-montserrat font-black leading-none text-[10rem] text-[var(--color-accent)] opacity-[0.06] select-none">
                      {{ i + 1 }}
                    </span>
                    <div class="relative flex items-center gap-3 px-6 py-4 border-b border-[var(--border-main)] bg-[var(--bg-surface)]">
                      <span class="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono font-bold text-[var(--color-accent)] bg-[var(--color-accent)]/12 border border-[var(--color-accent)]/25">
                        {{ i + 1 }}
                      </span>
                      <h3 class="text-[var(--text-main)] font-bold text-sm tracking-wide">{{ section.heading }}</h3>
                    </div>
                    <p class="relative px-6 pt-5 pb-4 text-[var(--text-neutral)] font-light text-[13.5px] leading-[1.85]">{{ section.body }}</p>
                    <div class="relative mt-auto px-6 pb-5 flex items-center justify-between text-[10px] font-mono text-[var(--text-dim)]">
                      <span class="uppercase tracking-[0.18em]">Sección {{ i + 1 }} / {{ site.content().terms.sections.length }}</span>
                      <span class="w-8 h-px bg-[var(--border-main)]"></span>
                    </div>
                  </article>
                </li>
              }
            </ol>

            <p class="mt-5 text-[var(--text-dim)] text-[11px] text-center">{{ site.content().terms.updated }}</p>
          </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class TermsSectionComponent {
  readonly site = inject(SiteService);

  activeBox = input<PanelId>(null);
  setActiveBox = output<PanelId>();

  /** Close button sits at 96–144 px; each sheet pins a header below the last. */
  stackTop(index: number): number {
    return 152 + index * 56;
  }

  /**
   * Tall enough for the deck to close cleanly, but never taller than the space
   * the last sheet can actually reach: the panel keeps 80 px of chrome below
   * the list (footer line plus padding), so a sheet can pin at most at
   * `100dvh - 80 - stackTop(last)`. On short phones the cards shrink instead
   * of piling up past their own headers.
   */
  readonly sheetMinHeight = computed(() => {
    const count = this.site.content().terms.sections.length;
    const chrome = 80 + this.stackTop(Math.max(count - 1, 0));
    return `min(50vh, calc(100dvh - ${chrome}px))`;
  });
}
