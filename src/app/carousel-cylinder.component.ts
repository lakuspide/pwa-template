import { Component, signal, computed, inject, ViewChild, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CartService, MenuItem } from './services/cart.service';
import { MenuService, Category } from './services/menu.service';
import { AuthService, Role } from './auth.service';
import { ProductModalComponent } from './components/product-modal.component';
import { CheckoutDrawerComponent } from './components/checkout-drawer.component';
import { SidebarMenuComponent } from './components/sidebar-menu.component';
import { LoginModalComponent } from './components/login-modal.component';
import { LocationsSectionComponent } from './components/locations-section.component';
import { TermsSectionComponent } from './components/terms-section.component';
import { HistorySectionComponent } from './components/history-section.component';
import { TopHeaderComponent } from './components/top-header.component';
import { HeroSectionComponent } from './components/hero-section.component';
import { ReservationSuccessModalComponent } from './components/reservation-success-modal.component';
import { Carousel3dComponent, DisplayCard } from './components/carousel-3d.component';
import { PwaUpdateService } from './services/pwa-update.service';

@Component({
  selector: 'app-carousel-cylinder',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, ProductModalComponent, CheckoutDrawerComponent, SidebarMenuComponent, LoginModalComponent, LocationsSectionComponent, TermsSectionComponent, HistorySectionComponent, TopHeaderComponent, HeroSectionComponent, ReservationSuccessModalComponent, Carousel3dComponent],
  template: `
    <div class="w-full min-h-screen bg-[var(--bg-main)] text-[var(--text-sec)] font-sans overflow-x-hidden relative">
      
      <!-- Fixed Background Image (Wireframe) -->
      <div class="fixed inset-0 w-full h-full z-0 pointer-events-none bg-[var(--bg-main)]">
        <div class="absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(#ffffff 1px, transparent 1px); background-size: 20px 20px;"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-[var(--bg-main)]/80 via-transparent to-[var(--bg-main)]/90"></div>
      </div>

      <!-- HERO SECTION -->
      <app-hero-section
        [appMode]="appMode()"
        (heroTouchStart)="onHeroTouchStart($event)"
        (heroTouchEnd)="onHeroTouchEnd($event)"
        (enterCatalog)="enterCatalog()">
      </app-hero-section>

      <!-- CATALOG SECTION (Compact Layout) -->
      <section class="absolute inset-0 w-full h-[100dvh] z-[40] transition-opacity duration-1000 flex flex-col"
               [class.opacity-0]="appMode() !== 'catalog'"
               [class.pointer-events-none]="appMode() !== 'catalog'">
        
        <!-- Sensory Glow -->
        <div class="catalog-glow absolute inset-0 pointer-events-none z-0"></div>
        
        <!-- FIXED TOP HEADER -->
        <div class="flex-none w-full pt-safe z-[200]">
          <app-top-header
            (resetView)="resetToHome()"
            (openSidebar)="showSidebar.set(true)">
          </app-top-header>
        </div>

        <!-- MAIN SCROLLABLE/FIXED CONTENT -->
        <div class="flex-1 w-full relative z-10 transition-all duration-500 scroll-smooth"
             [class.overflow-y-auto]="activeBox() === null"
             [class.overflow-hidden]="activeBox() !== null">
             
          <div class="w-full flex flex-col items-center pb-12 relative"
               [class.min-h-full]="activeBox() === null"
               [class.h-full]="activeBox() !== null">
          
          <!-- Oferta Especial Box -->
          @if (activeBox() === null || activeBox() === 'historia') {
            <app-history-section
              [activeBox]="activeBox()"
              (setActiveBox)="activeBox.set($event)">
            </app-history-section>
          }

          <!-- CAROUSEL SECTION -->
          @if (activeBox() === null || activeBox() === 'menu') {
            <div id="system-section" class="relative w-full flex-1 flex flex-col items-center justify-center pointer-events-auto mb-6 touch-pan-y transition-all duration-500"
                 (click)="activeBox() === null ? activeBox.set('menu') : null"
                 (keydown.enter)="activeBox() === null ? activeBox.set('menu') : null"
                 tabindex="0"
                 role="button">

              <!-- Carousel Controls (Back Button) -->
              @if (activeBox() === 'menu') {
                <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-[300] pointer-events-auto transition-all duration-500"
                     [class.opacity-0]="viewState() === 'categories'"
                     [class.pointer-events-none]="viewState() === 'categories'">
                  <!-- Back Button -->
                  <button (click)="goBack(); $event.stopPropagation()" 
                          class="flex items-center gap-2 bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-main)] px-8 py-4 rounded-full hover:bg-[var(--bg-hover)] transition-all text-[var(--text-main)] shadow-lg active:scale-95">
                    <mat-icon class="text-[var(--text-muted)]">arrow_back</mat-icon>
                    <span class="text-sm font-montserrat font-black text-[var(--text-muted)]">Back</span>
                  </button>
                </div>
              }

      <!-- Category Title (when in items view) -->
      <div class="absolute top-24 left-0 w-full flex flex-col items-center z-[200] pointer-events-none transition-all duration-500"
           [ngClass]="{'opacity-0 -translate-y-4': viewState() === 'categories'}">
        <mat-icon class="text-[var(--text-muted)] text-3xl mb-2 drop-shadow-md">{{ activeCategory()?.icon }}</mat-icon>
        <h1 class="font-montserrat font-black text-3xl text-[var(--text-main)] text-center leading-none drop-shadow-lg">
          {{ activeCategory()?.name }}
        </h1>
        <div class="mt-4 w-12 h-px bg-gradient-to-r from-transparent via-[var(--text-dim)] to-transparent"></div>
      </div>

      <!-- 3D Carousel Component (Only for Categories) -->
      <div [class.hidden]="viewState() !== 'categories'" class="w-full flex-1 flex flex-col items-center justify-center">
        @defer (on viewport) {
          <app-carousel-3d
            #carousel3d
            [cards]="categoryCards()"
            [viewState]="viewState()"
            [isTransitioning]="isTransitioning()"
            (cardSelected)="onCardSelect($event)"
            (dragged)="onCarouselDrag()">
          </app-carousel-3d>
        } @placeholder {
          <div class="w-full h-[400px] flex items-center justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--text-dim)]"></div>
          </div>
        }
      </div>

      <!-- Grid View for Items (P3.4) -->
      <div [class.hidden]="viewState() !== 'items'" class="w-full h-[60vh] flex overflow-x-auto snap-x snap-mandatory custom-scrollbar transition-opacity duration-300"
           [class.opacity-0]="isTransitioning()">
        @for (page of paginatedItems(); track $index) {
          <div class="min-w-full h-full flex-shrink-0 snap-center px-2 py-4 overflow-y-auto">
            <div class="grid grid-cols-2 gap-2 content-start pb-24">
              @for (item of page; track item.id) {
                <div class="bg-[var(--text-main)]/5 border border-[var(--border-main)] rounded-xl p-2 flex flex-col items-center cursor-pointer hover:bg-[var(--text-main)]/10 transition-colors active:scale-95 min-w-0"
                     (click)="onCardSelect(item)">
                  <div class="w-full aspect-square bg-[var(--bg-surface)] rounded-lg mb-2 overflow-hidden relative border border-[var(--border-main)]">
                     <img [src]="item.image" alt="Placeholder" class="absolute inset-0 w-full h-full object-cover opacity-50 grayscale">
                  </div>
                  <span class="text-xs font-bold text-center text-[var(--text-sec)] line-clamp-2 leading-tight w-full">{{item.title}}</span>
                  <span class="text-[10px] text-[var(--text-muted)] mt-1">{{item.price}}</span>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Footer Hint -->
      <div class="absolute bottom-8 left-0 w-full flex flex-col items-center z-[200] pointer-events-none transition-opacity duration-500"
           [class.opacity-0]="isProductModalOpen() || viewState() === 'items'">
        <p class="text-[var(--text-dim)] text-[9px] font-montserrat flex items-center gap-3 mb-2 drop-shadow-md">
          <mat-icon class="text-[14px] !w-3.5 !h-3.5 animate-bounce">
            touch_app
          </mat-icon>
          Tap to view items
        </p>
        <div class="w-px h-8 bg-gradient-to-b from-[var(--text-dim)]/60 to-transparent"></div>
      </div>
    </div> <!-- Closes system-section -->

      <!-- Product Detail Modal -->
      @defer (when isProductModalOpen()) {
        @if (isProductModalOpen() && selectedProduct()) {
          <app-product-modal 
            [product]="selectedProduct()" 
            (closeModal)="closeProductModal()"
            (addedToCart)="onAddedToCart()">
          </app-product-modal>
        }
      }

      <!-- Toast Notification -->
      @if (showToast()) {
        <div class="absolute top-12 left-1/2 -translate-x-1/2 z-[2000] bg-[var(--border-main)] text-[var(--text-main)] px-6 py-3 rounded-full font-medium shadow-lg flex items-center gap-3 animate-fade-in pointer-events-none">
          <mat-icon>check_circle</mat-icon>
          <span>Action Completed!</span>
        </div>
      }

      <!-- Floating Action Buttons -->
      <div class="absolute bottom-8 right-8 z-[500] flex flex-col gap-4">
        <!-- Cart Indicator -->
        @if (cartService.totalItems() > 0 && activeBox() === 'menu') {
          <button (click)="showCheckout.set(true)"
                  class="relative w-14 h-14 rounded-full bg-[var(--bg-hover)] border border-[var(--border-main)] flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--border-main)] transition-all shadow-xl pointer-events-auto group">
            <mat-icon class="text-[var(--text-muted)] group-hover:scale-110 transition-transform">shopping_cart</mat-icon>
            <span class="absolute -top-2 -right-2 bg-[var(--text-dim)] text-[var(--text-main)] text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-[var(--bg-main)]">
              {{ cartService.totalItems() }}
            </span>
          </button>
        }
      </div>

      <!-- Checkout Overlay (System Log) -->
      @defer (when showCheckout()) {
        @if (showCheckout()) {
          <app-checkout-drawer 
            (closeModal)="closeCheckout()"
            (requestLogin)="openLoginModal()"
            (orderConfirmed)="onOrderConfirmed()">
          </app-checkout-drawer>
        }
      }

      <!-- Sidebar Menu -->
      @defer (when showSidebar()) {
        @if (showSidebar()) {
          <app-sidebar-menu
            (closeSidebar)="showSidebar.set(false)"
            (logout)="logout()"
            (openLoginModal)="openLoginModal()">
          </app-sidebar-menu>
        }
      }

      <!-- Login Modal (Mock) -->
      @defer (when showLoginModal()) {
        @if (showLoginModal()) {
          <app-login-modal
            (closeModal)="showLoginModal.set(false)"
            (login)="mockLogin($event.email, $event.role)">
          </app-login-modal>
        }
      }

      <!-- RESERVATION SUCCESS MODAL -->
      @defer (when reservationSuccess()) {
        @if (reservationSuccess()) {
          <app-reservation-success-modal
            (closeModal)="reservationSuccess.set(false)">
          </app-reservation-success-modal>
        }
      }

      } <!-- Closes activeBox() === null || activeBox() === 'menu' -->

      <!-- Locations Section -->
      @if (activeBox() === null || activeBox() === 'alpha' || activeBox() === 'beta' || activeBox() === 'gamma' || activeBox() === 'delta') {
        <app-locations-section
          [activeBox]="activeBox()"
          (setActiveBox)="activeBox.set($event)">
        </app-locations-section>
      }

      <!-- Terms and Conditions Hook -->
      @if (activeBox() === null || activeBox() === 'terminos') {
        <app-terms-section
          [activeBox]="activeBox()"
          (setActiveBox)="activeBox.set($event)">
        </app-terms-section>
      }

    </div> <!-- Closes flex-col relative content -->
    </div> <!-- Closes flex-1 scroll container -->

  </section> <!-- Closes catalog section -->
</div> <!-- Closes main container -->
  `,
  styles: [`
    .perspective-\\[1200px\\] { perspective: 1200px; }
    .transform-style-3d { transform-style: preserve-3d; }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideInLeft {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
    .animate-slide-in-left {
      animation: slideInLeft 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    .animate-slide-up {
      animation: slideUp 0.45s cubic-bezier(0.32, 0.72, 0, 1) forwards;
    }

    /* Sensory Background Glow */
    .catalog-glow {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 150vw;
      height: 150vh;
      background: radial-gradient(circle at center, rgba(10, 132, 255, 0.05) 0%, transparent 60%);
      z-index: 1;
      pointer-events: none;
      animation: pulse-glow 10s ease-in-out infinite alternate;
    }

    @keyframes pulse-glow {
      from { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
    }
  `]
})
export class CarouselCylinderComponent {
  @ViewChild('carousel3d') carousel3d!: Carousel3dComponent;

