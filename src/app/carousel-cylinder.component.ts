import { Component, signal, computed, inject, ViewChild, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from './services/cart.service';
import { CatalogItem, CatalogCategory } from './models/catalog';
import { PanelId } from './models/panel';
import { CatalogService } from './services/catalog.service';
import { AuthService, Role } from './services/auth.service';
import { ProductModalComponent } from './components/product-modal.component';
import { CheckoutDrawerComponent } from './components/checkout-drawer.component';
import { SidebarMenuComponent } from './components/sidebar-menu.component';
import { LoginModalComponent } from './components/login-modal.component';
import { LocationsSectionComponent } from './components/locations-section.component';
import { TermsSectionComponent } from './components/terms-section.component';
import { HistorySectionComponent } from './components/history-section.component';
import { TopHeaderComponent } from './components/top-header.component';
import { HeroSectionComponent } from './components/hero-section.component';
import { Carousel3dComponent, DisplayCard } from './components/carousel-3d.component';
import { PwaUpdateService } from './services/pwa-update.service';
import { IconComponent } from './shared/icon.component';
import { formatPrice } from './shared/price';

@Component({
  selector: 'app-carousel-cylinder',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, ProductModalComponent, CheckoutDrawerComponent, SidebarMenuComponent, LoginModalComponent, LocationsSectionComponent, TermsSectionComponent, HistorySectionComponent, TopHeaderComponent, HeroSectionComponent, Carousel3dComponent],
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
               [class.pointer-events-none]="appMode() !== 'catalog'"
               [attr.inert]="appMode() !== 'catalog' ? '' : null"
               [attr.aria-hidden]="appMode() !== 'catalog' ? 'true' : null">
        
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
          
          <!-- About / special offer teaser -->
          @if (activeBox() === null || activeBox() === 'about') {
            <app-history-section
              [activeBox]="activeBox()"
              (setActiveBox)="activeBox.set($event)">
            </app-history-section>
          }

          <!-- CATALOG SECTION -->
          @if (activeBox() === null || activeBox() === 'catalog') {
            <!-- The carousel cards are the controls; selecting one also leaves
                 the compact home teaser layout for the full catalog view. -->
            <div id="system-section" class="relative w-full flex-1 flex flex-col items-center justify-center pointer-events-auto mb-6 touch-pan-y transition-all duration-500">

              <!-- Carousel Controls (Back Button) -->
              @if (activeBox() === 'catalog') {
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

      <!-- CatalogCategory Title (when in items view) -->
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
          <div class="min-w-full h-full flex-shrink-0 snap-center px-2 pt-28 pb-4 overflow-y-auto">
            <div class="grid grid-cols-2 gap-2 content-start pb-24">
              @for (item of page; track item.id) {
                <div class="bg-[var(--text-main)]/5 border border-[var(--border-main)] rounded-xl p-2 flex flex-col items-center cursor-pointer hover:bg-[var(--text-main)]/10 transition-colors active:scale-95 min-w-0"
                     role="button"
                     tabindex="0"
                     [attr.aria-label]="'Open ' + item.title"
                     (click)="onCardSelect(item)"
                     (keydown.enter)="onCardSelect(item)">
                  <div class="w-full aspect-square bg-[var(--bg-surface)] rounded-lg mb-2 overflow-hidden relative border border-[var(--border-main)]">
                     <img [src]="item.image" [alt]="item.title" class="absolute inset-0 w-full h-full object-cover opacity-50 grayscale">
                  </div>
                  <span class="text-xs font-bold text-center text-[var(--text-sec)] line-clamp-2 leading-tight w-full">{{item.title}}</span>
                  <span class="text-[10px] text-[var(--text-muted)] mt-1">{{item.price}}</span>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Footer Hint (in normal flow so it never sits on top of a card) -->
      @if (viewState() === 'categories') {
        <div class="relative w-full flex-none flex flex-col items-center z-[200] pointer-events-none pb-3 transition-opacity duration-500"
             [class.opacity-0]="isProductModalOpen()">
          <p class="text-[var(--text-dim)] text-[9px] font-montserrat flex items-center gap-3 mb-1 drop-shadow-md">
            <mat-icon class="text-[14px] !w-3.5 !h-3.5 animate-bounce">
              touch_app
            </mat-icon>
            Tap to view items
          </p>
          <div class="w-px h-5 bg-gradient-to-b from-[var(--text-dim)]/60 to-transparent"></div>
        </div>
      }
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
        <div class="absolute top-12 left-1/2 -translate-x-1/2 z-[2000] bg-[var(--border-main)] text-[var(--text-main)] px-6 py-3 rounded-full font-medium shadow-lg flex items-center gap-3 animate-fade-in pointer-events-none"
             role="status" aria-live="polite">
          <mat-icon>check_circle</mat-icon>
          <span>Added to cart</span>
        </div>
      }

      <!-- Floating Action Buttons -->
      <div class="absolute bottom-8 right-8 z-[500] flex flex-col gap-4">
        <!-- Cart Indicator -->
        @if (cartService.totalItems() > 0 && (activeBox() === null || activeBox() === 'catalog')) {
          <button (click)="showCheckout.set(true)"
                  aria-label="Open cart"
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

      <!-- Sidebar navigation -->
      @defer (when showSidebar()) {
        @if (showSidebar()) {
          <app-sidebar-menu
            (closeSidebar)="showSidebar.set(false)"
            (logout)="logout()"
            (openLoginModal)="openLoginModal()"
            (openPanel)="openPanel($event)">
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


      } <!-- Closes activeBox() === null || activeBox() === 'catalog' -->

      <!-- Service worker update prompt (only when a new build is waiting) -->
      @if (pwaUpdateService.updateReady()) {
        <div class="absolute top-12 left-1/2 -translate-x-1/2 z-[2100] bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-main)] pl-4 pr-2 py-2 rounded-full shadow-xl flex items-center gap-3 animate-fade-in pointer-events-auto">
          <mat-icon class="text-[18px] !w-5 !h-5 text-[var(--color-accent)]">system_update</mat-icon>
          <span class="text-xs font-medium">New version available</span>
          <button (click)="pwaUpdateService.applyUpdate()"
                  [disabled]="pwaUpdateService.applying()"
                  class="px-4 py-1.5 rounded-full bg-[var(--text-main)] text-[var(--bg-main)] text-xs font-bold disabled:opacity-50">
            Reload
          </button>
        </div>
      }

      <!-- Branch / store panels -->
      @if (activeBox() === null || activeBox() === 'location-1' || activeBox() === 'location-2' || activeBox() === 'location-3' || activeBox() === 'location-4') {
        <app-locations-section
          [activeBox]="activeBox()"
          (setActiveBox)="activeBox.set($event)">
        </app-locations-section>
      }

      <!-- Legal terms panel -->
      @if (activeBox() === null || activeBox() === 'terms') {
        <app-terms-section
          [activeBox]="activeBox()"
          (setActiveBox)="activeBox.set($event)">
        </app-terms-section>
      }

    </div> <!-- Closes flex-col relative content -->
    </div> <!-- Closes flex-1 scroll container -->

  </section> <!-- Closes catalog section -->
</div> <!-- Closes main container -->
  `
})
export class CarouselCylinderComponent {
  @ViewChild('carousel3d') carousel3d!: Carousel3dComponent;

  catalogService = inject(CatalogService);
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
  activeBox = signal<PanelId>(null);

  enterCatalog() {
    this.appMode.set('catalog');
  }

  viewState = signal<'categories' | 'items'>('categories');
  activeCategory = signal<CatalogCategory | null>(null);
  
  cartService = inject(CartService);
  authService = inject(AuthService);

  
  isTransitioning = signal(false);
  categoryProgress = signal(1);

  // Order Flow State
  showCheckout = signal(false);
  showSidebar = signal(false);
  showLoginModal = signal(false);
  isProductModalOpen = signal(false);
  selectedProduct = signal<CatalogItem | null>(null);
  showToast = signal(false);

  categoryCards = computed<DisplayCard[]>(() => {
    return this.catalogService.categories().map(c => ({
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
      price: formatPrice(item.price),
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
      // Transition to items view and leave the compact home teaser layout.
      this.activeBox.set('catalog');
      this.isTransitioning.set(true);
      if (this.carousel3d) {
        this.categoryProgress.set(this.carousel3d.progress());
      }
      
      // Play a subtle sound
      // Removed audio for wireframe
      
      setTimeout(() => {
        this.activeCategory.set(card.originalData as CatalogCategory);
        this.viewState.set('items');
        this.isTransitioning.set(false);
      }, 300); // Wait for fade out
      
    } else {
      // Item selected
      this.selectedProduct.set(card.originalData as CatalogItem);
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

  /** Opens a section from the sidebar and closes it in the same beat. */
  openPanel(panel: PanelId) {
    this.showSidebar.set(false);
    this.activeBox.set(panel);
  }

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
    // The drawer keeps its confirmation screen open until the visitor closes it
    // (button or Escape); only the cart is reset here.
    this.cartService.clearCart();
  }
}
