import type { GetAllBenefitsResponseItem } from '@vtex/clients/build/typings/ratesAndBenefits'

export const getPromotionIds = (
  promotions?: GetAllBenefitsResponseItem[]
): string[] => {
  if (!Array.isArray(promotions)) {
    return []
  }

  return promotions
    .map((promotion) => promotion.idCalculatorConfiguration)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
}
