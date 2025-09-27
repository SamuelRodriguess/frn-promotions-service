import { formattedPromotion } from '../../utils'

export async function getPromotionById(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    clients: { ratesAndBenefits },
    state: { id },
  } = ctx

  if (!id) {
    return next()
  }

  const promotion = await ratesAndBenefits.getPromotionById(id)

  ctx.status = 200
  ctx.body = formattedPromotion(promotion)
}
