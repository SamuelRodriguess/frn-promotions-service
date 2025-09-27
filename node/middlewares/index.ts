import { getPromotionWithId } from './promotions/getPromotionWithId'
import { getAllPromotions } from './promotions/getAllPromotions'
import { validatePromotionId } from './promotions/validatePromotionId'

export const promotions = [
  validatePromotionId,
  getPromotionWithId,
  getAllPromotions,
]
