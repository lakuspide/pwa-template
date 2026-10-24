import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import type { SiteIdentity } from '../../site/site.types';
import { SiteService } from './site.service';

export type ThemeMode = 'dark' | 'light';

/**
 * Dark/light theme controller.
 *
 * Applies the `light-theme` class on `<body>` (the CSS custom properties live in
 * `styles.css`), keeps the browser UI colour in sync through
 * `<meta name="theme-color">`, and remembers the choice. With no stored choice
 * it follows the OS preference.
 *
 * The storage namespace and the two theme colours come from the active site
 * identity, so a generated project does not need to edit this service.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private site = inject(SiteService);

  readonly theme = signal<ThemeMode>(this.readInitialTheme());
  readonly isLight = computed(() => this.theme() === 'light');

  constructor() {
    effect(() => {
      this.apply(this.theme(), this.site.identity());
    });
  }

  toggle(): void {
    this.theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  private apply(theme: ThemeMode, identity: SiteIdentity): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.document.body.classList.toggle('light-theme', theme === 'light');

    const meta = this.document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute(
      'content',
      theme === 'light' ? identity.themeColorLight : identity.themeColorDark,
    );

    try {
      localStorage.setItem(`${identity.storagePrefix}.theme`, theme);
    } catch {
      // Private mode / storage disabled: the theme still works for this session.
    }
  }

  private readInitialTheme(): ThemeMode {
    if (!isPlatformBrowser(this.platformId)) {
      return 'dark';
    }

    try {
      const stored = localStorage.getItem(`${this.site.identity().storagePrefix}.theme`);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // Ignore and fall through to the OS preference.
    }

    return globalThis.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
}
