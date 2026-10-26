import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate } from 'motion';
import { IconComponent } from '../shared/icon.component';
import {
  cardDistance,
  carouselCardLayout,
  frontIndex,
} from '../shared/carousel-layout';
import { CatalogCategory, CatalogItem } from '../models/catalog';

export interface DisplayCard {
  id: string;
  title: string;
  subtitle?: string;
  /** Small contextual line, e.g. the number of items in a category. */
  meta?: string;
  price?: string;
  icon?: string;
  image?: string;
  originalData: CatalogItem | CatalogCategory;
}

@Component({
  selector: 'app-carousel-3d',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 0;
      /* The drag surface is the host itself: the cards live in a 3D context
         where side cards sit behind the container's own plane, so the inner
         wrapper must not swallow their taps. */
      pointer-events: auto;
    }
  `],
  host: {
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerUp($event)',
    '(pointerleave)': 'onPointerUp($event)',
  },
  template: `
    <div class="relative w-full flex-1 min-h-[450px] max-h-[600px] flex flex-col items-center justify-center perspective-[1200px] transform-style-3d pointer-events-none mb-6 touch-pan-y transition-all duration-500">

      <!-- Cards Container -->
      <div class="relative w-full flex-1 min-h-0 transform-style-3d z-10 pointer-events-none transition-opacity duration-300"
           [class.opacity-0]="isTransitioning()">
        @for (card of cards(); track card.id; let i = $index) {
          <div class="absolute top-1/2 left-1/2 w-72 h-[420px] -ml-36 -mt-[210px] origin-center will-change-transform"
               [style.transform]="cardStyles()[i]?.transform"
               [style.z-index]="cardStyles()[i]?.zIndex"
               [style.opacity]="cardStyles()[i]?.opacity"
               [style.filter]="cardStyles()[i]?.filter"
               [style.pointer-events]="cardStyles()[i]?.opacity === 0 ? 'none' : 'auto'">
            
            <!-- Card -->
            <div class="w-full h-full relative rounded-[24px] bg-[var(--art-surface)] border border-[var(--art-border)] flex flex-col items-center justify-end p-6 cursor-pointer overflow-hidden transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 shadow-2xl group/card"
                 role="button"
                 tabindex="0"
                 [attr.aria-label]="'Seleccionar ' + card.title"
                 [ngClass]="{
                   'border-white/20 shadow-lg': cardStyles()[i]?.isFront,
                   'animate-vibrate-expand': selectedItemId() === card.id
                 }"
                 (click)="onCardSelect(card, i)"
                 (keydown.enter)="onCardSelect(card, i)"
                 (keydown.space)="onCardSelect(card, i)">
              
              <!-- Subtle Glow on Card -->
              <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--text-dim)]/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700"></div>
              
              <!-- Background Image -->
              @if (card.image) {
                <img [src]="card.image" alt="" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 opacity-100"
                     [ngClass]="{'scale-110': cardStyles()[i]?.isFront, 'scale-100 opacity-65': !cardStyles()[i]?.isFront}"
                     referrerpolicy="no-referrer" />
                <!-- Dark Gradient Overlay for text readability -->
                <div class="absolute inset-0 bg-gradient-to-t from-[var(--art-surface)] via-[var(--art-surface)]/45 to-transparent transition-opacity duration-500"
                     [ngClass]="{'opacity-90': !cardStyles()[i]?.isFront, 'opacity-100': cardStyles()[i]?.isFront}"></div>
              }

              <!-- Sparkles / Fire effect container (Removed for wireframe) -->

              <!-- Content -->
              <div class="relative z-10 flex flex-col items-center text-center gap-2 transform transition-all duration-700 w-full"
                   [ngClass]="{'translate-y-0 scale-100': cardStyles()[i]?.isFront, 'translate-y-4 scale-90 opacity-60': !cardStyles()[i]?.isFront}">
                
                @if (card.icon && viewState() === 'categories') {
                  <mat-icon class="text-4xl !w-10 !h-10 transition-colors duration-500 mb-2"
                            [style.color]="cardStyles()[i]?.isFront ? 'var(--art-text-muted)' : 'var(--art-text-dim)'"
                            [ngClass]="{'drop-shadow-md': cardStyles()[i]?.isFront}">
                    {{ card.icon }}
                  </mat-icon>
                }
                
                <h2 class="font-montserrat font-black text-2xl tracking-wide transition-all duration-500"
                    [style.color]="cardStyles()[i]?.isFront ? 'var(--art-text)' : 'var(--art-text-muted)'"
                    [ngClass]="{'drop-shadow-md scale-105': cardStyles()[i]?.isFront}">
                  {{ card.title }}
                </h2>

                @if (card.meta) {
                  <p class="text-[10px] uppercase tracking-[0.18em] text-[var(--art-text-dim)] transition-opacity duration-500 drop-shadow-md"
                     [ngClass]="{'opacity-100': cardStyles()[i]?.isFront, 'opacity-0': !cardStyles()[i]?.isFront}">
                    {{ card.meta }}
                  </p>
                }

                @if (card.price) {
                  <span class="text-[var(--art-text)] font-mono text-xl font-bold mt-1 transition-all duration-500 drop-shadow-md"
                        [ngClass]="{'scale-110': cardStyles()[i]?.isFront}">{{ card.price }}</span>
                }

                @if (card.subtitle) {
                  <p class="text-[var(--art-text-dim)] text-sm mt-2 leading-relaxed px-2 transition-all duration-500 line-clamp-2 drop-shadow-md"
                     [ngClass]="{'opacity-100': cardStyles()[i]?.isFront, 'opacity-0': !cardStyles()[i]?.isFront}">{{ card.subtitle }}</p>
                }
              </div>

              <!-- Minimalist flicker indicator -->
              <div class="absolute bottom-4 h-0.5 rounded-full transition-all duration-500 z-10"
                   [style.background-color]="cardStyles()[i]?.isFront ? 'var(--color-accent)' : 'rgba(255,255,255,0.22)'"
                   [style.width]="cardStyles()[i]?.isFront ? '3rem' : '2rem'"
                   [ngClass]="{'shadow-[0_0_15px_rgba(10,132,255,0.7)]': cardStyles()[i]?.isFront}"></div>
            </div>
          </div>
        }
      </div>

      <!-- Position: one dot per category, so a long rotation stays readable -->
      @if (cards().length > 1) {
        <div class="relative flex-none h-7 flex items-center justify-center gap-0.5 z-20 pointer-events-auto">
          @for (card of cards(); track card.id; let i = $index) {
            <button type="button"
                    class="p-1.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/60"
                    [attr.aria-label]="'Ir a ' + card.title"
                    [attr.aria-current]="frontPosition() === i ? 'true' : null"
                    (click)="goToCard(i, $event)">
              <span class="block h-1.5 rounded-full transition-all duration-300"
                    [style.width]="frontPosition() === i ? '18px' : '6px'"
                    [style.background-color]="frontPosition() === i ? 'var(--color-accent)' : 'var(--text-dim)'"
                    [style.opacity]="frontPosition() === i ? '1' : '0.5'"></span>
            </button>
          }
          <span class="ml-2 text-[10px] font-mono text-[var(--text-dim)] tabular-nums">{{ frontPosition() + 1 }}/{{ cards().length }}</span>
        </div>
      }
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
  private captured = false;
  private startX = 0;
  private startProgress = 0;
  private lastDragX = 0;
  private lastDragTime = 0;
  private velocity = 0;
  private animation: { stop: () => void } | undefined;

  /** Card currently facing the user. */
  frontPosition = computed(() => frontIndex(this.progress(), this.cards().length));

  getDiff(index: number, p: number, N: number): number {
    return cardDistance(index, p, N);
  }

  cardStyles = computed(() => {
    const p = this.progress();
    const cardsList = this.cards();
    const N = cardsList.length;

    return cardsList.map((_, index) => {
      const layout = carouselCardLayout(cardDistance(index, p, N), N);

      return {
        transform: `translateX(${layout.x}px) translateZ(${layout.z}px) rotateY(${layout.rotateY}deg)`,
        zIndex: layout.zIndex,
        opacity: layout.opacity,
        // Depth is a darkening effect in the dark theme; in the light theme the
        // same brightness would turn the white cards into a grey band, so the
        // floor is theme-aware (`--carousel-depth-floor`).
        filter: `blur(${layout.blur}px) brightness(max(var(--carousel-depth-floor, 0.4), ${layout.brightness}))`,
        isFront: layout.isFront,
      };
    });
  });

  onPointerDown(e: PointerEvent) {
    if (this.cards().length < 2) return;
    if (this.selectedItemId() !== null || this.isTransitioning()) return;
    
    this.isDragging = true;
    this.hasDragged = false;
    this.captured = false;
    this.startX = e.clientX;
    this.lastDragX = e.clientX;
    this.startProgress = this.progress();
    this.lastDragTime = performance.now();
    this.velocity = 0;
    if (this.animation) {
      this.animation.stop();
    }
    // Pointer capture is deferred until the gesture is clearly a drag. Capturing
    // on pointerdown retargets the eventual click to the carousel instead of the
    // card, which would make the cards unclickable.
  }

  onPointerMove(e: PointerEvent) {
    if (!this.isDragging) return;
    
    const deltaX = e.clientX - this.startX;
    if (!this.hasDragged && Math.abs(deltaX) > 10) {
      this.hasDragged = true;
      this.dragged.emit();
      const el = e.currentTarget as HTMLElement;
      el.setPointerCapture(e.pointerId);
      this.captured = true;
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
    if (this.captured && el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
    this.captured = false;

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

  /** Jumps to a category from its dot, taking the shortest way round. */
  goToCard(index: number, event?: Event) {
    event?.stopPropagation();
    if (this.isTransitioning() || this.cards().length < 2) {
      return;
    }

    const diff = cardDistance(index, this.progress(), this.cards().length);
    if (Math.abs(diff) < 0.1) {
      return;
    }

    this.animation?.stop();
    const target = this.progress() + diff;
    this.animation = animate(this.progress(), target, {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      mass: 1,
      onUpdate: (v) => this.progress.set(v),
    });
  }
}
