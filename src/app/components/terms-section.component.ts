import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelId } from '../models/panel';
import { IconComponent } from '../shared/icon.component';

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
            <span class="text-[var(--text-muted)] font-montserrat font-bold text-xs group-hover:text-[var(--text-sec)] transition-colors">Terms & Conditions</span>
          </div>
          <mat-icon class="text-[var(--text-dim)] text-[18px] group-hover:text-[var(--text-muted)] transition-colors relative">chevron_right</mat-icon>
        </button>
      } @else {
        <div class="fixed inset-0 z-[150] bg-[var(--bg-main)] overflow-y-auto pt-24 pb-12 px-4 animate-slide-up flex flex-col items-center">
          <button (click)="setActiveBox.emit(null)"
                  aria-label="Close the terms panel"
                  class="fixed top-24 left-4 z-[200] w-12 h-12 rounded-full bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors shadow-lg">
            <mat-icon>close</mat-icon>
          </button>
          <div class="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2.5rem] p-8 shadow-2xl mt-8">
            <h2 class="font-montserrat font-black text-2xl text-[var(--text-main)] mb-8 text-center drop-shadow-md">Terms & Conditions</h2>
            <div class="text-[var(--text-neutral)] leading-loose font-light space-y-6 text-sm text-left">
              <p>By using this application, you agree to the following terms and conditions:</p>
              <ul class="list-disc pl-5 space-y-2">
                <li>Condition 1 placeholder text.</li>
                <li>Condition 2 placeholder text.</li>
                <li>Condition 3 placeholder text.</li>
                <li>Condition 4 placeholder text.</li>
                <li>Condition 5 placeholder text.</li>
              </ul>
              <p class="mt-4 text-[var(--text-dim)] text-xs">Last updated: [date]</p>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class TermsSectionComponent {
  activeBox = input<PanelId>(null);
  setActiveBox = output<PanelId>();
}
