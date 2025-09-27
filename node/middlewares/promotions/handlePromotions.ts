/* eslint-disable no-console */
import { validatePromotions } from './validatePromotions'

async function handlePromotions(ctx: Context, next: () => Promise<void>) {
  const { ratesAndBenefits } = ctx.clients

  const benefits = await ratesAndBenefits.getAllBenefits('AUTH_TOKEN')

  console.log('🚀 ~ handleBenefits ~ benefits:', benefits)
  console.log('🚀 ~ ctx state:', ctx.state.code)

  ctx.status = 200
  ctx.body = benefits
  await next()
}

export const promotions = [validatePromotions, handlePromotions]
