import fs from 'node:fs';
import path from 'node:path';
import { resolveSiteConfig, SECTOR_PRESETS } from './presets';

/** Every image path in the catalog must exist under `public/`. */
function artworkExists(relativePath: string): boolean {
  return fs.existsSync(path.resolve(process.cwd(), 'public', relativePath));
}

describe('resolveSiteConfig', () => {
  it('keeps the demo copy when no brand overrides are given', () => {
    const config = resolveSiteConfig('menu', {}, true);

    expect(config.identity.appName).toBe('Casa Verde');
    expect(config.content.about.paragraphs.join(' ')).toContain('Casa Verde');
    expect(config.content.locations[0].name).toBe('Casa Verde');
    expect(config.content.terms.intro).toContain('Casa Verde');
  });

  it('replaces the demo brand inside the copy but keeps the catalog and contact', () => {
    const config = resolveSiteConfig('menu', { appName: 'Café Prueba' }, false);

    expect(JSON.stringify(config.content)).not.toContain('Casa Verde');
    expect(config.identity.appName).toBe('Café Prueba');
    expect(config.content.about.paragraphs[0]).toContain('Café Prueba');
    expect(config.content.locations[0].name).toBe('Café Prueba');
    expect(config.content.terms.intro).toContain('Café Prueba');
    expect(config.content.contact.email).toBe(
      SECTOR_PRESETS.menu.content.contact.email,
    );
    expect(config.catalog).toBe(SECTOR_PRESETS.menu.catalog);
  });

  it('leaves the shared presets untouched when one is branded', () => {
    resolveSiteConfig('menu', { appName: 'Otro Sitio' }, false);

    expect(SECTOR_PRESETS.menu.content.about.paragraphs[0]).toContain(
      'Casa Verde',
    );
    expect(SECTOR_PRESETS.menu.content.locations[0].name).toBe('Casa Verde');
  });

  it('has sector artwork for every preset and category', () => {
    for (const preset of Object.values(SECTOR_PRESETS)) {
      expect(artworkExists(preset.heroImage), preset.heroImage).toBe(true);

      for (const category of preset.catalog) {
        expect(artworkExists(category.image), category.image).toBe(true);

        for (const item of category.items) {
          expect(artworkExists(item.image), item.image).toBe(true);
        }
      }
    }
  });

  it('ships Spanish copy and an es-ES identity', () => {
    const config = resolveSiteConfig('boutique', {}, false);

    expect(config.identity.lang).toBe('es');
    expect(config.identity.locale).toBe('es-ES');
    expect(config.content.hero.swipeHint).toBe('Desliza hacia arriba');
    expect(config.content.terms.title).toBe('Términos y condiciones');
    expect(config.catalog[0].name).toBe('Cerámicas');
  });
});
