import { APP_COPY } from './copy';

const formatter = new Intl.NumberFormat(APP_COPY.locale, {
  style: 'currency',
  currency: APP_COPY.currency,
});

/**
 * Formats a numeric price for display.
 *
 * Prices travel through the app as numbers (`CatalogItem.price`) and are only
 * turned into text here, so changing currency or locale is a one-line edit in
 * `copy.ts` instead of a regex over price strings.
 */
export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '';
  }
  return formatter.format(value);
}
