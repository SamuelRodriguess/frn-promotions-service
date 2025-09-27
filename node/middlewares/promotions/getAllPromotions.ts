import { handleVtexError } from '../../utils'
import { createPromotionService } from '../../services'

export async function getAllPromotions(
  ctx: Context,
  next: () => Promise<void>
) {
  try {
    const {
      clients: { ratesAndBenefits },
      vtex: { logger },
    } = ctx

    const promotionService = createPromotionService(ratesAndBenefits, logger)
    const validPromotions = await promotionService.listValidPromotions()

    ctx.status = 200
    ctx.body = validPromotions

    await next()
  } catch (err) {
    handleVtexError(ctx, err)
  }
}