  menuService = inject(MenuService);
  pwaUpdateService = inject(PwaUpdateService);

  heroTouchStartY = 0;
  onHeroTouchStart(e: TouchEvent) {
    this.heroTouchStartY = e.touches[0].clientY;
  }
  onHeroTouchEnd(e: TouchEvent) {
    const touchEndY = e.changedTouches[0].clientY;
    if (this.heroTouchStartY - touchEndY > 50) { // Swiped up
      this.enterCatalog();
    }
  }

  appMode = signal<'intro' | 'catalog'>('intro');
  activeBox = signal<'historia' | 'menu' | 'alpha' | 'beta' | 'gamma' | 'delta' | 'terminos' | null>(null);

  enterCatalog() {
    this.appMode.set('catalog');
  }

  viewState = signal<'categories' | 'items'>('categories');
  activeCategory = signal<Category | null>(null);
  
  cartService = inject(CartService);
  authService = inject(AuthService);
  
  Math = Math;
  
  isTransitioning = signal(false);
  categoryProgress = signal(1);

  // Order Flow State
  showCheckout = signal(false);
  showSidebar = signal(false);
  showLoginModal = signal(false);
  isProductModalOpen = signal(false);
  selectedProduct = signal<MenuItem | null>(null);
  showToast = signal(false);
  reservationSuccess = signal(false);

