import { filteredPromotionIds, formattedPromotion } from '../../utils'

export async function getAllPromotions(
  ctx: Context,
  next: () => Promise<void>
) {
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

  ctx.status = 200
  ctx.body = allPromotionsResponse

  await next()
}
