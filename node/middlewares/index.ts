import { getPromotionWithId } from './promotions/getPromotionWithId'
import { getAllPromotions } from './promotions/getAllPromotions'
import { validadePromotionId } from './promotions/validadePromotionId'

export const promotions = [
  validadePromotionId,
  getPromotionWithId,
  getAllPromotions,
]
