import { handleVtexError } from '../../utils'
import { createPromotionService } from '../../services'

export async function getPromotionWithId(
  ctx: Context,
  next: () => Promise<void>
) {
  try {
    const {
      clients: { ratesAndBenefits },
      vtex: { logger },
      state: { id },
    } = ctx

    if (!id) {
      return next()
    }

    const promotionService = createPromotionService(ratesAndBenefits, logger)
    const promotion = await promotionService.findPromotionById(id)

    ctx.status = 200
    ctx.body = promotion ? [promotion] : []
  } catch (err) {
    handleVtexError(ctx, err)
  }
}
