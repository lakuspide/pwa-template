import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelId } from '../models/panel';
import { SiteService } from '../services/site.service';
import { IconComponent } from '../shared/icon.component';

/**
 * Store / office directory.
 *
 * The list comes from the active preset, so a project can ship one studio, four
 * shops or no directory at all (`features.locations = false` hides this
 * component in the shell).
 */
@Component({
  selector: 'app-locations-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="w-full max-w-md mt-8 px-4 transition-all duration-500" [class.flex-1]="detailOpen()">
      @if (activeBox() === null) {
        <div class="grid grid-cols-2 gap-4">
          @for (location of locations(); track location.id) {
            <div (click)="setActiveBox.emit(location.id)"
                 (keydown.enter)="setActiveBox.emit(location.id)"
                 tabindex="0"
                 role="button"
                 [attr.aria-label]="'Open ' + location.name"
                 class="bg-[var(--bg-surface)]/60 border border-[var(--border-main)] rounded-2xl p-4 backdrop-blur-md hover:bg-[var(--bg-hover)] transition-all cursor-pointer group flex flex-col items-center text-center shadow-lg relative overflow-hidden">
              <div class="absolute inset-0 bg-[var(--bg-main)] opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div class="absolute inset-0 bg-gradient-to-b from-transparent to-[#ffffff]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span class="relative text-[var(--text-muted)] font-montserrat font-bold text-[10px] mb-1">{{ location.eyebrow }}</span>
              <span class="relative text-[var(--text-main)] font-montserrat font-black text-sm group-hover:text-[var(--text-sec)] transition-colors">{{ location.name }}</span>
            </div>
          }
        </div>
      } @else if (selectedLocation(); as location) {
        <div class="fixed inset-0 z-[150] bg-[var(--bg-main)] overflow-y-auto pt-24 pb-12 px-4 animate-slide-up flex flex-col items-center">
          <button (click)="setActiveBox.emit(null)"
                  [attr.aria-label]="'Close ' + location.name"
                  class="fixed top-24 left-4 z-[200] w-12 h-12 rounded-full bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors shadow-lg">
            <mat-icon>close</mat-icon>
          </button>
          <div class="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2.5rem] p-8 shadow-2xl mt-8">
            <h2 class="font-montserrat font-black text-2xl text-[var(--text-main)] mb-8 text-center">{{ location.name }}</h2>
            <div class="flex flex-col gap-4 text-left">
              <div class="flex items-center gap-4 p-4 bg-[var(--bg-surface)]/50 rounded-2xl border border-[var(--border-light)]">
                <mat-icon class="text-[var(--text-muted)]">location_on</mat-icon>
                <div>
                  <p class="text-[var(--text-sec)] font-bold">{{ location.address }}</p>
                  <p class="text-[var(--text-muted)] text-sm">{{ location.area }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4 p-4 bg-[var(--bg-surface)]/50 rounded-2xl border border-[var(--border-light)]">
                <mat-icon class="text-[var(--text-muted)]">phone</mat-icon>
                <p class="text-[var(--text-sec)]">{{ location.phone }}</p>
              </div>
              <div class="flex items-center gap-4 p-4 bg-[var(--bg-surface)]/50 rounded-2xl border border-[var(--border-light)]">
                <mat-icon class="text-[var(--text-muted)]">schedule</mat-icon>
                <div>
                  <p class="text-[var(--text-sec)]">{{ location.hoursLabel ?? 'Opening hours' }}</p>
                  <p class="text-[var(--text-muted)] text-sm">{{ location.hours }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class LocationsSectionComponent {
  readonly site = inject(SiteService);

  activeBox = input<PanelId>(null);
  setActiveBox = output<PanelId>();

  readonly locations = computed(() => this.site.content().locations);
  readonly selectedLocation = computed(() =>
    this.locations().find((location) => location.id === this.activeBox()),
  );

  /** True while one of the store details is open (keeps the layout stable). */
  readonly detailOpen = computed(() => this.selectedLocation() !== undefined);
}
