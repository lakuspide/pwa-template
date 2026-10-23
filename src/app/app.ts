import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CarouselCylinderComponent} from './carousel-cylinder.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [CarouselCylinderComponent],
  template: `<app-carousel-cylinder></app-carousel-cylinder>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      background-color: var(--bg-main);
    }
  `]
})
export class App {}
