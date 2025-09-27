import { IOClients } from '@vtex/api'
import { RatesAndBenefits, Catalog } from '@vtex/clients'

export class Clients extends IOClients {
  public get ratesAndBenefits(): RatesAndBenefits {
    return this.getOrSet('ratesAndBenefits', RatesAndBenefits)
  }

  public get catalog(): Catalog {
    return this.getOrSet('catalog', Catalog)
  }
}
