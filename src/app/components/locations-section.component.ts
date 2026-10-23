import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../shared/icon.component';
import { LocationPanelId, PanelId } from '../models/panel';

interface StoreLocation {
  id: LocationPanelId;
  eyebrow: string;
  name: string;
  address: string;
  area: string;
  phone: string;
  hours: string;
}

/**
 * Branch / store directory.
 *
 * Four placeholder locations with the same card → detail pattern, driven by the
 * `locations` array: adding a fifth store is one object plus one id in
 * `models/panel.ts`.
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
          @for (location of locations; track location.id) {
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
      } @else {
        @for (location of locations; track location.id) {
          @if (activeBox() === location.id) {
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
                      <p class="text-[var(--text-sec)]">Monday - Sunday</p>
                      <p class="text-[var(--text-muted)] text-sm">{{ location.hours }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        }
      }
    </div>
  `,
})
export class LocationsSectionComponent {
  readonly locations: StoreLocation[] = [
    {
      id: 'location-1',
      eyebrow: 'Flagship',
      name: 'Downtown',
      address: '123 Main Street',
      area: 'Downtown area',
      phone: '+1 234 567 8900',
      hours: '09:00 - 22:00',
    },
    {
      id: 'location-2',
      eyebrow: 'Store',
      name: 'Riverside',
      address: '456 Oak Avenue',
      area: 'Westside',
      phone: '+1 987 654 3210',
      hours: '10:00 - 23:00',
    },
    {
      id: 'location-3',
      eyebrow: 'Store',
      name: 'Airport',
      address: 'Terminal 2, Gate B',
      area: 'Departures hall',
      phone: '+1 555 010 2030',
      hours: '05:00 - 23:30',
    },
    {
      id: 'location-4',
      eyebrow: 'Pop-up',
      name: 'Harbour',
      address: '8 Marina Walk',
      area: 'Seafront promenade',
      phone: '+1 555 040 5060',
      hours: '11:00 - 21:00',
    },
  ];

  activeBox = input<PanelId>(null);
  setActiveBox = output<PanelId>();

  /** True while one of the store details is open (keeps the layout stable). */
  detailOpen = computed(() =>
    this.locations.some((location) => location.id === this.activeBox()),
  );
}
