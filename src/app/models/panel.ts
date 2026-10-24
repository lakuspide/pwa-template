/**
 * Identifiers for the overlay panels the shell can open.
 *
 * Keeping them in one union avoids the "magic string" drift that happens when
 * every section declares its own list of panel ids.
 */

/** Store / office panels. Presets declare as many as they need (`location-1…n`). */
export type LocationPanelId = `location-${number}`;

/** Anything that can be expanded inside the catalog shell. `null` = home. */
export type PanelId = 'about' | 'catalog' | 'terms' | LocationPanelId | null;
