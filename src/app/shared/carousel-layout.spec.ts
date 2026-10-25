import { cardDistance, carouselCardLayout, frontIndex } from './carousel-layout';

describe('carouselCardLayout', () => {
  it('keeps the wireframe geometry for 3 and 4 categories', () => {
    for (const total of [3, 4]) {
      const first = carouselCardLayout(1, total);
      const second = carouselCardLayout(2, total);

      expect(first.x).toBeCloseTo(202.0, 1);
      expect(first.z).toBe(-300);
      expect(first.rotateY).toBe(-15);
      expect(first.opacity).toBeCloseTo(0.2, 2);

      // A second neighbour stays hidden, as in the original design.
      expect(second.opacity).toBe(0);
      expect(second.x).toBeCloseTo(247, 0);
    }
  });

  it('hides everything that is not the front card when there is only one', () => {
    const layout = carouselCardLayout(0, 1);

    expect(layout.x).toBe(0);
    expect(layout.z).toBe(0);
    expect(layout.opacity).toBe(1);
    expect(layout.isFront).toBe(true);
  });

  it('shows the second neighbour faintly from 5 categories up', () => {
    for (const total of [5, 6, 9]) {
      const second = carouselCardLayout(2, total);
      const third = carouselCardLayout(3, total);

      expect(second.opacity).toBeGreaterThan(0.1);
      expect(second.opacity).toBeLessThan(0.3);
      expect(third.opacity).toBeLessThan(second.opacity);
      expect(second.x).toBeGreaterThan(carouselCardLayout(1, total).x);
    }
  });

  it('keeps the front card flat and centred whatever the count', () => {
    for (const total of [1, 2, 3, 4, 5, 6, 9]) {
      const layout = carouselCardLayout(0, total);

      expect(layout.x).toBe(0);
      expect(layout.rotateY).toBe(0);
      expect(layout.opacity).toBe(1);
      expect(layout.isFront).toBe(true);
    }
  });

  it('never puts two visible neighbours at the same lateral offset', () => {
    for (const total of [5, 6, 9]) {
      const x1 = Math.abs(carouselCardLayout(1, total).x);
      const x2 = Math.abs(carouselCardLayout(2, total).x);
      const x3 = Math.abs(carouselCardLayout(3, total).x);

      expect(x2).toBeGreaterThan(x1 + 20);
      expect(x3).toBeGreaterThan(x2 + 20);
    }
  });

  it('fades cards with depth instead of stacking them at full opacity', () => {
    const near = carouselCardLayout(1, 9);
    const far = carouselCardLayout(3, 9);

    expect(far.opacity).toBeLessThan(near.opacity);
    expect(far.blur).toBeGreaterThan(near.blur);
    expect(far.z).toBeLessThan(near.z);
  });
});

describe('frontIndex', () => {
  it('normalises the drag progress into a card index', () => {
    expect(frontIndex(0, 4)).toBe(0);
    expect(frontIndex(1.2, 4)).toBe(1);
    expect(frontIndex(3.8, 4)).toBe(0);
    expect(frontIndex(-1, 4)).toBe(3);
  });

  it('is zero when there are no cards', () => {
    expect(frontIndex(2, 0)).toBe(0);
  });
});

describe('cardDistance', () => {
  it('takes the shortest way around the loop', () => {
    expect(cardDistance(0, 1, 4)).toBe(-1);
    expect(cardDistance(3, 1, 4)).toBe(2);
    expect(cardDistance(2, 1, 4)).toBe(1);
    expect(cardDistance(1, 1, 4)).toBe(0);
  });

  it('works with non-integer positions during a drag', () => {
    expect(cardDistance(1, 0.5, 4)).toBeCloseTo(0.5, 5);
    expect(cardDistance(3, 0.5, 4)).toBeCloseTo(-1.5, 5);
  });

  it('is zero without cards', () => {
    expect(cardDistance(3, 1, 0)).toBe(0);
  });
});
