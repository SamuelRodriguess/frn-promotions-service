import {
  formattedPromotion,
  handleVtexError,
  isPromotionExpired,
} from '../../utils'

export async function getPromotionWithId(
  ctx: Context,
  next: () => Promise<void>
) {
  try {
    const {
      clients: { ratesAndBenefits },
      state: { id },
    } = ctx

    if (!id) {
      return next()
    }

    const promotionData = await ratesAndBenefits.getPromotionById(id)

    const promotionAtArray = Array(formattedPromotion(promotionData))

    const validPromotion = promotionAtArray.filter(
      (promotion) => !isPromotionExpired(promotion)
    )

    ctx.status = 200
    ctx.body = validPromotion
  } catch (err) {
    handleVtexError(ctx, err)
  }
}
