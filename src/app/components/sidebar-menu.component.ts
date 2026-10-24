import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../shared/icon.component';
import { SiteService } from '../services/site.service';
import { AuthService } from '../services/auth.service';
import { PanelId } from '../models/panel';

/**
 * Slide-in navigation.
 *
 * The role-gated groups are demo content: they show how the same shell can grow
 * staff and admin areas. Every entry below emits `openPanel`, so sections stay
 * owned by the shell instead of being hard-coded here.
 */
@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="absolute inset-0 z-[2000] flex">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
           (click)="closeSidebar.emit()"
           (keydown.enter)="closeSidebar.emit()"
           role="button"
           tabindex="0"
           aria-label="Close navigation"></div>

      <!-- Sidebar content -->
      <div class="relative w-80 max-w-[80vw] h-full bg-[var(--bg-surface)] border-r border-[var(--border-main)] shadow-2xl flex flex-col animate-slide-in-left"
           role="dialog"
           aria-modal="true"
           aria-label="Navigation">
        <div class="p-6 flex justify-between items-center border-b border-[var(--border-main)]">
          <div class="flex items-center gap-2">
            <mat-icon class="text-[var(--text-muted)]">menu</mat-icon>
            <span class="font-montserrat font-black text-xl text-[var(--text-main)]">Navigation</span>
          </div>
          <button (click)="closeSidebar.emit()" aria-label="Close navigation" class="text-[var(--text-main)]/60 hover:text-[var(--text-main)] transition-colors">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto touch-pan-y p-6 flex flex-col gap-8 custom-scrollbar">
          <!-- User profile or sign-in call to action (only when auth is enabled) -->
          @if (site.features().auth) {
          @if (authService.currentUser()) {
            <div class="bg-[var(--text-main)]/5 rounded-2xl p-5 border border-[var(--border-main)]">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-blue-600 flex items-center justify-center text-white font-semibold text-xl uppercase">
                  {{ authService.currentUser()?.name?.charAt(0) }}
                </div>
                <div>
                  <h3 class="text-[var(--text-main)] font-bold">{{ authService.currentUser()?.name }}</h3>
                  <p class="text-[var(--color-accent)] text-xs capitalize">{{ authService.currentUser()?.role }}</p>
                </div>
              </div>

              @if (authService.currentUser()?.role === 'user') {
                <div class="flex items-center justify-between bg-black/50 rounded-xl p-3 border border-[var(--border-main)]">
                  <span class="text-[var(--text-main)]/60 text-sm">Points</span>
                  <span class="text-[var(--text-muted)] font-mono font-bold">{{ authService.currentUser()?.points }} pts</span>
                </div>
              }

              <button (click)="logout.emit()" class="w-full mt-4 py-2 rounded-xl border border-[var(--border-main)] text-[var(--text-main)]/60 hover:text-[var(--text-main)] hover:bg-[var(--text-main)]/5 transition-colors text-sm font-bold">
                Log out
              </button>
            </div>
          } @else {
            <div class="bg-gradient-to-br from-[var(--border-main)]/10 to-transparent rounded-2xl p-6 border border-[var(--border-main)]/20 text-center">
              <mat-icon class="text-[var(--text-muted)] text-4xl mb-3">stars</mat-icon>
              <h3 class="text-[var(--text-main)] font-bold mb-2">Join us</h3>
              <p class="text-[var(--text-dim)] text-sm mb-4">Sign in to keep your cart and unlock account features.</p>
              <button (click)="openLoginModal.emit()" class="w-full py-3 rounded-xl bg-[var(--border-light)] text-[var(--text-main)] font-bold hover:bg-[var(--text-dim)] transition-colors shadow-lg">
                Sign in
              </button>
            </div>
          }

          <!-- Role-specific entries (demo) -->
          <nav class="flex flex-col gap-2">
            @if (authService.currentUser()?.role === 'user') {
              <div class="mb-2">
                <h4 class="text-[var(--text-dim)] text-xs font-bold mb-2 px-4">My account</h4>
                <a href="#" class="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors">
                  <mat-icon class="text-[var(--text-dim)]">settings</mat-icon>
                  <span class="font-medium">Preferences</span>
                </a>
                <a href="#" class="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors">
                  <mat-icon class="text-[var(--text-dim)]">history</mat-icon>
                  <span class="font-medium">Order history</span>
                </a>
              </div>
            }

            @if (authService.currentUser()?.role === 'operator' || authService.currentUser()?.role === 'admin') {
              <div class="mb-2">
                <h4 class="text-[var(--text-dim)] text-xs font-bold mb-2 px-4">Operations</h4>
                <a href="#" class="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--text-sec)] hover:bg-[var(--bg-hover)] transition-colors">
                  <mat-icon>dashboard</mat-icon>
                  <span class="font-bold">Order queue</span>
                </a>
                <a href="#" class="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors">
                  <mat-icon class="text-[var(--text-dim)]">inventory_2</mat-icon>
                  <span class="font-medium">Inventory</span>
                </a>
                <a href="#" class="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--text-main)]/80 hover:text-[var(--text-main)] hover:bg-[var(--text-main)]/5 transition-colors">
                  <mat-icon class="text-[#ff9500]">warning</mat-icon>
                  <span class="font-medium">Incidents</span>
                </a>
              </div>
            }

            @if (authService.currentUser()?.role === 'manager' || authService.currentUser()?.role === 'admin') {
              <div class="mb-2">
                <h4 class="text-[var(--text-dim)] text-xs font-bold mb-2 px-4">Management</h4>
                <a href="#" class="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--text-sec)] hover:bg-[var(--bg-hover)] transition-colors">
                  <mat-icon>manage_accounts</mat-icon>
                  <span class="font-bold">Team access</span>
                </a>
                <a href="#" class="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors">
                  <mat-icon class="text-[var(--text-dim)]">fact_check</mat-icon>
                  <span class="font-medium">Reports</span>
                </a>
              </div>
            }

            @if (authService.currentUser()?.role === 'admin') {
              <div class="mb-2">
                <h4 class="text-[var(--text-dim)] text-xs font-bold mb-2 px-4">System</h4>
                <a href="#" class="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--text-sec)] hover:bg-[var(--bg-hover)] transition-colors">
                  <mat-icon>dns</mat-icon>
                  <span class="font-bold">Integrations</span>
                </a>
                <a href="#" class="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors">
                  <mat-icon class="text-[var(--text-dim)]">settings_applications</mat-icon>
                  <span class="font-medium">App settings</span>
                </a>
              </div>
            }
          </nav>
          }
        </div>

        <!-- Common links -->
        <div class="p-6 border-t border-[var(--border-main)] flex flex-col gap-3">
          <button (click)="openPanel.emit('catalog')" class="text-left text-[var(--text-dim)] hover:text-[var(--text-sec)] text-sm transition-colors flex items-center gap-3">
            <mat-icon class="text-[18px]">storefront</mat-icon> Catalog
          </button>
          @if (site.features().about) {
            <button (click)="openPanel.emit('about')" class="text-left text-[var(--text-dim)] hover:text-[var(--text-sec)] text-sm transition-colors flex items-center gap-3">
              <mat-icon class="text-[18px]">info</mat-icon> About us
            </button>
          }
          @if (site.features().locations && site.content().locations.length > 0) {
            <button (click)="openPanel.emit(null)" class="text-left text-[var(--text-dim)] hover:text-[var(--text-sec)] text-sm transition-colors flex items-center gap-3">
              <mat-icon class="text-[18px]">contact_support</mat-icon> Stores & contact
            </button>
          }
          @if (site.features().terms) {
            <button (click)="openPanel.emit('terms')" class="text-left text-[var(--text-dim)] hover:text-[var(--text-sec)] text-sm transition-colors flex items-center gap-3">
              <mat-icon class="text-[18px]">gavel</mat-icon> Legal terms
            </button>
          }
          <p class="text-[var(--text-dim)] text-xs mt-4">{{ site.identity().appName }} v{{ site.identity().version }}</p>
        </div>
      </div>
    </div>
  `,
})
export class SidebarMenuComponent {
  readonly site = inject(SiteService);
  readonly authService = inject(AuthService);

  closeSidebar = output<void>();
  logout = output<void>();
  openLoginModal = output<void>();
  /** Ask the shell to open one of its sections. */
  openPanel = output<PanelId>();
}
