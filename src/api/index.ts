import { Network, TokenList, WalletApi, DepositApi, Erc20Api } from 'types'
import { WalletApiMock } from './wallet/WalletApiMock'
import { TokenListApiImpl } from './tokenList/TokenListApiImpl'
import { TokenListApiMock } from './tokenList/TokenListApiMock'
import { Erc20ApiMock } from './erc20/Erc20ApiMock'
import { DepositApiMock } from './exchange/DepositApiMock'
import { tokenList, exchangeBalanceStates, erc20Balances, erc20Allowances } from '../../test/data'

const isMock = process.env.MOCK === 'true'

function createWalletApi(): WalletApi {
  if (isMock) {
    return new WalletApiMock()
  } else {
    // TODO: Add actual implementation
    throw new Error('Not implemented yet. Only mock implementation available')
  }
}

function createTokenListApi(): TokenList {
  if (isMock) {
    return new TokenListApiMock(tokenList)
  } else {
    return new TokenListApiImpl([Network.Mainnet, Network.Rinkeby])
  }
}

function createErc20Api(): Erc20Api {
  return new Erc20ApiMock({ balances: erc20Balances, allowances: erc20Allowances })
}

function createDepositApi(erc20Api: Erc20Api): DepositApi {
  if (isMock) {
    return new DepositApiMock(exchangeBalanceStates, erc20Api)
  } else {
    // TODO: Add actual implementation
    throw new Error('Not implemented yet. Only mock implementation available')
  }
}

// Build APIs
export const walletApi: WalletApi = createWalletApi()
export const tokenListApi: TokenList = createTokenListApi()
export const erc20Api: Erc20Api = createErc20Api()
export const depositApi: DepositApi = createDepositApi(erc20Api)
