import { formattedPromotion, handleVtexError } from '../../utils'

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

    const promotion = await ratesAndBenefits.getPromotionById(id)

    ctx.status = 200
    ctx.body = formattedPromotion(promotion)
  } catch (err) {
    handleVtexError(ctx, err)
  }
}
