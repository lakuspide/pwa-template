import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { APP_COPY } from '../shared/copy';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = `${APP_COPY.storagePrefix}.theme`;

/**
 * Dark/light theme controller.
 *
 * Applies the `light-theme` class on `<body>` (the CSS custom properties live in
 * `styles.css`), keeps the browser UI colour in sync through
 * `<meta name="theme-color">`, and remembers the choice. With no stored choice
 * it follows the OS preference.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  readonly theme = signal<ThemeMode>(this.readInitialTheme());
  readonly isLight = computed(() => this.theme() === 'light');

  constructor() {
    effect(() => this.apply(this.theme()));
  }

  toggle(): void {
    this.theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  private apply(theme: ThemeMode): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.document.body.classList.toggle('light-theme', theme === 'light');

    const meta = this.document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute(
      'content',
      theme === 'light' ? APP_COPY.themeColorLight : APP_COPY.themeColorDark,
    );

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Private mode / storage disabled: the theme still works for this session.
    }
  }

  private readInitialTheme(): ThemeMode {
    if (!isPlatformBrowser(this.platformId)) {
      return 'dark';
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // Ignore and fall through to the OS preference.
    }

    return globalThis.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
}
