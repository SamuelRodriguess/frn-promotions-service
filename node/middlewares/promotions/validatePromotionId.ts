import { UserInputError } from '@vtex/api'
import validator from 'validator'

import { handleVtexError } from '../../utils'

export async function validatePromotionId(
  ctx: Context,
  next: () => Promise<void>
) {
  try {
    const promotionId = ctx.query.id?.toString() ?? null

    if (typeof promotionId === 'string' && !validator.isUUID(promotionId)) {
      throw new UserInputError('Invalid idCalculatorConfiguration format')
    }

    ctx.state.id = promotionId
    await next()
  } catch (err) {
    handleVtexError(ctx, err)
  }
}
