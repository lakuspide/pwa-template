import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Drop-in replacement for `<mat-icon>`.
 *
 * Keeping the `mat-icon` selector means component templates did not have to
 * change when `@angular/material` was dropped: the ligature font is now
 * self-hosted (`src/fonts/material-icons.woff2` + `styles.css`) and this
 * component is ~10 lines instead of a library dependency.
 *
 * Icons are decorative by default (`aria-hidden`), matching Material's own
 * behaviour. Give the surrounding button a label when the icon carries meaning.
 */
@Component({
  selector: 'mat-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { 'aria-hidden': 'true' },
  styles: [
    `
      :host {
        font-family: 'Material Icons';
        font-weight: normal;
        font-style: normal;
        font-size: 24px;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        font-feature-settings: 'liga';
        -webkit-font-feature-settings: 'liga';
        -webkit-font-smoothing: antialiased;
        user-select: none;
        vertical-align: middle;
        flex: none;
      }
    `,
  ],
})
export class IconComponent {}
