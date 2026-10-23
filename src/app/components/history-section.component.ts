import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelId } from '../models/panel';
import { APP_COPY } from '../shared/copy';
import { IconComponent } from '../shared/icon.component';

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
          <span class="relative text-[var(--text-sec)] font-montserrat font-black text-xl mb-2">Special Offer</span>
          <span class="relative text-[var(--text-muted)] font-montserrat font-bold text-xs bg-[var(--bg-main)]/70 px-3 py-1 rounded-full border border-[var(--border-light)]">Promo details here</span>
        </button>
      } @else {
        <div class="fixed inset-0 z-[150] bg-[var(--bg-main)] overflow-y-auto pt-24 pb-12 px-4 animate-slide-up flex flex-col items-center">
          <button (click)="setActiveBox.emit(null)"
                  aria-label="Close the about panel"
                  class="fixed top-24 left-4 z-[200] w-12 h-12 rounded-full bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors shadow-lg">
            <mat-icon>close</mat-icon>
          </button>
          <div class="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2.5rem] p-8 shadow-2xl mt-8">
            <h2 class="font-montserrat font-black text-2xl text-[var(--text-main)] mb-8 text-center drop-shadow-md">About Us</h2>
            <div class="text-[var(--text-neutral)] leading-loose font-light space-y-6">
              <p class="italic text-xl text-[var(--text-muted)] mb-8 text-center border-b border-[var(--border-main)] pb-6">{{ copy.tagline }}</p>
              <p>This is a placeholder text for the history or about section. It can be replaced with any relevant information about the company, product, or service.</p>
              <p>More placeholder text to fill the space and demonstrate how multiple paragraphs will look in this layout.</p>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class HistorySectionComponent {
  readonly copy = APP_COPY;

  activeBox = input<PanelId>(null);
  setActiveBox = output<PanelId>();
}
