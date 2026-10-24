import { Pipe, PipeTransform, inject } from '@angular/core';
import { SiteService } from '../services/site.service';
import { formatPrice } from './price';

/**
 * `{{ item.price | appPrice: currency : locale }}` — formats a numeric price
 * with the active locale and currency.
 *
 * Currency and locale are passed as arguments on purpose: when the demo
 * switches preset, the arguments change and Angular re-runs the pure pipe.
 * Omitting them falls back to the current site identity.
 */
@Pipe({ name: 'appPrice', standalone: true })
export class PricePipe implements PipeTransform {
  private site = inject(SiteService);

  transform(
    value: number | null | undefined,
    currency = this.site.identity().currency,
    locale = this.site.identity().locale,
  ): string {
    return formatPrice(value, currency, locale);
  }
}
