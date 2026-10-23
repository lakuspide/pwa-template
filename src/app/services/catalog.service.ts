import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { CatalogCategory } from '../models/catalog';
import { logger } from '../shared/logger';

/**
 * Placeholder catalog.
 *
 * Sector-neutral on purpose: replace these four categories (or point
 * `environment.apiBaseUrl` at a real backend) and the whole flow — carousel,
 * items grid, product modal, cart, checkout — follows automatically.
 * Prices are numbers; formatting is done by the `appPrice` pipe.
 */
const MOCK_CATEGORIES: CatalogCategory[] = [
  {
    id: 'category-1',
    name: 'Category One',
    subtitle: 'Short category subtitle',
    icon: 'category',
    image: 'images/catalog-1.svg',
    items: Array.from({ length: 4 }, (_, i) => ({
      id: `C1-${i + 1}`,
      name: `Item 1.${i + 1}`,
      price: [12.5, 19, 24.9, 32][i],
      description:
        'Placeholder description for this item. Replace it with the real copy: what it is, why it is useful and anything the visitor needs to know before adding it to the cart.',
      image: 'images/catalog-1.svg',
    })),
  },
  {
    id: 'category-2',
    name: 'Category Two',
    subtitle: 'Short category subtitle',
    icon: 'widgets',
    image: 'images/catalog-2.svg',
    items: Array.from({ length: 4 }, (_, i) => ({
      id: `C2-${i + 1}`,
      name: `Item 2.${i + 1}`,
      price: [9.9, 15, 21.5, 28][i],
      description:
        'Placeholder description for this item. Replace it with the real copy: what it is, why it is useful and anything the visitor needs to know before adding it to the cart.',
      image: 'images/catalog-2.svg',
    })),
  },
  {
    id: 'category-3',
    name: 'Category Three',
    subtitle: 'Short category subtitle',
    icon: 'layers',
    image: 'images/catalog-3.svg',
    items: Array.from({ length: 4 }, (_, i) => ({
      id: `C3-${i + 1}`,
      name: `Item 3.${i + 1}`,
      price: [18, 26.4, 34, 42.9][i],
      description:
        'Placeholder description for this item. Replace it with the real copy: what it is, why it is useful and anything the visitor needs to know before adding it to the cart.',
      image: 'images/catalog-3.svg',
    })),
  },
  {
    id: 'category-4',
    name: 'Category Four',
    subtitle: 'Short category subtitle',
    icon: 'extension',
    image: 'images/catalog-4.svg',
    items: Array.from({ length: 4 }, (_, i) => ({
      id: `C4-${i + 1}`,
      name: `Item 4.${i + 1}`,
      price: [7.5, 14.9, 22, 39.9][i],
      description:
        'Placeholder description for this item. Replace it with the real copy: what it is, why it is useful and anything the visitor needs to know before adding it to the cart.',
      image: 'images/catalog-4.svg',
    })),
  },
];

/**
 * Catalog data source.
 *
 * With `environment.useMockData = true` (the template default) it serves the
 * bundled placeholders. Flip the flag and set `apiBaseUrl` to switch to
 * `GET {apiBaseUrl}/categories` — no component changes required, because
 * everything reads the `categories` signal either way.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);

  /** Full catalog, grouped by category. Source of truth for the UI. */
  categories = signal<CatalogCategory[]>(environment.useMockData ? MOCK_CATEGORIES : []);

  /** True while a catalog fetch is in flight. Bind a spinner/skeleton to this. */
  isLoading = signal(false);

  /** Last load error, or `null` when everything is fine. */
  error = signal<string | null>(null);

  constructor() {
    if (!environment.useMockData) {
      void this.load();
    }
  }

  /** Loads the catalog, or resets it to the bundled placeholders in mock mode. */
  async load(): Promise<void> {
    if (environment.useMockData) {
      this.categories.set(MOCK_CATEGORIES);
      this.error.set(null);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<CatalogCategory[]>(`${environment.apiBaseUrl}/categories`),
      );
      this.categories.set(data);
    } catch (err) {
      this.error.set('Could not load the catalog. Please try again.');
      logger.error('CatalogService.load failed', err);
    } finally {
      this.isLoading.set(false);
    }
  }
}
