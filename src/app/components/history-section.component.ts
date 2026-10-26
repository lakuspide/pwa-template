import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelId } from '../models/panel';
import { SiteService } from '../services/site.service';
import { IconComponent } from '../shared/icon.component';

/**
 * About / promo section.
 *
 * The home card shows the active promo when the preset enables one, otherwise
 * it falls back to the about title. Both open the same panel, which also carries
 * the contact details used by information-only presets.
 */
@Component({
  selector: 'app-history-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="w-full max-w-md px-4 mb-6 mt-4 transition-all duration-500" [class.flex-1]="activeBox() === 'about'">
      @if (activeBox() === null) {
        <button (click)="setActiveBox.emit('about')" class="w-full bg-[var(--bg-hover)]/60 border border-[var(--border-main)] rounded-2xl p-6 backdrop-blur-md hover:bg-[var(--border-main)] transition-all flex flex-col items-center justify-center pointer-events-auto shadow-lg relative overflow-hidden group">
          <div class="absolute inset-0 bg-[var(--bg-surface)] opacity-40 group-hover:opacity-50 transition-opacity"></div>
          <div class="absolute inset-0 bg-gradient-to-b from-transparent to-[#ffffff]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span class="relative text-[var(--text-sec)] font-montserrat font-black text-xl mb-2 text-center">
            {{ promoEnabled() ? site.content().promo.label : site.content().about.title }}
          </span>
          <span class="relative text-[var(--text-muted)] font-montserrat font-bold text-xs bg-[var(--bg-main)]/70 px-3 py-1 rounded-full border border-[var(--border-light)] text-center">
            {{ promoEnabled() ? site.content().promo.detail : site.content().about.lead }}
          </span>
        </button>
      } @else {
        <div class="fixed inset-0 z-[150] bg-[var(--bg-main)] overflow-y-auto pt-24 pb-12 px-4 animate-slide-up flex flex-col items-center">
          <button (click)="setActiveBox.emit(null)"
                  aria-label="Cerrar el panel de información"
                  class="fixed top-24 left-4 z-[200] w-12 h-12 rounded-full bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors shadow-lg">
            <mat-icon>close</mat-icon>
          </button>
          <div class="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2.5rem] p-8 shadow-2xl mt-8">
            <h2 class="font-montserrat font-black text-2xl text-[var(--text-main)] mb-8 text-center drop-shadow-md">{{ site.content().about.title }}</h2>
            <div class="text-[var(--text-neutral)] leading-loose font-light space-y-6">
              <p class="italic text-xl text-[var(--text-muted)] mb-8 text-center border-b border-[var(--border-main)] pb-6">{{ site.content().about.lead }}</p>
              @for (paragraph of site.content().about.paragraphs; track $index) {
                <p>{{ paragraph }}</p>
              }

              @if (promoEnabled()) {
                <div class="bg-[var(--bg-hover)]/60 border border-[var(--border-main)] rounded-2xl p-5 text-center">
                  <p class="text-[var(--text-main)] font-bold text-sm mb-1">{{ site.content().promo.label }}</p>
                  <p class="text-[var(--text-muted)] text-xs">{{ site.content().promo.detail }}</p>
                </div>
              }

              @if (emailHref() || phoneHref()) {
                <div class="pt-6 border-t border-[var(--border-main)] flex flex-col gap-3">
                  @if (emailHref(); as href) {
                    <a [href]="href" class="flex items-center gap-3 text-[var(--text-sec)] hover:text-[var(--text-main)] transition-colors text-sm">
                      <mat-icon class="text-[18px]">mail</mat-icon>
                      {{ site.content().contact.email }}
                    </a>
                  }
                  @if (phoneHref(); as href) {
                    <a [href]="href" class="flex items-center gap-3 text-[var(--text-sec)] hover:text-[var(--text-main)] transition-colors text-sm">
                      <mat-icon class="text-[18px]">phone</mat-icon>
                      {{ site.content().contact.phone }}
                    </a>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class HistorySectionComponent {
  readonly site = inject(SiteService);

  readonly promoEnabled = computed(() => this.site.features().promo);
  readonly emailHref = computed(() => this.site.contactLink('email'));
  readonly phoneHref = computed(() => this.site.contactLink('phone'));

  activeBox = input<PanelId>(null);
  setActiveBox = output<PanelId>();
}
