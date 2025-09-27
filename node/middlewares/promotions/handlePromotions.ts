/* eslint-disable no-console */
import { getPromotionIds } from '../../utils/promotions'
import { getPromotionId } from './getPromotionId'

async function handlePromotions(ctx: Context, next: () => Promise<void>) {
  const {
    clients: { ratesAndBenefits },
    state: { id },
  } = ctx

  console.log('🚀 ~ handlePromotions ~ code:', id)

  const allPromotions = await ratesAndBenefits.getAllBenefits()
  const idsPromotions = getPromotionIds(allPromotions?.items)

  console.log('🚀 ~ handlePromotions ~ idsPromotions:', idsPromotions)

  const data = await ratesAndBenefits.getPromotionById(
    'd38eac5a-f2b3-410f-bc0b-f2211ede433b'
  )

  ctx.status = 200
  ctx.body = data
  await next()
}

export const promotions = [getPromotionId, handlePromotions]