  scrollToSystem() {
    const el = document.getElementById('system-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  categoryCards = computed<DisplayCard[]>(() => {
    return this.menuService.categories().map(c => ({
      id: c.id,
      title: c.name,
      subtitle: c.subtitle,
      icon: c.icon,
      image: c.image,
      originalData: c
    }));
  });

  itemCards = computed<DisplayCard[]>(() => {
    const cat = this.activeCategory();
    if (!cat) return [];
    return cat.items.map(item => ({
      id: item.id,
      title: item.name,
      subtitle: item.description,
      price: item.price,
      image: item.image,
      originalData: item
    }));
  });

  paginatedItems = computed(() => {
    if (this.viewState() !== 'items') return [];
    return [this.itemCards()];
  });

  onCarouselDrag() {
    // Removed audio for wireframe
  }

  onCardSelect(card: DisplayCard) {
    if (this.viewState() === 'categories') {
      // Transition to items view
      this.isTransitioning.set(true);
      if (this.carousel3d) {
        this.categoryProgress.set(this.carousel3d.progress());
      }
      
      // Play a subtle sound
      // Removed audio for wireframe
      
      setTimeout(() => {
        this.activeCategory.set(card.originalData as Category);
        this.viewState.set('items');
        this.isTransitioning.set(false);
      }, 300); // Wait for fade out
      
    } else {
      // Item selected
      this.selectedProduct.set(card.originalData as MenuItem);
      this.isProductModalOpen.set(true);
    }
  }

