import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { CatalogItem } from '../models/catalog';
import { SiteService } from '../services/site.service';
import { createParticleExplosion } from '../shared/particle-effect';
import { IconComponent } from '../shared/icon.component';
import { PricePipe } from '../shared/price.pipe';

/**
 * Item detail.
 *
 * Presets with `features.cart` get quantity controls and "Add to cart";
 * information-only presets (portfolio, services, property) get contact actions
 * instead. Prices are hidden when `features.prices` is off or the item has no
 * price.
 */
@Component({
  selector: 'app-product-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, PricePipe],
  template: `
    <div class="fixed inset-0 z-[1000] flex flex-col animate-fade-in pointer-events-auto"
         role="dialog"
         aria-modal="true"
         [attr.aria-label]="product()?.name ? 'Detalles del producto: ' + product()?.name : 'Detalles del producto'"
         (pointerdown)="$event.stopPropagation()"
         (pointermove)="$event.stopPropagation()"
         (pointerup)="$event.stopPropagation()">
      
      <!-- Full Screen Background Image -->
      <div class="absolute inset-0 w-full h-full bg-[var(--bg-main)]">
         <img [src]="product()?.image" alt="" class="absolute inset-0 w-full h-full object-cover opacity-40" referrerpolicy="no-referrer" />
         <!-- Gradient Overlay to make text readable -->
         <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/80 to-transparent"></div>
      </div>
      
      <!-- Details Area (Pushed to bottom) -->
      <div class="flex-1 flex flex-col justify-end p-4 relative z-20 animate-slide-up pb-6">
         <div class="bg-[var(--bg-surface)]/55 backdrop-blur-xl rounded-[24px] p-5 border border-[var(--border-main)] shadow-2xl">
          <div class="flex justify-between items-start mb-1 gap-2">
            <h2 class="font-montserrat font-black text-xl text-[var(--text-main)] leading-tight drop-shadow-lg">{{ product()?.name }}</h2>
            @if (showPrice()) {
              <span class="text-[var(--text-muted)] font-mono text-lg font-bold whitespace-nowrap drop-shadow-lg">
                {{ product()?.price | appPrice: site.identity().currency : site.identity().locale }}
              </span>
            }
          </div>
          
          <div class="w-8 h-1 bg-[var(--border-light)] rounded-full mb-3"></div>
          
          <p class="text-[var(--text-sec)] text-sm leading-snug mb-4 font-light drop-shadow-md line-clamp-3">
            {{ product()?.description }}
          </p>
          
          <!-- Order or contact controls -->
          <div class="mt-auto flex flex-col gap-3">
            @if (canOrder()) {
              <div class="flex items-center justify-between bg-[var(--bg-hover)]/50 rounded-xl p-3 border border-[var(--border-main)] backdrop-blur-md">
                <span class="text-[var(--text-sec)] font-medium text-sm drop-shadow-md">Cantidad</span>
                <div class="flex items-center gap-3">
                  <button (click)="decreaseQuantity()" 
                          class="w-10 h-10 rounded-full bg-[var(--border-main)] flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--border-light)] transition-colors active:scale-95 border border-[var(--border-light)] backdrop-blur-sm"
                          [class.opacity-50]="orderQuantity() <= 1"
                          [disabled]="orderQuantity() <= 1">
                    <mat-icon style="font-size: 20px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">remove</mat-icon>
                  </button>
                  <span class="text-[var(--text-main)] font-mono text-xl w-6 text-center font-bold drop-shadow-md">{{ orderQuantity() }}</span>
                  <button (click)="increaseQuantity()" 
                          class="w-10 h-10 rounded-full bg-[var(--border-main)] text-[var(--text-main)] flex items-center justify-center hover:bg-[var(--border-light)] transition-colors active:scale-95 border border-[var(--border-light)] backdrop-blur-sm">
                    <mat-icon style="font-size: 20px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">add</mat-icon>
                  </button>
                </div>
              </div>
              
              <button (click)="addToOrder($event)" 
                      class="w-full py-3.5 rounded-xl bg-[var(--text-main)] text-[var(--bg-main)] font-semibold text-sm hover:opacity-80 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 active:scale-[0.98]">
                <mat-icon style="font-size: 20px; width: 20px; height: 20px;">check_circle</mat-icon>
                Añadir al carrito
              </button>
            } @else {
              <div class="bg-[var(--bg-hover)]/50 rounded-xl p-4 border border-[var(--border-main)]">
                <p class="text-[var(--text-main)] font-semibold text-sm mb-1">Disponible bajo consulta</p>
                <p class="text-[var(--text-muted)] text-xs leading-relaxed">Consúltanos disponibilidad, precio o una visita.</p>
              </div>

              @if (emailHref() || phoneHref()) {
                <div class="grid grid-cols-2 gap-3">
                  @if (emailHref(); as href) {
                    <a [href]="href"
                       class="py-3 rounded-xl bg-[var(--text-main)] text-[var(--bg-main)] font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">mail</mat-icon>
                      Correo
                    </a>
                  }
                  @if (phoneHref(); as href) {
                    <a [href]="href"
                       class="py-3 rounded-xl bg-[var(--border-main)] text-[var(--text-main)] font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                      <mat-icon style="font-size: 18px; width: 18px; height: 18px;">call</mat-icon>
                      Llamar
                    </a>
                  }
                </div>
              }
            }

            <button (click)="closeModal.emit()"
                    class="w-full py-2 text-[var(--text-muted)] font-bold text-xs hover:text-[var(--text-main)] transition-colors drop-shadow-md">
              Volver a la lista
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProductModalComponent {
  cartService = inject(CartService);
  readonly site = inject(SiteService);

  product = input<CatalogItem | null>(null);

  closeModal = output<void>();
  addedToCart = output<void>();

  orderQuantity = signal(1);

  readonly showPrice = computed(
    () => this.site.features().prices && this.product()?.price != null,
  );
  readonly canOrder = computed(() => this.site.features().cart);
  readonly emailHref = computed(() => this.site.contactLink('email'));
  readonly phoneHref = computed(() => this.site.contactLink('phone'));

  increaseQuantity() {
    this.orderQuantity.update((q) => q + 1);
  }

  decreaseQuantity() {
    this.orderQuantity.update((q) => Math.max(1, q - 1));
  }

  addToOrder(event: MouseEvent) {
    event.stopPropagation();
    createParticleExplosion(event);

    const currentProduct = this.product();
    if (currentProduct) {
      this.cartService.addItem(currentProduct, this.orderQuantity());
    }

    this.addedToCart.emit();
    this.closeModal.emit();
  }
}
