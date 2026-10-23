import { Pipe, PipeTransform } from '@angular/core';
import { formatPrice } from './price';

/**
 * `{{ item.price | appPrice }}` — formats a numeric price with the locale and
 * currency configured in `shared/copy.ts`.
 */
@Pipe({ name: 'appPrice', standalone: true })
export class PricePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatPrice(value);
  }
}
