import { Component, input, output, computed, signal, ChangeDetectionStrategy, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { animate } from 'motion';

export interface DisplayCard {
  id: string;
  title: string;
  subtitle?: string;
  price?: string;
  icon?: string;
  image?: string;
  originalData: any;
}

@Component({
  selector: 'app-carousel-3d',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="relative w-full flex-1 min-h-[450px] max-h-[600px] flex flex-col items-center justify-center perspective-[1200px] transform-style-3d pointer-events-auto mb-6 touch-pan-y transition-all duration-500"
         (pointerdown)="onPointerDown($event)"
         (pointermove)="onPointerMove($event)"
         (pointerup)="onPointerUp($event)"
         (pointercancel)="onPointerUp($event)"
         (pointerleave)="onPointerUp($event)">

      <!-- Cards Container -->
      <div class="relative w-full h-full transform-style-3d z-10 transition-opacity duration-300"
           [class.opacity-0]="isTransitioning()">
        @for (card of cards(); track card.id; let i = $index) {
          <div class="absolute top-1/2 left-1/2 w-72 h-[420px] -ml-36 -mt-[210px] origin-center will-change-transform"
               [style.transform]="cardStyles()[i]?.transform"
               [style.z-index]="cardStyles()[i]?.zIndex"
               [style.opacity]="cardStyles()[i]?.opacity"
               [style.filter]="cardStyles()[i]?.filter">
            
            <!-- Card -->
            <div class="w-full h-full relative rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border-main)] flex flex-col items-center justify-end p-6 cursor-pointer overflow-hidden transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 shadow-2xl group/card"
                 role="button"
                 tabindex="0"
                 [attr.aria-label]="'Select ' + card.title"
                 [ngClass]="{
                   'border-[var(--border-light)] shadow-lg': cardStyles()[i]?.isFront,
                   'animate-vibrate-expand': selectedItemId() === card.id
                 }"
                 (click)="onCardSelect(card, i)"
                 (keydown.enter)="onCardSelect(card, i)"
                 (keydown.space)="onCardSelect(card, i)">
              
              <!-- Subtle Glow on Card -->
              <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--text-dim)]/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700"></div>
              
              <!-- Background Image -->
              @if (card.image) {
                <img [src]="card.image" alt="" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 grayscale opacity-30"
                     [ngClass]="{'scale-110': cardStyles()[i]?.isFront, 'scale-100 opacity-20': !cardStyles()[i]?.isFront}"
                     referrerpolicy="no-referrer" />
                <!-- Dark Gradient Overlay for text readability -->
                <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg-surface)] via-[var(--bg-surface)]/70 to-[var(--bg-surface)]/20 transition-opacity duration-500"
                     [ngClass]="{'opacity-90': !cardStyles()[i]?.isFront, 'opacity-100': cardStyles()[i]?.isFront}"></div>
              }

              <!-- Sparkles / Fire effect container (Removed for wireframe) -->

              <!-- Content -->
              <div class="relative z-10 flex flex-col items-center text-center gap-2 transform transition-all duration-700 w-full"
                   [ngClass]="{'translate-y-0 scale-100': cardStyles()[i]?.isFront, 'translate-y-4 scale-90 opacity-60': !cardStyles()[i]?.isFront}">
                
                @if (card.icon && viewState() === 'categories') {
                  <mat-icon class="text-[var(--text-dim)] text-4xl !w-10 !h-10 transition-colors duration-500 mb-2" 
                            [ngClass]="{'text-[var(--text-sec)] drop-shadow-md': cardStyles()[i]?.isFront}">
                    {{ card.icon }}
                  </mat-icon>
                }
                
                <h2 class="font-montserrat font-black text-2xl tracking-wide text-[var(--text-muted)] transition-all duration-500"
                    [ngClass]="{'text-[var(--text-main)] drop-shadow-md scale-105': cardStyles()[i]?.isFront}">
                  {{ card.title }}
                </h2>

                @if (card.price) {
                  <span class="text-[var(--text-muted)] font-mono text-xl font-bold mt-1 transition-all duration-500 drop-shadow-md"
                        [ngClass]="{'scale-110': cardStyles()[i]?.isFront}">{{ card.price }}</span>
                }

                @if (card.subtitle) {
                  <p class="text-[var(--text-dim)] text-sm mt-2 leading-relaxed px-2 transition-all duration-500 line-clamp-2 drop-shadow-md"
                     [ngClass]="{'opacity-100': cardStyles()[i]?.isFront, 'opacity-0': !cardStyles()[i]?.isFront}">{{ card.subtitle }}</p>
                }
              </div>

              <!-- Minimalist flicker indicator -->
              <div class="absolute bottom-4 w-8 h-0.5 rounded-full bg-[var(--text-main)]/20 transition-all duration-500 z-10"
                   [ngClass]="{'bg-[var(--color-accent)] w-12 shadow-[0_0_15px_rgba(10,132,255,0.7)]': cardStyles()[i]?.isFront}"></div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class Carousel3dComponent {
  cards = input.required<DisplayCard[]>();
  viewState = input<'categories' | 'items'>('categories');
  isTransitioning = input<boolean>(false);
  
  cardSelected = output<DisplayCard>();
  dragged = output<void>();

  progress = signal(1); // Start at index 1
  selectedItemId = signal<string | null>(null);

  private isDragging = false;
  private hasDragged = false;
  private startX = 0;
  private startProgress = 0;
  private lastDragX = 0;
  private lastDragTime = 0;
  private velocity = 0;
  private animation: { stop: () => void } | undefined;

  getDiff(index: number, p: number, N: number): number {
    let diff = (((index - p) % N) + N) % N;
    if (diff > N / 2) diff -= N;
    return diff;
  }

  cardStyles = computed(() => {
    const p = this.progress();
    const cardsList = this.cards();
    const N = cardsList.length;
    
    return cardsList.map((_, index) => {
      const diff = this.getDiff(index, p, N);
      const absDiff = Math.abs(diff);

      const sign = Math.sign(diff);
      const x = sign * (1 - Math.exp(-absDiff * 1.5)) * 260; 
      const z = -absDiff * 300; 
      const rotateY = -diff * 15; 
      
      return {
        transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg)`,
        zIndex: Math.round(100 - absDiff * 10),
        opacity: Math.max(0, 1 - absDiff * 0.8),
        filter: `blur(${absDiff * 4}px) brightness(${Math.max(0.4, 1 - absDiff * 0.5)})`,
        isFront: absDiff < 0.1
      };
    });
  });

  onPointerDown(e: PointerEvent) {
    if (this.selectedItemId() !== null || this.isTransitioning()) return;
    
    this.isDragging = true;
    this.hasDragged = false;
    this.startX = e.clientX;
    this.lastDragX = e.clientX;
    this.startProgress = this.progress();
    this.lastDragTime = performance.now();
    this.velocity = 0;
    if (this.animation) {
      this.animation.stop();
    }
    
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
  }

  onPointerMove(e: PointerEvent) {
    if (!this.isDragging) return;
    
    const deltaX = e.clientX - this.startX;
    if (Math.abs(deltaX) > 10) {
      this.hasDragged = true;
      this.dragged.emit();
    }

    const newProgress = this.startProgress - deltaX / 250;
    this.progress.set(newProgress);
    
    const now = performance.now();
    const dt = now - this.lastDragTime;
    if (dt > 0) {
      this.velocity = -(e.clientX - this.lastDragX) / 250 / dt;
    }
    
    this.lastDragX = e.clientX;
    this.lastDragTime = now;
  }

  onPointerUp(e: PointerEvent) {
    if (!this.isDragging) return;
    this.isDragging = false;
    
    const el = e.currentTarget as HTMLElement;
    el.releasePointerCapture(e.pointerId);

    this.applyInertia();
  }

  applyInertia() {
    const p = this.progress();
    const predictedProgress = p + this.velocity * 150; 
    
    const targetProgress = Math.round(predictedProgress);

    this.animation = animate(p, targetProgress, {
      type: "spring",
      stiffness: 400,
      damping: 40,
      mass: 1,
      onUpdate: (v) => this.progress.set(v)
    });
  }

  onCardSelect(card: DisplayCard, index: number) {
    if (this.selectedItemId() !== null || this.isTransitioning()) return;
    if (this.hasDragged) return;
    
    const diff = this.getDiff(index, this.progress(), this.cards().length);
    if (Math.abs(diff) > 0.1) {
      const targetProgress = this.progress() + diff;
      this.animation = animate(this.progress(), targetProgress, {
        type: "spring",
        stiffness: 400,
        damping: 40,
        mass: 1,
        onUpdate: (v) => this.progress.set(v)
      });
      if (this.viewState() !== 'categories') {
        return;
      }
    }

    this.selectedItemId.set(card.id);
    
    setTimeout(() => {
      this.cardSelected.emit(card);
      this.selectedItemId.set(null);
    }, 400);
  }

  resetProgress() {
    this.progress.set(0);
  }

  setProgress(p: number) {
    this.progress.set(p);
  }
}
