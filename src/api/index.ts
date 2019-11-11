import { Network, TokenList, WalletApi, DepositApi, Erc20Api, ExchangeApi } from 'types'
import { WalletApiMock } from './wallet/WalletApiMock'
import WalletApiImpl from './wallet/WalletApiImpl'
import { TokenListApiImpl } from './tokenList/TokenListApiImpl'
import { TokenListApiMock } from './tokenList/TokenListApiMock'
import { Erc20ApiMock } from './erc20/Erc20ApiMock'
import { DepositApiMock } from './exchange/DepositApiMock'
import { ExchangeApiMock } from './exchange/ExchangeApiMock'
import { tokenList, exchangeBalanceStates, erc20Balances, erc20Allowances, FEE_TOKEN } from '../../test/data'

const isMock = process.env.MOCK === 'true'
const isWalletMock = process.env.MOCK_WALLET === 'true'
const isTokenListMock = process.env.MOCK_TOKEN_LIST === 'true'
const isErc20Mock = process.env.MOCK_ERC20 === 'true'
const isDepositMock = process.env.MOCK_DEPOSIT === 'true'

function createWalletApi(): WalletApi {
  let walletApi
  if (isWalletMock) {
    walletApi = new WalletApiMock()
  } else {
    walletApi = new WalletApiImpl()
  }
  window['walletApi'] = walletApi // register for convenience
  return walletApi
}

function createTokenListApi(): TokenList {
  let tokenListApi
  if (isTokenListMock) {
    tokenListApi = new TokenListApiMock(tokenList)
  } else {
    tokenListApi = new TokenListApiImpl([Network.Mainnet, Network.Rinkeby])
  }
  window['tokenListApi'] = tokenListApi // register for convenience
  return tokenListApi
}

function createErc20Api(): Erc20Api {
  let erc20Api
  if (isErc20Mock) {
    erc20Api = new Erc20ApiMock({ balances: erc20Balances, allowances: erc20Allowances })
    window['erc20Api'] = erc20Api // register for convenience
  } else {
    // TODO: Add actual implementation
    throw new Error('Not implemented yet. Only mock implementation available')
  }
  return erc20Api
}

function createDepositApi(erc20Api: Erc20Api): DepositApi {
  let depositApi
  if (isDepositMock) {
    depositApi = new DepositApiMock(exchangeBalanceStates, erc20Api)
    window['depositApi'] = depositApi // register for convenience
  } else {
    // TODO: Add actual implementation
    throw new Error('Not implemented yet. Only mock implementation available')
  }
  return depositApi
}

function createExchangeApi(erc20Api: Erc20Api): ExchangeApi {
  if (isMock) {
    const tokens = [FEE_TOKEN, ...tokenList.map(token => token.address)]
    const exchangeApi = new ExchangeApiMock(exchangeBalanceStates, erc20Api, tokens)
    window['exchangeApi'] = exchangeApi
    return exchangeApi
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
export const exchangeApi: ExchangeApi = createExchangeApi(erc20Api)
