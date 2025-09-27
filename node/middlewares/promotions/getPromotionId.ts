import { UserInputError } from '@vtex/api'
import validator from 'validator'

import { handleVtexError } from '../../utils'

export async function getPromotionId(ctx: Context, next: () => Promise<void>) {
  try {
    const {
      vtex: {
        route: { params: id },
      },
    } = ctx

    if (typeof id !== 'string') {
      throw new UserInputError('idCalculatorConfiguration must be a string')
    }

    if (!validator.isUUID(id)) {
      throw new UserInputError('Invalid idCalculatorConfiguration format')
    }

    ctx.state.id = id
    await next()
  } catch (err) {
    handleVtexError(ctx, err)
  }
}
