import type { PromotionDTO } from '../typings/promotion'

/**
 * Checks if a promotion's end date is in the past relative to a reference date.
 *
 * @param promotion - Canonical promotion payload.
 * @param referenceDate - Date used to compare with the promotion end date. Defaults to now.
 */
export const isPromotionExpired = (
  promotion: PromotionDTO,
  referenceDate: Date = new Date()
): boolean => {
  if (!promotion.endDate) {
    return false
  }

  const endDate = new Date(promotion.endDate)

  // eslint-disable-next-line no-restricted-globals
  if (isNaN(endDate.getTime())) {
    return false // invalid date, treat as not expired
  }

  return endDate.getTime() < referenceDate.getTime()
}
