import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../shared/icon.component';
import { APP_COPY } from '../shared/copy';

/**
 * Intro screen. Swipe up (or tap the arrow) to enter the catalog.
 * The title is derived from `APP_COPY.appName`, one word per line.
 */
@Component({
  selector: 'app-hero-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <section
      class="absolute inset-0 w-full h-[100dvh] flex flex-col items-center justify-center overflow-hidden z-[50] transition-transform duration-1000 ease-in-out bg-[var(--bg-main)]"
      [class.-translate-y-full]="appMode() === 'catalog'"
      [attr.inert]="appMode() === 'catalog' ? '' : null"
      [attr.aria-hidden]="appMode() === 'catalog' ? 'true' : null"
      (touchstart)="heroTouchStart.emit($event)"
      (touchend)="heroTouchEnd.emit($event)">

      <!-- Wireframe background pattern -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(#ffffff 1px, transparent 1px); background-size: 20px 20px;"></div>

      <!-- Content -->
      <div class="relative z-10 flex flex-col items-center text-center px-6 mt-12">
        <div class="w-16 h-16 border-2 border-dashed border-[var(--border-light)] rounded-full flex items-center justify-center mb-6 bg-[var(--bg-surface)]/50">
          <mat-icon class="text-[var(--text-muted)] text-3xl">image</mat-icon>
        </div>
        <p class="text-[var(--text-dim)] font-montserrat tracking-wide text-[10px] mb-4 drop-shadow-md">{{ copy.tagline }}</p>
        <h1 class="font-montserrat font-black text-5xl md:text-7xl leading-tight tracking-tighter text-[var(--text-main)] mb-2 drop-shadow-md whitespace-pre-line">{{ title }}</h1>
        <p class="text-[var(--text-muted)] font-montserrat font-light text-lg md:text-xl tracking-wide">Catalog · Cart · Offline</p>
      </div>

      <!-- Enter button / swipe indicator -->
      <div class="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
        <p class="text-[var(--text-dim)] text-[10px] font-montserrat animate-pulse">Swipe up</p>
        <button (click)="enterCatalog.emit()"
                aria-label="Enter the catalog"
                class="group relative flex items-center justify-center w-16 h-16 bg-[var(--bg-surface)]/50 border border-[var(--border-light)] border-dashed rounded-full transition-all duration-700 hover:border-[var(--text-muted)] hover:scale-105 active:scale-95 shadow-lg">
          <mat-icon class="text-[var(--text-muted)] text-3xl transition-colors duration-500 -translate-y-1 group-hover:-translate-y-2 group-hover:text-[var(--text-main)]">keyboard_arrow_up</mat-icon>
        </button>
      </div>
    </section>
  `,
})
export class HeroSectionComponent {
  readonly copy = APP_COPY;
  /** One word per line, so long names still fit the hero. */
  readonly title = APP_COPY.appName.split(' ').join('\n');

  appMode = input<'intro' | 'catalog'>('intro');
  heroTouchStart = output<TouchEvent>();
  heroTouchEnd = output<TouchEvent>();
  enterCatalog = output<void>();
}
