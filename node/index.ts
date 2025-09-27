import type {
  ClientsConfig,
  ServiceContext,
  RecorderState,
  Cached,
} from '@vtex/api'
import { LRUCache, method, Service } from '@vtex/api'

import { Clients } from './clients'
import { promotions } from './middlewares/promotions/handlePromotions'

const TIMEOUT_MS = 8000

const memoryCache = new LRUCache<string, Cached>({ max: 5000 })

metrics.trackCache('promotions', memoryCache)

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 10,
      timeout: TIMEOUT_MS,
    },
    promotions: {
      memoryCache,
    },
  },
}

declare global {
  type Context = ServiceContext<Clients, State>
  interface State extends RecorderState {
    id: string | null
  }
}

export default new Service({
  clients,
  routes: {
    status: method({
      GET: promotions,
    }),
  },
})
