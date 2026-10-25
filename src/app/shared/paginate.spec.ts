import { paginate, wrapPage } from './paginate';

describe('paginate', () => {
  const items = Array.from({ length: 40 }, (_, index) => index);

  it('keeps a short list on a single page', () => {
    expect(paginate(items.slice(0, 3), 16)).toEqual([[0, 1, 2]]);
  });

  it('caps every page at the page size', () => {
    const pages = paginate(items, 16);

    expect(pages.length).toBe(3);
    expect(pages.map((page) => page.length)).toEqual([16, 16, 8]);
  });

  it('returns the exact page size unchanged', () => {
    const pages = paginate(items.slice(0, 16), 16);

    expect(pages.length).toBe(1);
    expect(pages[0].length).toBe(16);
  });

  it('puts the extra item on a second page', () => {
    const pages = paginate(items.slice(0, 17), 16);

    expect(pages.length).toBe(2);
    expect(pages[1]).toEqual([16]);
  });

  it('handles an empty list and a non-positive page size', () => {
    expect(paginate([], 16)).toEqual([]);
    expect(paginate(items, 0)).toEqual([]);
  });

  it('does not mutate the source list', () => {
    const source = [...items];
    paginate(source, 16);

    expect(source).toEqual(items);
  });
});

describe('wrapPage', () => {
  it('wraps around both ends', () => {
    expect(wrapPage(2, 2)).toBe(0);
    expect(wrapPage(-1, 2)).toBe(1);
    expect(wrapPage(5, 3)).toBe(2);
  });

  it('keeps a single page at zero', () => {
    expect(wrapPage(4, 1)).toBe(0);
    expect(wrapPage(0, 0)).toBe(0);
  });
});
