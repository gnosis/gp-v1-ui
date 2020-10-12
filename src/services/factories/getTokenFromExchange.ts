import Web3 from 'web3'

import { TokenDetails } from 'types'
import { getToken } from 'utils'

import { Erc20Api } from 'api/erc20/Erc20Api'
import { ExchangeApi } from 'api/exchange/ExchangeApi'
import { TokenList } from 'api/tokenList/TokenListApi'
import { TokenFromErc20Params } from './'
import { safeTokenName, TokenErc20 } from '@gnosis.pm/dex-js'

interface FactoryParams {
  tokenListApi: TokenList
  exchangeApi: ExchangeApi
  erc20Api: Erc20Api
  web3: Web3
  getTokenFromErc20(params: TokenFromErc20Params): Promise<TokenErc20 | null>
}

interface GetByAddressParams {
  networkId: number
  tokenAddress: string
}

export enum TokenFromExchange {
  FROM_TOKEN_LIST = 'FROM TOKEN LIST',
  NOT_REGISTERED_ON_CONTRACT = 'NOT REGISTERED ON CONTRACT',
  NOT_IN_TOKEN_LIST = 'NOT IN TOKEN LIST',
  NOT_ERC20 = 'NOT ERC20',
}

export interface TokenFromExchangeResult {
  token: TokenDetails | null
  reason: TokenFromExchange
}

/**
 * Factory of getTokenFromExchangeByAddress
 * Takes as input API instances
 * Returns async function to fetch TokenDetails by address
 */
function getTokenFromExchangeByAddressFactory(
  factoryParams: FactoryParams,
): (params: GetByAddressParams) => Promise<TokenFromExchangeResult> {
  const { tokenListApi, exchangeApi, getTokenFromErc20 } = factoryParams

  return async ({ networkId, tokenAddress }: GetByAddressParams): Promise<TokenFromExchangeResult> => {
    const tokens = tokenListApi.getTokens(networkId)

    // Try from our current list of tokens, by address
    let token = getToken('address', tokenAddress, tokens)
    if (token) {
      return {
        token,
        reason: TokenFromExchange.FROM_TOKEN_LIST,
      }
    }

    let tokenId: number
    try {
      tokenId = await exchangeApi.getTokenIdByAddress({ tokenAddress, networkId })
    } catch (e) {
      console.error(
        '[services:factories:getTokenFromExchange] Token with address %s not registered on contract',
        tokenAddress,
        e,
      )
      return {
        token: null,
        reason: TokenFromExchange.NOT_REGISTERED_ON_CONTRACT,
      }
    }

    // Try from our current list of tokens, by id
    token = getToken('id', tokenId, tokens)
    if (token) {
      return {
        token: { ...token, address: tokenAddress },
        reason: TokenFromExchange.FROM_TOKEN_LIST,
      }
    }

    // Not there, get it from the ERC20 contract
    const erc20token = await getTokenFromErc20({ tokenAddress, networkId })
    if (erc20token) {
      token = {
        ...erc20token,
        id: tokenId,
        label: safeTokenName(erc20token),
      }
    }

    if (token) {
      return {
        token,
        reason: TokenFromExchange.NOT_IN_TOKEN_LIST,
      }
    }

    return {
      token: null,
      reason: TokenFromExchange.NOT_ERC20,
    }
  }
}

export interface GetByIdParams {
  networkId: number
  tokenId: number
}

/**
 * Factory of getTokenFromExchangeById
 * Takes as input API instances
 * Returns async function to fetch TokenDetails by id
 */
function getTokenFromExchangeByIdFactory(
  factoryParams: FactoryParams,
): (params: GetByIdParams) => Promise<TokenDetails | null> {
  const { tokenListApi, exchangeApi, getTokenFromErc20 } = factoryParams

  return async ({ tokenId, networkId }: GetByIdParams): Promise<TokenDetails | null> => {
    // Grab token list: either TCR or default token list
    // if default token list is used, IDs need to be updated first
    // or app will see strange data as wrong token IDs from config token list will be used
    const tokens = tokenListApi.getTokens(networkId)
    // this will always return the initial config list first as it is injected
    // early in the TokenListAPI constructor
    // render 1: config list with incorrect IDs
    // render 2: updated token list with correct IDs

    // Try from our current list of tokens, by id
    let token = getToken('id', tokenId, tokens)
    if (token) {
      return token
    }

    // Not there, get the address from the contract
    let tokenAddress: string
    try {
      tokenAddress = await exchangeApi.getTokenAddressById({ tokenId, networkId })
    } catch (e) {
      console.error('[services:factories:getTokenFromExchange] Token with id %d not registered on contract', tokenId, e)
      return null
    }

    // Try again from our current list of tokens, by address
    token = getToken('address', tokenAddress, tokens)
    if (token) {
      return { ...token, id: tokenId }
      // TODO: update token list with new id?
    }

    // Not there, get it from the ERC20 contract
    const erc20token = await getTokenFromErc20({ tokenAddress, networkId })
    if (erc20token) {
      return {
        ...erc20token,
        id: tokenId,
        label: safeTokenName(erc20token),
      }
    }

    return null
  }
}

export { getTokenFromExchangeByAddressFactory, getTokenFromExchangeByIdFactory }
