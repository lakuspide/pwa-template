import { SITE_CONFIG } from '../../site/site.config';

/**
 * Compatibility re-export of the active identity.
 *
 * New code should inject `SiteService` so it reacts when the demo changes
 * preset. This constant stays for scripts, docs and modules that only need the
 * initial values.
 */
export const APP_COPY = SITE_CONFIG.identity;
