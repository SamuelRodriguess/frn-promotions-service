import type { CalculatorConfiguration } from '@vtex/clients'

import { PromotionService, createPromotionService } from '../services'

const promotionFactory = (
  id: string,
  overrides: Partial<CalculatorConfiguration> = {}
): CalculatorConfiguration =>
  ({
    idCalculatorConfiguration: id,
    name: `Promotion ${id}`,
    beginDateUtc: undefined,
    endDateUtc: undefined,
    conditionsIds: [],
    products: [],
    collections: [],
    categories: [],
    ...overrides,
  } as CalculatorConfiguration)

const buildClient = () => ({
  getAllBenefits: jest.fn(),
  getPromotionById: jest.fn(),
})

describe('PromotionService', () => {
  it('deduplicates ids and returns only non-expired promotions', async () => {
    const client = buildClient()
    const today = new Date('2024-01-01T00:00:00.000Z')

    client.getAllBenefits.mockResolvedValue({
      items: [
        { idCalculatorConfiguration: 'promo-1' },
        { idCalculatorConfiguration: 'promo-1' },
        { idCalculatorConfiguration: 'promo-2' },
      ],
    })

    client.getPromotionById.mockImplementation((id: string) =>
      Promise.resolve(
        promotionFactory(id, {
          endDateUtc: id === 'promo-2' ? '2023-12-31T23:59:59.000Z' : undefined,
        })
      )
    )

    const service = new PromotionService(
      (client as unknown) as Context['clients']['ratesAndBenefits']
    )

    const promotions = await service.listValidPromotions({
      referenceDate: today,
    })

    expect(promotions).toHaveLength(1)
    expect(promotions[0].id).toBe('promo-1')
    expect(client.getPromotionById).toHaveBeenCalledTimes(2)
    expect(client.getPromotionById).toHaveBeenCalledWith('promo-1')
    expect(client.getPromotionById).toHaveBeenCalledWith('promo-2')
  })

  it('skips rejected promotions and logs warning', async () => {
    const client = buildClient()
    const logger = { warn: jest.fn() }

    client.getAllBenefits.mockResolvedValue({
      items: [
        { idCalculatorConfiguration: 'promo-1' },
        { idCalculatorConfiguration: 'promo-2' },
      ],
    })

    client.getPromotionById.mockImplementation((id: string) => {
      if (id === 'promo-2') {
        return Promise.reject(new Error('VTEX 500'))
      }

      return Promise.resolve(promotionFactory(id))
    })

    const service = createPromotionService(
      (client as unknown) as Context['clients']['ratesAndBenefits'],
      (logger as unknown) as Context['vtex']['logger']
    )

    const promotions = await service.listValidPromotions()

    expect(promotions).toHaveLength(1)
    expect(promotions[0].id).toBe('promo-1')
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'promotion-fetch-failed',
        promotionId: 'promo-2',
      })
    )
  })

  it('returns null when promotion is expired', async () => {
    const client = buildClient()
    const referenceDate = new Date('2024-01-05T00:00:00.000Z')

    client.getPromotionById.mockResolvedValue(
      promotionFactory('promo-3', {
        endDateUtc: '2024-01-01T00:00:00.000Z',
      })
    )

    const service = createPromotionService(
      (client as unknown) as Context['clients']['ratesAndBenefits']
    )

    const promotion = await service.findPromotionById('promo-3', {
      referenceDate,
    })

    expect(promotion).toBeNull()
  })
})
