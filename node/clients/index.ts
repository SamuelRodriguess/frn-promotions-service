import { IOClients } from '@vtex/api'
import { RatesAndBenefits } from '@vtex/clients'

export class Clients extends IOClients {
  public get ratesAndBenefits(): RatesAndBenefits {
    return this.getOrSet('ratesAndBenefits', RatesAndBenefits)
  }
}
