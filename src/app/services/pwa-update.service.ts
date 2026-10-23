import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ApplicationRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { concat, interval } from 'rxjs';
import { first } from 'rxjs/operators';
import { logger } from '../shared/logger';

/**
 * Keeps the installed PWA up to date.
 *
 * Checks for a new Service Worker version once the app is stable and then every
 * six hours. When one is ready it raises `updateReady`; the shell shows a small
 * "reload" affordance instead of a blocking `confirm()` dialog. In dev mode, or
 * when the Service Worker is not registered, every call is a no-op.
 */
@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private static readonly CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

  private readonly swUpdate = inject(SwUpdate, { optional: true });
  private readonly appRef = inject(ApplicationRef);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  /** True when a new version has been downloaded and is waiting to activate. */
  readonly updateReady = signal(false);

  /** True while the update is being activated, so the button can disable itself. */
  readonly applying = signal(false);

  constructor() {
    if (!isPlatformBrowser(this.platformId) || !this.swUpdate?.isEnabled) {
      return;
    }

    const appIsStable$ = this.appRef.isStable.pipe(first((stable) => stable === true));
    const everySixHours$ = interval(PwaUpdateService.CHECK_INTERVAL_MS);
    concat(appIsStable$, everySixHours$).subscribe(() => void this.checkForUpdate());

    this.swUpdate.versionUpdates.subscribe((event) => {
      switch (event.type) {
        case 'VERSION_DETECTED':
          logger.info('Downloading new app version', event.version.hash);
          break;
        case 'VERSION_READY':
          logger.info('New app version ready', event.latestVersion.hash);
          this.updateReady.set(true);
          break;
        case 'VERSION_INSTALLATION_FAILED':
          logger.error('Service worker installation failed', event.error);
          break;
        case 'NO_NEW_VERSION_DETECTED':
          break;
      }
    });
  }

  /** Asks the Service Worker whether the server has a newer build. */
  async checkForUpdate(): Promise<void> {
    if (!this.swUpdate?.isEnabled) {
      return;
    }

    try {
      const found = await this.swUpdate.checkForUpdate();
      logger.info(found ? 'A new version is available.' : 'Already on the latest version.');
    } catch (err) {
      logger.error('checkForUpdate failed', err);
    }
  }

  /** Activates the waiting version and reloads into it. */
  async applyUpdate(): Promise<void> {
    if (!this.swUpdate) {
      return;
    }

    this.applying.set(true);
    try {
      await this.swUpdate.activateUpdate();
      this.document.location.reload();
    } catch (err) {
      logger.error('activateUpdate failed', err);
      this.applying.set(false);
    }
  }
}
