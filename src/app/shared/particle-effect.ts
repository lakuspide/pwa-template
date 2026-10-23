import { animate } from 'motion';

/**
 * "Confirm action" particle burst used on primary CTAs (e.g. add to cart,
 * confirm order). Pops the clicked element and spawns short-lived
 * smoke + spark particles around the click point.
 *
 * Extracted so it isn't duplicated across every component that needs a
 * satisfying click feedback — call it from any (click) handler:
 *
 *   confirm(event: MouseEvent) {
 *     createParticleExplosion(event, ['#0a84ff', '#3b82f6', '#ffffff']);
 *     ...
 *   }
 */
export function createParticleExplosion(
  event: MouseEvent,
  sparkColors: string[] = ['#9ca3af', '#d1d5db', '#ffffff'],
  smokeColor: string = 'rgba(255, 255, 255, 0.3)'
): void {
  const button = event.currentTarget as HTMLElement;
  const rect = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Button pop animation
  animate(button, { scale: [1, 0.9, 1] }, { duration: 0.3, ease: 'easeInOut' });

  // Smoke particles
  for (let i = 0; i < 15; i++) {
    const smoke = document.createElement('div');
    smoke.style.position = 'fixed';
    smoke.style.left = `${centerX}px`;
    smoke.style.top = `${centerY}px`;
    const size = 10 + Math.random() * 20;
    smoke.style.width = `${size}px`;
    smoke.style.height = `${size}px`;
    smoke.style.borderRadius = '50%';
    smoke.style.backgroundColor = smokeColor;
    smoke.style.filter = 'blur(2px)';
    smoke.style.pointerEvents = 'none';
    smoke.style.zIndex = '9999';
    smoke.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(smoke);

    const angle = Math.random() * Math.PI * 2;
    const velocity = 20 + Math.random() * 40;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;

    animate(
      smoke,
      { x: [0, tx], y: [0, ty], opacity: [1, 0], scale: [0.5, 1.5] },
      { duration: 0.4 + Math.random() * 0.3, ease: 'easeOut' }
    ).finished.then(() => smoke.remove());
  }

  // Spark particles
  for (let i = 0; i < 20; i++) {
    const spark = document.createElement('div');
    spark.style.position = 'fixed';
    spark.style.left = `${centerX}px`;
    spark.style.top = `${centerY}px`;
    const size = 3 + Math.random() * 5;
    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;
    spark.style.borderRadius = '50%';
    spark.style.backgroundColor = sparkColors[Math.floor(Math.random() * sparkColors.length)];
    spark.style.pointerEvents = 'none';
    spark.style.zIndex = '10000';
    spark.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(spark);

    const angle = Math.random() * Math.PI * 2;
    const velocity = 50 + Math.random() * 80;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;

    animate(
      spark,
      { x: [0, tx], y: [0, ty], opacity: [1, 0], scale: [1, 0] },
      { duration: 0.3 + Math.random() * 0.3, ease: 'easeOut' }
    ).finished.then(() => spark.remove());
  }
}
