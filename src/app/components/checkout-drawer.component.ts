import { Component, inject, signal, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CartService, CartItem } from '../services/cart.service';
import { AuthService } from '../auth.service';
import { createParticleExplosion } from '../shared/particle-effect';

@Component({
  selector: 'app-checkout-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="absolute inset-0 z-[2000] flex flex-col bg-[var(--bg-main)]/90 backdrop-blur-xl animate-fade-in pointer-events-auto"
         role="dialog"
         aria-modal="true"
         aria-label="Order summary and checkout"
         (pointerdown)="$event.stopPropagation()"
         (pointermove)="$event.stopPropagation()"
         (pointerup)="$event.stopPropagation()">
      
      <div class="flex-1 w-full max-w-2xl mx-auto p-8 flex flex-col h-full relative">
        
        @if (!orderSuccess()) {
          <div class="flex justify-between items-center mb-8">
            <h2 class="font-montserrat font-black text-3xl text-[var(--text-main)]">Summary</h2>
            <button (click)="closeModal.emit()" class="w-12 h-12 rounded-full bg-[var(--text-main)]/5 flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--text-main)]/20 transition-colors" [disabled]="isConfirming()">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto touch-pan-y custom-scrollbar pr-4 space-y-6 transition-opacity duration-300" [class.opacity-30]="isConfirming()">
            @if (cartService.items().length === 0) {
              <div class="h-full flex flex-col items-center justify-center text-[var(--text-main)]/40">
                <mat-icon class="text-6xl mb-4 opacity-50">remove_shopping_cart</mat-icon>
                <p class="font-montserrat text-lg">Your list is empty.</p>
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
                    <h4 class="text-[var(--text-main)] font-bold text-lg leading-tight mb-1 drop-shadow-md">{{ item.name }}</h4>
                    <p class="text-[var(--text-main)]/70 text-sm line-clamp-2 drop-shadow-md">{{ item.description }}</p>
                  </div>
                  
                  <!-- Counter -->
                  <div class="relative z-10 flex flex-col items-center gap-2 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-[var(--border-main)] min-w-[80px]">
                    <div class="flex items-center gap-2">
                      <button (click)="cartService.updateQuantity(item.id, 1)" class="w-8 h-8 rounded-full bg-[var(--text-main)]/10 flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--text-main)]/20 transition-colors" [disabled]="isConfirming()">
                        <mat-icon class="text-sm">add</mat-icon>
                      </button>
                      <button (click)="decreaseCartQuantity(item)" class="w-8 h-8 rounded-full bg-[var(--text-main)]/10 flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--text-main)]/20 transition-colors" [disabled]="isConfirming()">
                        <mat-icon class="text-sm">remove</mat-icon>
                      </button>
                    </div>
                    <span class="text-[var(--text-main)] font-bold text-xl">{{ item.quantity }}</span>
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
                <h3 class="text-[var(--text-main)] font-montserrat font-bold text-xl mb-2">Remove Item?</h3>
                <p class="text-[var(--text-main)]/60 text-sm mb-8">Are you sure you want to remove "{{ itemToRemove()?.name }}" from your selection?</p>
                
                <div class="flex gap-4 w-full">
                  <button (click)="cancelRemove()" class="flex-1 py-3 rounded-xl bg-[var(--text-main)]/5 text-[var(--text-main)] font-bold hover:bg-[var(--text-main)]/10 transition-colors">
                    Keep
                  </button>
                  <button (click)="confirmRemove()" class="flex-1 py-3 rounded-xl bg-red-500/80 text-[var(--text-main)] font-bold hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          }

          <div class="mt-8 pt-8 border-t border-[var(--border-main)] transition-opacity duration-300" [class.opacity-30]="isConfirming()">
            <div class="flex justify-between items-end mb-6">
              <span class="text-[var(--text-main)]/60 font-montserrat text-sm">Estimated Total</span>
              <span class="text-[var(--text-main)] font-mono text-4xl font-bold">{{ cartService.totalPrice() | number:'1.2-2' }} {{ cartService.currencySymbol }}</span>
            </div>
            
            <div class="flex flex-col gap-4">
              <button (click)="confirmOrder($event)"
                      class="relative w-full py-4 rounded-full bg-[var(--color-accent)] text-white font-semibold text-lg tracking-tight hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_8px_24px_-6px_rgba(10,132,255,0.5)] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
                      [disabled]="cartService.items().length === 0 || isConfirming()">
                @if (isConfirming()) {
                  <mat-icon class="animate-spin">sync</mat-icon>
                  Processing…
                } @else {
                  <mat-icon>check_circle</mat-icon>
                  Confirm Order
                }
              </button>

              <button (click)="closeModal.emit()"
                      [disabled]="isConfirming()"
                      class="w-full py-4 rounded-full text-[var(--text-muted)] font-medium hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-all text-base">
                Continue
              </button>
            </div>
          </div>
        } @else {
          <!-- Success State / Tracker -->
          <div class="absolute inset-0 flex flex-col animate-fade-in z-10 bg-[var(--bg-surface)] overflow-y-auto touch-pan-y custom-scrollbar p-8">
            <!-- Header -->
            <div class="flex flex-col items-center mb-10">
              <div class="w-20 h-20 rounded-full bg-[var(--border-main)] flex items-center justify-center mb-6 shadow-lg">
                <mat-icon class="text-[var(--text-sec)] text-4xl">check_circle</mat-icon>
              </div>
              <h2 class="font-montserrat font-black text-3xl text-[var(--text-main)] mb-2 text-center">Process Complete</h2>
              <p class="text-[var(--text-dim)] text-sm text-center">ID #{{ Math.floor(Math.random() * 1000) }}</p>
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
                  <span class="text-[var(--text-muted)] text-[10px] font-bold">Step 1</span>
                </div>
                <div class="relative z-10 flex flex-col items-center gap-2">
                  <div class="w-10 h-10 rounded-full bg-[var(--bg-hover)] border-2 border-[var(--border-light)] flex items-center justify-center text-[var(--text-muted)] animate-pulse">
                    <mat-icon class="text-sm">sync</mat-icon>
                  </div>
                  <span class="text-[var(--text-main)] text-[10px] font-bold">Step 2</span>
                </div>
                <div class="relative z-10 flex flex-col items-center gap-2 opacity-30">
                  <div class="w-10 h-10 rounded-full bg-[var(--bg-hover)] border-2 border-[var(--border-main)] flex items-center justify-center text-[var(--text-dim)]">
                    <mat-icon class="text-sm">flag</mat-icon>
                  </div>
                  <span class="text-[var(--text-dim)] text-[10px] font-bold">Step 3</span>
                </div>
              </div>
              <p class="text-[var(--text-muted)] text-center text-sm italic">"Your request is being processed."</p>
            </div>

            <!-- Share -->
            <div class="mb-10">
              <h3 class="text-[var(--text-dim)] text-[10px] font-bold mb-4 text-center">Share</h3>
              <div class="flex justify-center gap-4">
                <button class="w-14 h-14 rounded-2xl bg-[var(--text-main)]/5 border border-[var(--border-main)] flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--text-main)]/10 transition-all hover:-translate-y-1">
                  <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </button>
                <button class="w-14 h-14 rounded-2xl bg-[var(--text-main)]/5 border border-[var(--border-main)] flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--text-main)]/10 transition-all hover:-translate-y-1">
                  <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.65zm6.59-4.819c1.557.925 3.567 1.414 5.35 1.415 5.436 0 9.859-4.423 9.862-9.859.002-2.633-1.023-5.11-2.884-6.971-1.861-1.862-4.337-2.889-6.971-2.89-5.437 0-9.86 4.423-9.863 9.86-.001 1.93.55 3.804 1.59 5.435l-1.041 3.805 3.909-1.025zm11.346-7.42c-.301-.151-1.781-.878-2.057-.978-.275-.1-.476-.151-.676.151-.2.301-.777.978-.951 1.178-.175.2-.351.226-.652.075-.301-.151-1.27-.467-2.42-1.493-.894-.797-1.496-1.782-1.672-2.083-.176-.301-.019-.463.132-.613.135-.134.301-.351.451-.526.15-.175.201-.301.301-.501.1-.2.05-.376-.025-.526-.075-.151-.676-1.63-.926-2.232-.244-.594-.493-.513-.676-.522-.175-.009-.376-.01-.576-.01-.2 0-.527.075-.802.376-.275.301-1.053 1.028-1.053 2.507 0 1.479 1.078 2.908 1.228 3.108.15.2 2.122 3.24 5.139 4.541.718.31 1.279.495 1.716.635.722.23 1.378.197 1.897.12.579-.085 1.781-.728 2.031-1.43.25-.702.25-1.303.175-1.43-.075-.127-.275-.201-.576-.352z"/></svg>
                </button>
                <button class="w-14 h-14 rounded-2xl bg-[var(--text-main)]/5 border border-[var(--border-main)] flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--text-main)]/10 transition-all hover:-translate-y-1">
                  <mat-icon>share</mat-icon>
                </button>
              </div>
            </div>

            <!-- Reviews -->
            <div class="mb-10">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-[var(--text-main)] font-bold text-sm">Reviews</h3>
                <div class="flex items-center gap-1 text-[var(--text-muted)]">
                  <mat-icon class="text-sm">star</mat-icon>
                  <span class="text-[var(--text-main)] font-bold text-xs">4.9</span>
                  <span class="text-[var(--text-dim)] text-[10px] ml-1">(+6000 reviews)</span>
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
                  <p class="text-[var(--text-sec)] text-sm italic mb-3">"Generic review placeholder text. This is a great example of a wireframe review."</p>
                  <p class="text-[var(--text-dim)] text-[10px] font-bold">— User A</p>
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
                  <p class="text-[var(--text-sec)] text-sm italic mb-3">"Another generic review. The layout is clean and the user experience is fantastic."</p>
                  <p class="text-[var(--text-dim)] text-[10px] font-bold">— User B</p>
                </div>
              </div>
            </div>

            <!-- Join CTA -->
            @if (!authService.currentUser()) {
              <div class="bg-gradient-to-br from-[var(--border-main)]/20 to-transparent p-8 rounded-[2rem] border border-[var(--border-main)] text-center mb-10">
                <mat-icon class="text-[var(--text-muted)] text-4xl mb-4">stars</mat-icon>
                <h3 class="text-[var(--text-main)] font-black text-xl mb-3">Join Us</h3>
                <p class="text-[var(--text-muted)] text-sm mb-6">Register now to unlock more features and save your progress.</p>
                <button (click)="requestLogin.emit()" class="w-full py-4 rounded-xl bg-[var(--border-light)] text-[var(--text-main)] font-black hover:bg-[var(--text-dim)] transition-all shadow-lg">
                  Register
                </button>
              </div>
            } @else {
              <div class="bg-[var(--bg-hover)]/50 p-6 rounded-[2rem] border border-[var(--border-main)] text-center mb-10">
                <mat-icon class="text-[var(--text-muted)] text-3xl mb-2">check_circle</mat-icon>
                <p class="text-[var(--text-main)] font-bold">Action Logged</p>
                <p class="text-[var(--text-dim)] text-xs mt-1">This action has been saved to your profile.</p>
              </div>
            }

            <button (click)="closeModal.emit()" class="w-full py-4 text-[var(--text-dim)] font-bold text-xs hover:text-[var(--text-sec)] transition-colors mb-8">
              Back to Home
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
  
  closeModal = output<void>();
  requestLogin = output<void>();
  orderConfirmed = output<void>();
  
  isConfirming = signal(false);
  orderSuccess = signal(false);
  itemToRemove = signal<CartItem | null>(null);
  
  Math = Math;

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
    createParticleExplosion(event, ['var(--color-accent)', '#3b82f6', '#ffffff'], 'rgba(255, 255, 255, 0.4)');
    this.isConfirming.set(true);

    setTimeout(() => {
      this.isConfirming.set(false);
      this.orderSuccess.set(true);
      this.orderConfirmed.emit();
    }, 2000);
  }
}
