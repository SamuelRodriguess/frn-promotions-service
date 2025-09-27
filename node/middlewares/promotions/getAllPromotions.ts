import {
  filteredPromotionIds,
  formattedPromotion,
  handleVtexError,
  isPromotionExpired,
} from '../../utils'

export async function getAllPromotions(
  ctx: Context,
  next: () => Promise<void>
) {
  try {
    const {
      clients: { ratesAndBenefits },
    } = ctx

    const allPromotions = await ratesAndBenefits.getAllBenefits()
    const promotionIds = filteredPromotionIds(allPromotions?.items)

    const detailsPromotions = await Promise.all(
      promotionIds.map((promotionId) =>
        ratesAndBenefits.getPromotionById(promotionId)
      )
    )

    const allPromotionsResponse = detailsPromotions.map(formattedPromotion)

    const validPromotions = allPromotionsResponse.filter(
      (promotion) => !isPromotionExpired(promotion)
    )

    ctx.status = 200
    ctx.body = validPromotions

    await next()
  } catch (err) {
    handleVtexError(ctx, err)
  }
}
