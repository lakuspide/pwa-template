/**
 * Splits a catalog into pages of at most `size` items.
 *
 * The catalog is a fixed, local list: paging is a view concern, never a
 * request for more data, so a PWA keeps working offline and the user always
 * knows how many pages are left.
 */
export function paginate<T>(items: readonly T[], size: number): T[][] {
  if (size <= 0) {
    return [];
  }

  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages;
}

/** Wraps a page index around `[0, total)`, used by the pager arrows. */
export function wrapPage(page: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return ((page % total) + total) % total;
}
