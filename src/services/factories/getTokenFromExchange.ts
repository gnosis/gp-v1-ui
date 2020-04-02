import Web3 from 'web3'

import { TokenDetails } from 'types'
import { getImageUrl, logDebug, getToken } from 'utils'

import { getErc20Info } from '../helpers'
import { Erc20Api } from 'api/erc20/Erc20Api'
import { ExchangeApi } from 'api/exchange/ExchangeApi'
import { TokenList } from 'api/tokenList/TokenListApi'

interface TokenFromErc20Params {
  tokenAddress: string
  tokenId: number
  networkId: number
  erc20Api: Erc20Api
  web3: Web3
}

async function getTokenFromErc20(params: TokenFromErc20Params): Promise<TokenDetails | null> {
  const { tokenAddress, tokenId } = params

  // Get base info from the ERC20 contract
  const erc20Info = await getErc20Info(params)
  if (!erc20Info) {
    logDebug('[services:factories:getTokenFromExchange] Could not get details for token token (%s)', tokenAddress)
    return null
  }

  const token = {
    ...erc20Info,
    id: tokenId,
    image: getImageUrl(tokenAddress),
  }

  // TODO: cache it

  return token
}

interface FactoryParams {
  tokenListApi: TokenList
  exchangeApi: ExchangeApi
  erc20Api: Erc20Api
  web3: Web3
}

interface GetByAddressParams {
  networkId: number
  tokenAddress: string
}

export const enum TokenFromExchange {
  FROM_TOKEN_LIST = 'FROM TOKEN LIST',
  NOT_REGISTERED_ON_CONTRACT = 'NOT REGISTERED ON CONTRACT',
  UNREGISTERED_ERC20 = 'UNREGISTERED ERC20',
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
  const { tokenListApi, exchangeApi } = factoryParams

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
    token = (await getTokenFromErc20({ ...factoryParams, tokenAddress, tokenId, networkId })) || undefined
    if (token) {
      return {
        token,
        reason: TokenFromExchange.UNREGISTERED_ERC20,
      }
    }

    return {
      token: null,
      reason: TokenFromExchange.NOT_ERC20,
    }
  }
}

interface GetByIdParams {
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
  const { tokenListApi, exchangeApi } = factoryParams

  return async ({ tokenId, networkId }: GetByIdParams): Promise<TokenDetails | null> => {
    const tokens = tokenListApi.getTokens(networkId)

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
    return getTokenFromErc20({ ...factoryParams, tokenId, tokenAddress, networkId })
  }
}

export { getTokenFromExchangeByAddressFactory, getTokenFromExchangeByIdFactory }
