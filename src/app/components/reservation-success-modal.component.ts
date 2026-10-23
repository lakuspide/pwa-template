import { Component, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reservation-success-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
      <div class="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-3xl p-8 max-w-sm w-full text-center flex flex-col items-center gap-6 animate-fade-in shadow-[0_0_50px_rgba(10,132,255,0.15)]"
           role="alertdialog"
           aria-modal="true"
           aria-label="Confirmation">
        <div class="w-16 h-16 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
          <mat-icon class="text-[var(--color-accent)] text-3xl !w-8 !h-8 flex items-center justify-center">check_circle</mat-icon>
        </div>
        <div>
          <h3 class="font-montserrat font-black text-2xl text-[var(--text-main)] mb-2">[Confirmation Title]</h3>
          <p class="text-[var(--text-muted)] text-sm">[Confirmation message goes here].</p>
        </div>
        <button (click)="closeModal.emit()" class="w-full py-4 rounded-xl bg-[var(--bg-hover)] hover:bg-[var(--border-main)] text-[var(--text-main)] font-bold transition-colors">
          [Action Button]
        </button>
      </div>
    </div>
  `
})
export class ReservationSuccessModalComponent {
  closeModal = output<void>();
}
