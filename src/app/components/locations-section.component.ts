import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-locations-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="w-full max-w-md mt-8 px-4 transition-all duration-500" [class.flex-1]="activeBox() === 'alpha' || activeBox() === 'beta' || activeBox() === 'gamma' || activeBox() === 'delta'">
      @if (activeBox() === null) {
        <div class="grid grid-cols-2 gap-4">
          <!-- Location 1 -->
          <div (click)="setActiveBox.emit('alpha')" 
               (keydown.enter)="setActiveBox.emit('alpha')"
               tabindex="0"
               role="button"
               class="bg-[var(--bg-surface)]/60 border border-[var(--border-main)] rounded-2xl p-4 backdrop-blur-md hover:bg-[var(--bg-hover)] transition-all cursor-pointer group flex flex-col items-center text-center shadow-lg relative overflow-hidden">
            <div class="absolute inset-0 bg-[var(--bg-main)] opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div class="absolute inset-0 bg-gradient-to-b from-transparent to-[#ffffff]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span class="relative text-[var(--text-muted)] font-montserrat font-bold text-[10px] mb-1">Server Main</span>
            <span class="relative text-[var(--text-main)] font-montserrat font-black text-sm group-hover:text-[var(--text-sec)] transition-colors">Alpha Core</span>
          </div>
          <!-- Location 2 -->
          <div (click)="setActiveBox.emit('beta')" 
               (keydown.enter)="setActiveBox.emit('beta')"
               tabindex="0"
               role="button"
               class="bg-[var(--bg-surface)]/60 border border-[var(--border-main)] rounded-2xl p-4 backdrop-blur-md hover:bg-[var(--bg-hover)] transition-all cursor-pointer group flex flex-col items-center text-center shadow-lg relative overflow-hidden">
            <div class="absolute inset-0 bg-[var(--bg-main)] opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div class="absolute inset-0 bg-gradient-to-b from-transparent to-[#ffffff]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span class="relative text-[var(--text-muted)] font-montserrat font-bold text-[10px] mb-1">Backup Node</span>
            <span class="relative text-[var(--text-main)] font-montserrat font-black text-sm group-hover:text-[var(--text-sec)] transition-colors">Beta Sync</span>
          </div>
          <!-- Location 3 -->
          <div (click)="setActiveBox.emit('gamma')" 
               (keydown.enter)="setActiveBox.emit('gamma')"
               tabindex="0"
               role="button"
               class="bg-[var(--bg-surface)]/60 border border-[var(--border-main)] rounded-2xl p-4 backdrop-blur-md hover:bg-[var(--bg-hover)] transition-all cursor-pointer group flex flex-col items-center text-center shadow-lg relative overflow-hidden">
            <div class="absolute inset-0 bg-[var(--bg-main)] opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div class="absolute inset-0 bg-gradient-to-b from-transparent to-[#ffffff]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span class="relative text-[var(--text-muted)] font-montserrat font-bold text-[10px] mb-1">Edge Network</span>
            <span class="relative text-[var(--text-main)] font-montserrat font-black text-sm group-hover:text-[var(--text-sec)] transition-colors">Gamma Hub</span>
          </div>
          <!-- Location 4 -->
          <div (click)="setActiveBox.emit('delta')" 
               (keydown.enter)="setActiveBox.emit('delta')"
               tabindex="0"
               role="button"
               class="bg-[var(--bg-surface)]/60 border border-[var(--border-main)] rounded-2xl p-4 backdrop-blur-md hover:bg-[var(--bg-hover)] transition-all cursor-pointer group flex flex-col items-center text-center shadow-lg relative overflow-hidden">
            <div class="absolute inset-0 bg-[var(--bg-main)] opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div class="absolute inset-0 bg-gradient-to-b from-transparent to-[#ffffff]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span class="relative text-[var(--text-muted)] font-montserrat font-bold text-[10px] mb-1">Data Lake</span>
            <span class="relative text-[var(--text-main)] font-montserrat font-black text-sm group-hover:text-[var(--text-sec)] transition-colors">Delta Base</span>
          </div>
        </div>
      } @else if (activeBox() === 'alpha') {
        <div class="fixed inset-0 z-[150] bg-[var(--bg-main)] overflow-y-auto pt-24 pb-12 px-4 animate-slide-up flex flex-col items-center">
          <div class="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2.5rem] p-8 shadow-2xl mt-8">
            <h2 class="font-montserrat font-black text-2xl text-[var(--text-main)] mb-8 text-center">City One</h2>
            <div class="flex flex-col gap-4 text-left">
              <div class="flex items-center gap-4 p-4 bg-[var(--bg-surface)]/50 rounded-2xl border border-[var(--border-light)]">
                <mat-icon class="text-[var(--text-muted)]">location_on</mat-icon>
                <div>
                  <p class="text-[var(--text-sec)] font-bold">123 Main Street</p>
                  <p class="text-[var(--text-muted)] text-sm">Downtown Area, City One</p>
                </div>
              </div>
              <div class="flex items-center gap-4 p-4 bg-[var(--bg-surface)]/50 rounded-2xl border border-[var(--border-light)]">
                <mat-icon class="text-[var(--text-muted)]">phone</mat-icon>
                <p class="text-[var(--text-sec)]">+1 234 567 8900</p>
              </div>
              <div class="flex items-center gap-4 p-4 bg-[var(--bg-surface)]/50 rounded-2xl border border-[var(--border-light)]">
                <mat-icon class="text-[var(--text-muted)]">schedule</mat-icon>
                <div>
                  <p class="text-[var(--text-sec)]">Monday - Sunday</p>
                  <p class="text-[var(--text-muted)] text-sm">09:00 AM - 10:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else if (activeBox() === 'beta') {
        <div class="fixed inset-0 z-[150] bg-[var(--bg-main)] overflow-y-auto pt-24 pb-12 px-4 animate-slide-up flex flex-col items-center">
          <div class="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2.5rem] p-8 shadow-2xl mt-8">
            <h2 class="font-montserrat font-black text-2xl text-[var(--text-main)] mb-8 text-center">City Two</h2>
            <div class="flex flex-col gap-4 text-left">
              <div class="flex items-center gap-4 p-4 bg-[var(--bg-surface)]/50 rounded-2xl border border-[var(--border-light)]">
                <mat-icon class="text-[var(--text-muted)]">location_on</mat-icon>
                <div>
                  <p class="text-[var(--text-sec)] font-bold">456 Oak Avenue</p>
                  <p class="text-[var(--text-muted)] text-sm">Westside, City Two</p>
                </div>
              </div>
              <div class="flex items-center gap-4 p-4 bg-[var(--bg-surface)]/50 rounded-2xl border border-[var(--border-light)]">
                <mat-icon class="text-[var(--text-muted)]">phone</mat-icon>
                <p class="text-[var(--text-sec)]">+1 987 654 3210</p>
              </div>
              <div class="flex items-center gap-4 p-4 bg-[var(--bg-surface)]/50 rounded-2xl border border-[var(--border-light)]">
                <mat-icon class="text-[var(--text-muted)]">schedule</mat-icon>
                <div>
                  <p class="text-[var(--text-sec)]">Monday - Sunday</p>
                  <p class="text-[var(--text-muted)] text-sm">10:00 AM - 11:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else if (activeBox() === 'gamma') {
        <div class="fixed inset-0 z-[150] bg-[var(--bg-main)] overflow-y-auto pt-24 pb-12 px-4 animate-slide-up flex flex-col items-center">
          <div class="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2.5rem] p-8 shadow-2xl mt-8">
            <h2 class="font-montserrat font-black text-2xl text-[var(--text-main)] mb-8 text-center">Edge Network</h2>
            <div class="flex flex-col gap-4 text-left">
              <div class="flex items-center gap-4 p-4 bg-[var(--bg-surface)]/50 rounded-2xl border border-[var(--border-light)]">
                <mat-icon class="text-[var(--text-muted)]">router</mat-icon>
                <div>
                  <p class="text-[var(--text-sec)] font-bold">Node Gamma-01</p>
                  <p class="text-[var(--text-muted)] text-sm">Low Latency Zone</p>
                </div>
              </div>
              <div class="flex items-center gap-4 p-4 bg-[var(--bg-surface)]/50 rounded-2xl border border-[var(--border-light)]">
                <mat-icon class="text-[var(--text-muted)]">speed</mat-icon>
                <p class="text-[var(--text-sec)]">10ms Ping / 100Gbps</p>
              </div>
            </div>
          </div>
        </div>
      } @else if (activeBox() === 'delta') {
        <div class="fixed inset-0 z-[150] bg-[var(--bg-main)] overflow-y-auto pt-24 pb-12 px-4 animate-slide-up flex flex-col items-center">
          <div class="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2.5rem] p-8 shadow-2xl mt-8">
            <h2 class="font-montserrat font-black text-2xl text-[var(--text-main)] mb-8 text-center">Data Lake</h2>
            <div class="flex flex-col gap-4 text-left">
              <div class="flex items-center gap-4 p-4 bg-[var(--bg-surface)]/50 rounded-2xl border border-[var(--border-light)]">
                <mat-icon class="text-[var(--text-muted)]">dns</mat-icon>
                <div>
                  <p class="text-[var(--text-sec)] font-bold">Storage Cluster Delta</p>
                  <p class="text-[var(--text-muted)] text-sm">Cold Storage & Analytics</p>
                </div>
              </div>
              <div class="flex items-center gap-4 p-4 bg-[var(--bg-surface)]/50 rounded-2xl border border-[var(--border-light)]">
                <mat-icon class="text-[var(--text-muted)]">storage</mat-icon>
                <p class="text-[var(--text-sec)]">Exabyte Scale Ready</p>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class LocationsSectionComponent {
  activeBox = input<'historia' | 'menu' | 'alpha' | 'beta' | 'gamma' | 'delta' | 'terminos' | null>(null);
  setActiveBox = output<'alpha' | 'beta' | 'gamma' | 'delta'>();
}
