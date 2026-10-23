/**
 * Identifiers for the overlay panels the shell can open.
 *
 * Keeping them in one union avoids the "magic string" drift that happens when
 * every section declares its own list of panel ids.
 */

/** The four placeholder branch/store panels. */
export type LocationPanelId = 'location-1' | 'location-2' | 'location-3' | 'location-4';

/** Anything that can be expanded inside the catalog shell. `null` = home. */
export type PanelId = 'about' | 'catalog' | 'terms' | LocationPanelId | null;
