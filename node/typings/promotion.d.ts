/**
 * Canonical promotion representation consumed by the custom promotions route.
 */
export interface PromotionDTO {
  id: string
  name: string
  beginDate?: string | null
  endDate?: string | null
  conditions: string[]
  skus: string[]
  collections: string[]
  categories: string[]
}
