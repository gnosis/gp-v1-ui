import { Network, TokenApi, WalletApi, DepositApi, Erc20Api } from 'types'
import { WalletApiMock } from './WalletApi/WalletApiMock'
import { TokenApiImpl } from './TokenApi/TokenApiImpl'
import { Erc20ApiMock } from './Erc20Api/Erc20ApiMock'
import { DepositApiMock } from './ExchangeApi/mock/DepositApiMock'
import { balanceStates } from '../../test/data'

const isMock = process.env.MOCK === 'true'

function createWalletApi(): WalletApi {
  if (isMock) {
    return new WalletApiMock()
  } else {
    // TODO: Add actual implementation
    throw new Error('Not implemented yet. Only mock implementation available')
  }
}

function createTokenApi(): TokenApi {
  return new TokenApiImpl([Network.Mainnet, Network.Rinkeby])
}

function createErc20Api(): Erc20Api {
  return new Erc20ApiMock()
}

function createDepositApi(): DepositApi {
  if (isMock) {
    return new DepositApiMock({ balanceStates })
  } else {
    // TODO: Add actual implementation
    throw new Error('Not implemented yet. Only mock implementation available')
  }
}

// Build APIs
export const walletApi: WalletApi = createWalletApi()
export const tokenApi: TokenApi = createTokenApi()
export const erc20Api: Erc20Api = createErc20Api()
export const depositApi: DepositApi = createDepositApi()