  goBack() {
    if (this.isTransitioning() || this.isProductModalOpen()) return;
    
    this.isTransitioning.set(true);
    
    setTimeout(() => {
      this.viewState.set('categories');
      this.activeCategory.set(null);
      if (this.carousel3d) {
        this.carousel3d.setProgress(this.categoryProgress());
      }
      this.isTransitioning.set(false);
    }, 300);
  }

  // --- View Methods ---
  resetToHome() {
    this.closeProductModal();
    this.showCheckout.set(false);
    
    setTimeout(() => {
      this.activeBox.set(null);
      this.viewState.set('categories');
    }, 100);
  }

  // --- Auth Flow Methods ---
  
  openLoginModal() {
    this.showSidebar.set(false);
    this.showLoginModal.set(true);
  }
  
  mockLogin(email: string, role: Role) {
    this.authService.login(email, role);
    this.showLoginModal.set(false);
    this.showSidebar.set(true);
  }
  
  logout() {
    this.authService.logout();
    // Post-session memory cleanup
    this.cartService.clearCart();
    this.showCheckout.set(false);
    this.selectedProduct.set(null);
    this.activeBox.set(null);
    this.viewState.set('categories');
    this.showSidebar.set(false);
  }

  // --- Accessibility ---

  /**
   * Closes whichever overlay is currently topmost when the user presses
   * Escape, so every modal/drawer/sheet in the app is keyboard-dismissible
   * without each component needing its own listener.
   */
  @HostListener('document:keydown.escape')
  onEscapePressed() {
    if (this.isProductModalOpen()) {
      this.closeProductModal();
    } else if (this.showCheckout()) {
      this.showCheckout.set(false);
    } else if (this.showLoginModal()) {
      this.showLoginModal.set(false);
    } else if (this.showSidebar()) {
      this.showSidebar.set(false);
    } else if (this.activeBox()) {
      this.activeBox.set(null);
    }
  }

  // --- Order Flow Methods ---

  closeProductModal() {
    this.isProductModalOpen.set(false);
    setTimeout(() => {
      this.selectedProduct.set(null);
    }, 300); // wait for fade out animation
  }

  onAddedToCart() {
    this.showToast.set(true);
    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }

  closeCheckout() {
    this.showCheckout.set(false);
  }

  onOrderConfirmed() {
    this.cartService.clearCart();
    setTimeout(() => {
      this.showCheckout.set(false);
      this.showSidebar.set(true);
    }, 3000); // Close checkout after showing success for 3 seconds
  }
}
