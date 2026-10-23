import { isDevMode } from '@angular/core';

/**
 * Tiny logging facade.
 *
 * `info`/`warn` only speak in development builds, so a production console stays
 * clean; `error` always goes through because real failures must be visible in
 * crash reports. Swap the bodies for your logger of choice (Sentry, LogRocket…).
 */
const prefix = '[app]';

export const logger = {
  info(...args: unknown[]): void {
    if (isDevMode()) {
      console.info(prefix, ...args);
    }
  },
  warn(...args: unknown[]): void {
    if (isDevMode()) {
      console.warn(prefix, ...args);
    }
  },
  error(...args: unknown[]): void {
    console.error(prefix, ...args);
  },
};
