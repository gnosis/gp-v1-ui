import { Network, TokenApi, WalletApi, DepositApi } from 'types'
import { WalletApiMock } from './WalletApi/WalletApiMock'
import { TokenApiImpl } from './TokenApi/TokenApiImpl'
import { DepositApiMock } from './ExchangeApi/mock/DepositApiMock'
import { balanceStates } from '../../test/data'

const isMock = process.env.MOCK === 'true'

function createTokenApi(): TokenApi {
  return new TokenApiImpl([Network.Mainnet, Network.Rinkeby])
}

function createWalletApi(): WalletApi {
  if (isMock) {
    return new WalletApiMock()
  } else {
    throw new Error('Only has been implemented')
  }
}

function createDepositApi(): DepositApi {
  if (isMock) {
    return new DepositApiMock({ balanceStates })
  } else {
    throw new Error('Only has been implemented')
  }
}

// Build APIs
export const walletApi = createWalletApi()
export const tokenApi = createTokenApi()
export const depositApi = createDepositApi()
