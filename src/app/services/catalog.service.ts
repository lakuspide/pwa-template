import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { CatalogCategory } from '../models/catalog';
import { logger } from '../shared/logger';
import { SiteService } from './site.service';

/**
 * Catalog data source.
 *
 * With `environment.useMockData = true` (the template default) it serves the
 * active preset's catalog, so switching sector swaps the carousel content
 * immediately. Flip the flag and set `apiBaseUrl` to switch to
 * `GET {apiBaseUrl}/categories` — no component changes required, because
 * everything reads the `categories` signal either way.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private site = inject(SiteService);

  /** Catalog fetched from the API when mock mode is off. */
  private remoteCategories = signal<CatalogCategory[]>([]);

  /** Full catalog, grouped by category. Source of truth for the UI. */
  readonly categories = computed<CatalogCategory[]>(() =>
    environment.useMockData ? this.site.catalog() : this.remoteCategories(),
  );

  /** True while a catalog fetch is in flight. Bind a spinner/skeleton to this. */
  isLoading = signal(false);

  /** Last load error, or `null` when everything is fine. */
  error = signal<string | null>(null);

  constructor() {
    if (!environment.useMockData) {
      void this.load();
    }
  }

  /** Loads the catalog, or keeps the preset catalog in mock mode. */
  async load(): Promise<void> {
    if (environment.useMockData) {
      this.error.set(null);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<CatalogCategory[]>(`${environment.apiBaseUrl}/categories`),
      );
      this.remoteCategories.set(data);
    } catch (err) {
      this.error.set('Could not load the catalog. Please try again.');
      logger.error('CatalogService.load failed', err);
    } finally {
      this.isLoading.set(false);
    }
  }
}
