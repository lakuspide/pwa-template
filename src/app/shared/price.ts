/**
 * Currency formatting shared by the pipe and the services.
 *
 * Prices travel through the app as numbers (`CatalogItem.price`) and are only
 * turned into text here, so changing currency or locale never means parsing
 * strings. Formatters are cached per locale/currency pair because the app can
 * switch presets at runtime in demo mode.
 */
const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(locale: string, currency: string): Intl.NumberFormat {
  const key = `${locale}|${currency}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
    formatters.set(key, formatter);
  }
  return formatter;
}

/**
 * Formats a numeric price for display. `null` and `undefined` (information-only
 * catalogs) render as an empty string, so templates can drop the node entirely.
 */
export function formatPrice(
  value: number | null | undefined,
  currency = 'EUR',
  locale = 'en-US',
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '';
  }
  return formatterFor(locale, currency).format(value);
}
