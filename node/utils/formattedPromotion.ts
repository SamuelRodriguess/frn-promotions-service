import type { CalculatorConfiguration } from '@vtex/clients'

import type { PromotionDTO } from '../typings/promotion'

/**
 * Transforms VTEX `CalculatorConfiguration` into the canonical promotion payload used by the service.
 */
export const formattedPromotion = (
  promotion: CalculatorConfiguration
): PromotionDTO => {
  const formatted: PromotionDTO = {
    id: promotion.idCalculatorConfiguration ?? '',
    name: promotion.name,
    beginDate: promotion.beginDateUtc,
    endDate: promotion.endDateUtc,
    conditions: promotion.conditionsIds ?? [],
    skus: promotion.products ?? [],
    collections: promotion.collections ?? [],
    categories: promotion.categories ?? [],
  }

  return formatted
}
