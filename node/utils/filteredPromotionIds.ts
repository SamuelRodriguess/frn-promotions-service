import type { GetAllBenefitsResponseItem } from '@vtex/clients/build/typings/ratesAndBenefits'

/**
 * Collects valid promotion ids from a list of rate and benefits.
 *
 * @param promotions - VTEX Rates & Benefits items to inspect.
 * @returns Array containing only non-empty, unique `idCalculatorConfiguration` values.
 */
export const filteredPromotionIds = (
  promotions?: GetAllBenefitsResponseItem[]
): string[] => {
  if (!Array.isArray(promotions)) {
    return []
  }

  const ids = promotions
    .map((promotion) => promotion.idCalculatorConfiguration)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)

  return Array.from(new Set(ids))
}
