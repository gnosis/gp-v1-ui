import { Network, TokenApi, DepositApi } from 'types'
import { TokenApiImpl } from './TokenApi/TokenApiImpl'
import { DepositApiMock } from './ExchangeApi/mock/DepositApiMock'
import balanceStates from '../../test/data/balanceStates'

const isMock = process.env.MOCK === 'true'

function createTokenApi(): TokenApi {
  return new TokenApiImpl([Network.Mainnet, Network.Rinkeby])
}

function createDepositApi(): DepositApi {
  if (true || isMock) {
    return new DepositApiMock({ balanceStates })
  } else {
    throw new Error('Only has been implemented')
  }
}

// Build APIs
export const tokenApi = createTokenApi()
export const depositApi = createDepositApi()
