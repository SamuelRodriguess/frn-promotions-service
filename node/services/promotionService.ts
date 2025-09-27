import {
  filteredPromotionIds,
  formattedPromotion,
  isPromotionExpired,
} from '../utils'
import type { PromotionDTO } from '../typings/promotion'

type RatesAndBenefitsClient = Context['clients']['ratesAndBenefits']
type Logger = Context['vtex']['logger']

interface PromotionServiceOptions {
  referenceDate?: Date
}

const isFulfilled = <T>(
  result: PromiseSettledResult<T>
): result is PromiseFulfilledResult<T> => result.status === 'fulfilled'

export class PromotionService {
  private readonly client: RatesAndBenefitsClient
  private readonly logger?: Logger

  constructor(client: RatesAndBenefitsClient, logger?: Logger) {
    this.client = client
    this.logger = logger
  }

  public async listValidPromotions(
    options: PromotionServiceOptions = {}
  ): Promise<PromotionDTO[]> {
    const referenceDate = options.referenceDate ?? new Date()
    const allPromotions = await this.client.getAllBenefits()
    const promotionIds = filteredPromotionIds(allPromotions?.items)

    const settledPromotions = await Promise.allSettled(
      promotionIds.map((promotionId) =>
        this.client
          .getPromotionById(promotionId)
          .then((promotion) => ({ promotionId, promotion }))
      )
    )

    return settledPromotions.reduce<PromotionDTO[]>((acc, result, index) => {
      if (isFulfilled(result)) {
        const dto = formattedPromotion(result.value.promotion)

        if (!isPromotionExpired(dto, referenceDate)) {
          acc.push(dto)
        }

        return acc
      }

      this.logger?.warn({
        message: 'promotion-fetch-failed',
        promotionId: promotionIds[index],
        error: result.reason,
      })

      return acc
    }, [])
  }

  public async findPromotionById(
    id: string,
    options: PromotionServiceOptions = {}
  ): Promise<PromotionDTO | null> {
    const referenceDate = options.referenceDate ?? new Date()
    const promotion = await this.client.getPromotionById(id)
    const formatted = formattedPromotion(promotion)

    if (isPromotionExpired(formatted, referenceDate)) {
      return null
    }

    return formatted
  }
}

export const createPromotionService = (
  client: RatesAndBenefitsClient,
  logger?: Logger
): PromotionService => new PromotionService(client, logger)
