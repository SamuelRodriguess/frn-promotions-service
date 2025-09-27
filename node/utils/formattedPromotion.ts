import type { CalculatorConfiguration } from '@vtex/clients'

/**
 * Maps a calculator configuration to the fields required by the frontend.
 *
 * @param promotion - Raw calculator configuration returned by VTEX Rates & Benefits.
 * @returns Promotion object formatted for the frontend.
 */
export const formattedPromotion = (promotion: CalculatorConfiguration) => ({
  id: promotion.idCalculatorConfiguration ?? '',
  name: promotion.name,
  beginDate: promotion.beginDateUtc,
  endDate: promotion.endDateUtc,
  conditions: promotion.conditionsIds ?? [],
  skus: promotion.products ?? [],
  collections: promotion.collections ?? [],
  categories: promotion.categories ?? [],
})
