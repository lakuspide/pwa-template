import { Component, inject, signal, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/catalog';
import { AuthService } from '../services/auth.service';
import { createParticleExplosion } from '../shared/particle-effect';
import { IconComponent } from '../shared/icon.component';
import { PricePipe } from '../shared/price.pipe';
import { OrderService } from '../services/order.service';
import { SiteService } from '../services/site.service';

@Component({
  selector: 'app-checkout-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, PricePipe],
  template: `
    <div class="fixed inset-0 z-[2000] flex flex-col bg-[var(--bg-main)]/90 backdrop-blur-xl animate-fade-in pointer-events-auto"
         role="dialog"
         aria-modal="true"
         aria-label="Resumen y pedido"
         (pointerdown)="$event.stopPropagation()"
         (pointermove)="$event.stopPropagation()"
         (pointerup)="$event.stopPropagation()">
      
      <div class="flex-1 w-full max-w-2xl mx-auto p-8 flex flex-col h-full relative">
        
        @if (!orderSuccess()) {
          <div class="flex justify-between items-center mb-8">
            <h2 class="font-montserrat font-black text-3xl text-[var(--text-main)]">Resumen</h2>
            <button (click)="closeModal.emit()" class="w-12 h-12 rounded-full bg-[var(--text-main)]/5 flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--text-main)]/20 transition-colors" [disabled]="isConfirming()">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto touch-pan-y custom-scrollbar pr-4 space-y-6 transition-opacity duration-300" [class.opacity-30]="isConfirming()">
            @if (cartService.items().length === 0) {
              <div class="h-full flex flex-col items-center justify-center text-[var(--text-main)]/40">
                <mat-icon class="text-6xl mb-4 opacity-50">remove_shopping_cart</mat-icon>
                <p class="font-montserrat text-lg">Tu lista está vacía.</p>
              </div>
            } @else {
              @for (item of cartService.items(); track item.id) {
                <div class="relative flex items-center p-4 rounded-2xl border border-[var(--border-main)] overflow-hidden min-h-[120px]">
                  <!-- Background Image with Gradient Overlay -->
                  <div class="absolute inset-0 w-full h-full bg-black">
                    <img [src]="item.image" class="absolute inset-0 w-full h-full object-cover opacity-50" alt="" referrerpolicy="no-referrer">
                    <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/90"></div>
                  </div>
                  
                  <!-- Content -->
                  <div class="relative z-10 flex-1 flex flex-col justify-center pr-4">
                    <h4 class="text-[var(--art-text)] font-bold text-lg leading-tight mb-1 drop-shadow-md">{{ item.name }}</h4>
                    <p class="text-[var(--art-text-muted)] text-sm line-clamp-2 drop-shadow-md">{{ item.description }}</p>
                  </div>
                  
                  <!-- Counter -->
                  <div class="relative z-10 flex flex-col items-center gap-2 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-[var(--border-main)] min-w-[80px]">
                    <div class="flex items-center gap-2">
                      <button (click)="cartService.updateQuantity(item.id, 1)" class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[var(--art-text)] hover:bg-white/20 transition-colors" [disabled]="isConfirming()">
                        <mat-icon class="text-sm">add</mat-icon>
                      </button>
                      <button (click)="decreaseCartQuantity(item)" class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[var(--art-text)] hover:bg-white/20 transition-colors" [disabled]="isConfirming()">
                        <mat-icon class="text-sm">remove</mat-icon>
                      </button>
                    </div>
                    <span class="text-[var(--art-text)] font-bold text-xl">{{ item.quantity }}</span>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Remove Confirmation Modal -->
          @if (itemToRemove()) {
            <div class="absolute inset-0 z-[3000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in pointer-events-auto">
              <div class="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-3xl p-8 max-w-sm w-[90%] mx-auto flex flex-col items-center text-center shadow-2xl animate-scale-in">
                <div class="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                  <mat-icon class="text-red-400 text-3xl !w-8 !h-8">delete_outline</mat-icon>
                </div>
                <h3 class="text-[var(--text-main)] font-montserrat font-bold text-xl mb-2">¿Quitar este artículo?</h3>
                <p class="text-[var(--text-main)]/60 text-sm mb-8">¿Seguro que quieres quitar «{{ itemToRemove()?.name }}» de tu selección?</p>
                
                <div class="flex gap-4 w-full">
                  <button (click)="cancelRemove()" class="flex-1 py-3 rounded-xl bg-[var(--text-main)]/5 text-[var(--text-main)] font-bold hover:bg-[var(--text-main)]/10 transition-colors">
                    Mantener
                  </button>
                  <button (click)="confirmRemove()" class="flex-1 py-3 rounded-xl bg-red-500/80 text-[var(--text-main)] font-bold hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          }

          <div class="mt-8 pt-8 border-t border-[var(--border-main)] transition-opacity duration-300" [class.opacity-30]="isConfirming()">
            <div class="flex justify-between items-end mb-6">
              <span class="text-[var(--text-main)]/60 font-montserrat text-sm">Total estimado</span>
              <span class="text-[var(--text-main)] font-mono text-4xl font-bold">{{ cartService.totalPrice() | appPrice: site.identity().currency : site.identity().locale }}</span>
            </div>
            
            <div class="flex flex-col gap-4">
              <button (click)="confirmOrder($event)"
                      class="relative w-full py-4 rounded-full bg-[var(--color-accent)] text-white font-semibold text-lg tracking-tight hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_8px_24px_-6px_rgba(10,132,255,0.5)] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
                      [disabled]="cartService.items().length === 0 || isConfirming()">
                @if (isConfirming()) {
                  <mat-icon class="animate-spin">sync</mat-icon>
                  Procesando…
                } @else {
                  <mat-icon>check_circle</mat-icon>
                  Confirmar pedido
                }
              </button>

              @if (orderError()) {
                <p class="text-center text-xs text-red-400" role="alert">{{ orderError() }}</p>
              }

              <button (click)="closeModal.emit()"
                      [disabled]="isConfirming()"
                      class="w-full py-4 rounded-full text-[var(--text-muted)] font-medium hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-all text-base">
                Seguir explorando
              </button>
            </div>
          </div>
        } @else {
          <!-- Success State / Tracker -->
          <div class="absolute inset-0 flex flex-col animate-fade-in z-10 bg-[var(--bg-surface)] overflow-y-auto touch-pan-y custom-scrollbar p-8">
            <button (click)="closeModal.emit()"
                    aria-label="Cerrar la confirmación del pedido"
                    class="self-end w-12 h-12 rounded-full bg-[var(--text-main)]/5 flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--text-main)]/20 transition-colors">
              <mat-icon>close</mat-icon>
            </button>
            <!-- Header -->
            <div class="flex flex-col items-center mb-10">
              <div class="w-20 h-20 rounded-full bg-[var(--border-main)] flex items-center justify-center mb-6 shadow-lg">
                <mat-icon class="text-[var(--text-sec)] text-4xl">check_circle</mat-icon>
              </div>
              <h2 class="font-montserrat font-black text-3xl text-[var(--text-main)] mb-2 text-center">Pedido recibido</h2>
              @if (orderId()) {
                <p class="text-[var(--text-dim)] text-sm text-center">Pedido n.º {{ orderId() }}</p>
              }
            </div>

            <!-- Progress -->
            <div class="bg-[var(--bg-hover)]/50 rounded-[2rem] p-8 border border-[var(--border-main)] mb-8">
              <div class="flex justify-between items-center mb-8 relative">
                <!-- Progress Line -->
                <div class="absolute top-1/2 left-0 w-full h-1 bg-[var(--border-main)] -translate-y-1/2 z-0"></div>
                <div class="absolute top-1/2 left-0 w-1/3 h-1 bg-[var(--text-muted)] -translate-y-1/2 z-0 shadow-md"></div>

                <!-- Steps -->
                <div class="relative z-10 flex flex-col items-center gap-2">
                  <div class="w-10 h-10 rounded-full bg-[var(--text-muted)] flex items-center justify-center text-[var(--bg-main)]">
                    <mat-icon class="text-sm">check</mat-icon>
                  </div>
                  <span class="text-[var(--text-muted)] text-[10px] font-bold">Confirmado</span>
                </div>
                <div class="relative z-10 flex flex-col items-center gap-2">
                  <div class="w-10 h-10 rounded-full bg-[var(--bg-hover)] border-2 border-[var(--border-light)] flex items-center justify-center text-[var(--text-muted)] animate-pulse">
                    <mat-icon class="text-sm">sync</mat-icon>
                  </div>
                  <span class="text-[var(--text-main)] text-[10px] font-bold">En preparación</span>
                </div>
                <div class="relative z-10 flex flex-col items-center gap-2 opacity-30">
                  <div class="w-10 h-10 rounded-full bg-[var(--bg-hover)] border-2 border-[var(--border-main)] flex items-center justify-center text-[var(--text-dim)]">
                    <mat-icon class="text-sm">flag</mat-icon>
                  </div>
                  <span class="text-[var(--text-dim)] text-[10px] font-bold">Listo</span>
                </div>
              </div>
              <p class="text-[var(--text-muted)] text-center text-sm italic">«Tu solicitud se está procesando.»</p>
            </div>

            <!-- Reviews (static placeholders, replace with real data) -->
            @if (site.features().reviews) {
            <div class="mb-10">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-[var(--text-main)] font-bold text-sm">Opiniones</h3>
                <div class="flex items-center gap-1 text-[var(--text-muted)]">
                  <mat-icon class="text-sm">star</mat-icon>
                  <span class="text-[var(--text-main)] font-bold text-xs">4.9</span>
                  <span class="text-[var(--text-dim)] text-[10px] ml-1">(+6000 opiniones)</span>
                </div>
              </div>
              
              <div class="space-y-4">
                <div class="bg-[var(--bg-hover)]/50 p-5 rounded-2xl border border-[var(--border-main)] relative overflow-hidden group">
                  <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <mat-icon class="text-4xl text-[var(--text-muted)]">format_quote</mat-icon>
                  </div>
                  <div class="flex gap-1 text-[var(--text-muted)] mb-2">
                    <mat-icon class="text-xs">star</mat-icon>
                    <mat-icon class="text-xs">star</mat-icon>
                    <mat-icon class="text-xs">star</mat-icon>
                    <mat-icon class="text-xs">star</mat-icon>
                    <mat-icon class="text-xs">star</mat-icon>
                  </div>
                  <p class="text-[var(--text-sec)] text-sm italic mb-3">«Texto de opinión de ejemplo. Un buen ejemplo de reseña para el wireframe.»</p>
                  <p class="text-[var(--text-dim)] text-[10px] font-bold">— Usuaria A</p>
                </div>

                <div class="bg-[var(--bg-hover)]/50 p-5 rounded-2xl border border-[var(--border-main)] relative overflow-hidden group">
                  <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <mat-icon class="text-4xl text-[var(--text-muted)]">format_quote</mat-icon>
                  </div>
                  <div class="flex gap-1 text-[var(--text-muted)] mb-2">
                    <mat-icon class="text-xs">star</mat-icon>
                    <mat-icon class="text-xs">star</mat-icon>
                    <mat-icon class="text-xs">star</mat-icon>
                    <mat-icon class="text-xs">star</mat-icon>
                    <mat-icon class="text-xs">star</mat-icon>
                  </div>
                  <p class="text-[var(--text-sec)] text-sm italic mb-3">«Otra opinión genérica. El diseño es limpio y la experiencia de usuario, fantástica.»</p>
                  <p class="text-[var(--text-dim)] text-[10px] font-bold">— Usuario B</p>
                </div>
              </div>
            </div>
            }

            <!-- Join CTA -->
            @if (site.features().auth) {
            @if (!authService.currentUser()) {
              <div class="bg-gradient-to-br from-[var(--border-main)]/20 to-transparent p-8 rounded-[2rem] border border-[var(--border-main)] text-center mb-10">
                <mat-icon class="text-[var(--text-muted)] text-4xl mb-4">stars</mat-icon>
                <h3 class="text-[var(--text-main)] font-black text-xl mb-3">Únete</h3>
                <p class="text-[var(--text-muted)] text-sm mb-6">Regístrate ahora para desbloquear más funciones y guardar tu progreso.</p>
                <button (click)="requestLogin.emit()" class="w-full py-4 rounded-xl bg-[var(--border-light)] text-[var(--text-main)] font-black hover:bg-[var(--text-dim)] transition-all shadow-lg">
                  Registrarse
                </button>
              </div>
            } @else {
              <div class="bg-[var(--bg-hover)]/50 p-6 rounded-[2rem] border border-[var(--border-main)] text-center mb-10">
                <mat-icon class="text-[var(--text-muted)] text-3xl mb-2">check_circle</mat-icon>
                <p class="text-[var(--text-main)] font-bold">Pedido guardado en tu cuenta</p>
                <p class="text-[var(--text-dim)] text-xs mt-1">Puedes encontrarlo en tu historial de pedidos, en el menú lateral.</p>
              </div>
            }
            } @else {
              <div class="bg-[var(--bg-hover)]/50 p-6 rounded-[2rem] border border-[var(--border-main)] text-center mb-10">
                <mat-icon class="text-[var(--text-muted)] text-3xl mb-2">receipt_long</mat-icon>
                <p class="text-[var(--text-main)] font-bold">No hace falta cuenta</p>
                <p class="text-[var(--text-dim)] text-xs mt-1">Guarda la referencia del pedido por si necesitas contactarnos.</p>
              </div>
            }

            <button (click)="closeModal.emit()" class="w-full py-4 text-[var(--text-dim)] font-bold text-xs hover:text-[var(--text-sec)] transition-colors mb-8">
              Volver al inicio
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class CheckoutDrawerComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);
  readonly site = inject(SiteService);
  private orderService = inject(OrderService);
  
  closeModal = output<void>();
  requestLogin = output<void>();
  orderConfirmed = output<void>();
  
  isConfirming = signal(false);
  orderSuccess = signal(false);
  itemToRemove = signal<CartItem | null>(null);
  orderId = signal<string | null>(null);
  orderError = signal<string | null>(null);

  decreaseCartQuantity(item: CartItem) {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, -1);
    } else {
      this.itemToRemove.set(item);
    }
  }

  confirmRemove() {
    const item = this.itemToRemove();
    if (item) {
      this.cartService.removeItem(item.id);
      this.itemToRemove.set(null);
    }
  }

  cancelRemove() {
    this.itemToRemove.set(null);
  }

  confirmOrder(event: MouseEvent) {
    event.stopPropagation();
    void this.submitOrder(event);
  }

  private async submitOrder(event: MouseEvent): Promise<void> {
    if (this.isConfirming() || this.cartService.items().length === 0) {
      return;
    }

    createParticleExplosion(event, ['var(--color-accent)', '#3b82f6', '#ffffff'], 'rgba(255, 255, 255, 0.4)');
    this.isConfirming.set(true);
    this.orderError.set(null);

    const user = this.authService.currentUser();
    const result = await this.orderService.submitOrder({
      customer: {
        name: user?.name ?? 'Invitado',
        email: user?.email ?? 'guest@example.com',
      },
      lines: this.cartService.orderLines(),
      total: this.cartService.totalPrice(),
      notes: undefined,
    });

    this.isConfirming.set(false);

    if (!result.ok) {
      this.orderError.set(result.error ?? 'Algo salió mal. Inténtalo de nuevo.');
      return;
    }

    this.orderId.set(result.orderId ?? null);
    this.orderSuccess.set(true);
    this.orderConfirmed.emit();
  }
}
