/* eslint-disable no-console */
import { validatePromotions } from './validatePromotions'

async function handlePromotions(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { ratesAndBenefits /* catalog */ },
    state: { code },
  } = ctx

  console.log('🚀 ~ handlePromotions ~ code:', code)

  const data = await ratesAndBenefits.getPromotionById(
    'd38eac5a-f2b3-410f-bc0b-f2211ede433b'
  )

  ctx.status = 200
  ctx.body = data
  await next()
}

export const promotions = [validatePromotions, handlePromotions]
