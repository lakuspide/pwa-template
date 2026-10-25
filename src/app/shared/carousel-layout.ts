/**
 * Geometry for one carousel card.
 *
 * The carousel is a stylised fan, not a real cylinder: each step adds depth,
 * a slight rotation and a lateral offset that saturates near the card edge.
 * The constants are the ones the wireframe was designed with, so 3–4
 * categories keep looking exactly as before.
 *
 * With 5 or more categories the immediate neighbour alone is not enough to
 * suggest that the carousel goes on, so the second (and third) neighbour peek
 * out from behind, progressively smaller and more transparent.
 */
export interface CarouselCardLayout {
  /** Lateral offset in px, signed. */
  x: number;
  /** Depth offset in px, always <= 0. */
  z: number;
  /** Rotation around the Y axis, in degrees. */
  rotateY: number;
  /** Stacking order inside the 3D container. */
  zIndex: number;
  /** 0 hides the card completely. */
  opacity: number;
  /** Blur radius in px. */
  blur: number;
  /** Brightness factor, before the theme's depth floor is applied. */
  brightness: number;
  /** True for the card currently facing the user. */
  isFront: boolean;
}

/** Lateral offset a card reaches when it is far from the front. */
const MAX_X = 260;
/** Depth added by each step away from the front. */
const DEPTH_STEP = 300;
/** Rotation added by each step away from the front. */
const ROTATION_STEP = 15;
/** Cards up to this distance from the front are always visible. */
const BASE_VISIBLE_STEPS = 1;

export function carouselCardLayout(diff: number, total: number): CarouselCardLayout {
  const absDiff = Math.abs(diff);
  const sign = Math.sign(diff);

  const baseX = (1 - Math.exp(-absDiff * 1.5)) * MAX_X;
  // Far neighbours are pushed a little further out so they peek from behind
  // the immediate one instead of hiding exactly underneath it.
  const spread = total >= 5 && absDiff > BASE_VISIBLE_STEPS
    ? (absDiff - BASE_VISIBLE_STEPS) * 44
    : 0;

  const x = sign * (baseX + spread);
  const z = absDiff === 0 ? 0 : -absDiff * DEPTH_STEP;
  const rotateY = absDiff === 0 ? 0 : -diff * ROTATION_STEP;

  let opacity = Math.max(0, 1 - absDiff * 0.8);
  if (total >= 5 && absDiff > BASE_VISIBLE_STEPS) {
    // Faint but present: enough to read "there are more cards" without
    // competing with the immediate neighbour.
    opacity = Math.max(0, 0.22 - (absDiff - BASE_VISIBLE_STEPS - 1) * 0.08);
  }

  return {
    x,
    z,
    rotateY,
    zIndex: Math.round(100 - absDiff * 10),
    opacity,
    blur: absDiff * 4,
    brightness: Math.max(0, 1 - absDiff * 0.5),
    isFront: absDiff < 0.1,
  };
}

/** Index of the card facing the user, normalised to `[0, total)`. */
export function frontIndex(progress: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return ((Math.round(progress) % total) + total) % total;
}

/**
 * Signed distance between a card and the front position, in the shortest
 * direction around the loop. Used for drag, taps and dot navigation.
 */
export function cardDistance(index: number, progress: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  let diff = (((index - progress) % total) + total) % total;
  if (diff > total / 2) {
    diff -= total;
  }
  return diff;
}
