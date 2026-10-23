import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { MenuItem } from './cart.service';

export interface Category {
  id: string;
  name: string;
  subtitle?: string;
  icon: string;
  image: string;
  items: MenuItem[];
}

const MOCK_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'L',
    subtitle: '{Category 1 Subtitle}',
    icon: 'category',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800',
    items: Array.from({ length: 4 }, (_, i) => ({
      id: `C1-${i + 1}`,
      name: `{Item Name 1.${i + 1}}`,
      price: `{Price Label}`,
      description: `{Generic description of the category 1 item. Explain its purpose or key characteristics.}`,
      image: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop`
    }))
  },
  {
    id: '2',
    name: 'K',
    subtitle: '{Category 2 Subtitle}',
    icon: 'widgets',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800',
    items: Array.from({ length: 4 }, (_, i) => ({
      id: `C2-${i + 1}`,
      name: `{Item Name 2.${i + 1}}`,
      price: `{Price Label}`,
      description: `{Generic description of the category 2 item. Explain its use or benefits.}`,
      image: `https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop`
    }))
  },
  {
    id: '3',
    name: 'O',
    subtitle: '{Category 3 Subtitle}',
    icon: 'layers',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800',
    items: Array.from({ length: 4 }, (_, i) => ({
      id: `C3-${i + 1}`,
      name: `{Item Name 3.${i + 1}}`,
      price: `{Price Label}`,
      description: `{Generic description of the category 3 item. Detail its functionality or technical characteristics.}`,
      image: `https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop`
    }))
  },
  {
    id: '4',
    name: 'S',
    subtitle: '{Category 4 Subtitle}',
    icon: 'extension',
    image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=800',
    items: Array.from({ length: 4 }, (_, i) => ({
      id: `C4-${i + 1}`,
      name: `{Item Name 4.${i + 1}}`,
      price: `{Price Label}`,
      description: `{Generic description of the category 4 item. Provide additional or technical details.}`,
      image: `https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=800&auto=format&fit=crop`
    }))
  }
];

/**
 * Owns the product/category catalog shown throughout the app.
 *
 * Ships with in-memory placeholder data so the template works out of
 * the box. Set `environment.useMockData = false` and point
 * `environment.apiBaseUrl` at a real API to switch to live HTTP calls —
 * no component changes required, since everything reads from the
 * `categories` signal either way.
 */
@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);

  /** Full catalog, grouped by category. Source of truth for the UI. */
  categories = signal<Category[]>(environment.useMockData ? MOCK_CATEGORIES : []);

  /** True while a catalog fetch is in flight. Bind a spinner/skeleton to this. */
  isLoading = signal(false);

  /** Set if the last fetch failed; `null` when there's no active error. */
  error = signal<string | null>(null);

  constructor() {
    if (!environment.useMockData) {
      this.fetchCategories();
    }
  }

  /**
   * Loads the catalog from the API (or returns the bundled mock data
   * when `environment.useMockData` is true). Updates `categories`,
   * `isLoading` and `error`. Safe to call again to refresh/retry.
   */
  async fetchCategories(): Promise<void> {
    if (environment.useMockData) {
      this.categories.set(MOCK_CATEGORIES);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<Category[]>(`${environment.apiBaseUrl}/categories`)
      );
      this.categories.set(data);
    } catch (err) {
      this.error.set('Could not load the catalog. Please try again.');
      console.error('[MenuService] fetchCategories failed:', err);
    } finally {
      this.isLoading.set(false);
    }
  }
}
