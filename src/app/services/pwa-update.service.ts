import { Injectable, inject, ApplicationRef } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { concat, interval } from 'rxjs';
import { first } from 'rxjs/operators';

/**
 * Polls for new Service Worker versions every 6 hours (once the app has
 * stabilized) and prompts the user to reload when an update is ready.
 * No-ops entirely when the Service Worker isn't enabled (e.g. dev mode).
 */
@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private swUpdate = inject(SwUpdate);
  private appRef = inject(ApplicationRef);

  constructor() {
    if (this.swUpdate.isEnabled) {
      // Allow the app to stabilize first, before starting
      // polling for updates with `interval()`.
      const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable === true));
      const everySixHours$ = interval(6 * 60 * 60 * 1000);
      const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

      everySixHoursOnceAppIsStable$.subscribe(async () => {
        try {
          const updateFound = await this.swUpdate.checkForUpdate();
          console.log(updateFound ? 'A new version is available.' : 'Already on the latest version.');
        } catch (err) {
          console.error('Failed to check for updates:', err);
        }
      });

      // Listen for version updates
      this.swUpdate.versionUpdates.subscribe(evt => {
        switch (evt.type) {
          case 'VERSION_DETECTED':
            console.log(`Downloading new app version: ${evt.version.hash}`);
            break;
          case 'VERSION_READY':
            console.log(`Current app version: ${evt.currentVersion.hash}`);
            console.log(`New app version ready for use: ${evt.latestVersion.hash}`);
            // In a real app, you might want to show a custom UI prompt here
            // For now, we'll just reload the page to apply the update
            if (confirm('A new version of the app is available. Update now?')) {
              document.location.reload();
            }
            break;
          case 'VERSION_INSTALLATION_FAILED':
            console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
            break;
        }
      });
    }
  }
}
