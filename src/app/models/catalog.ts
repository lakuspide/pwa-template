/**
 * Core catalog domain types.
 *
 * These are deliberately sector-neutral: a "catalog item" can be a product,
 * a dish, a service, a ticket or a rental. Everything the UI needs lives here
 * so a new project only has to replace `CatalogService`'s data source.
 */

/** A single sellable entry in the catalog (no cart state attached). */
export interface CatalogItem {
  id: string;
  name: string;
  /** Unit price as a number. Formatting happens in the view layer (`appPrice`). */
  price: number;
  description: string;
  /** Relative path or absolute URL to the item artwork. */
  image: string;
}

/** A catalog group shown as one card in the 3D carousel. */
export interface CatalogCategory {
  id: string;
  name: string;
  subtitle?: string;
  /** Material Icons ligature name. */
  icon: string;
  image: string;
  items: CatalogItem[];
}

/** A `CatalogItem` plus the quantity the visitor has put in the cart. */
export interface CartItem extends CatalogItem {
  quantity: number;
}

/** One line of a submitted order. */
export interface OrderLine {
  itemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}
