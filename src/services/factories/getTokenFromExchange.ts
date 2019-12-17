import Web3 from 'web3'

import { Erc20Api, TokenDetails, TokenList, ExchangeApi } from 'types'
import { getImageUrl, log, getToken } from 'utils'

import { getErc20Info } from '../helpers'

interface TokenFromErc20Params {
  tokenAddress: string
  tokenId: number
  erc20Api: Erc20Api
  web3: Web3
}

async function getTokenFromErc20(params: TokenFromErc20Params): Promise<TokenDetails | null> {
  const { tokenAddress, tokenId } = params

  // Get base info from the ERC20 contract
  const erc20Info = await getErc20Info(params)
  if (!erc20Info) {
    log('Could not get details for token token (%s)', tokenAddress)
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

/**
 * Factory of getTokenFromExchangeByAddress
 * Takes as input API instances
 * Returns async function to fetch TokenDetails by address
 */
function getTokenFromExchangeByAddressFactory(
  factoryParams: FactoryParams,
): (params: GetByAddressParams) => Promise<TokenDetails | null> {
  const { tokenListApi, exchangeApi } = factoryParams

  return async ({ networkId, tokenAddress }: GetByAddressParams): Promise<TokenDetails | null> => {
    const tokens = tokenListApi.getTokens(networkId)

    // Try from our current list of tokens, by address
    let token = getToken('address', tokenAddress, tokens)
    if (token) {
      return token
    }

    let tokenId: number
    try {
      tokenId = await exchangeApi.getTokenIdByAddress(tokenAddress)
    } catch (e) {
      log('Token with address %s not registered on contract', tokenAddress, e)
      return null
    }

    // Try from our current list of tokens, by id
    token = getToken('id', tokenId, tokens)
    if (token) {
      return { ...token, address: tokenAddress }
    }

    // Not there, get it from the ERC20 contract
    return getTokenFromErc20({ ...factoryParams, tokenAddress, tokenId })
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
      tokenAddress = await exchangeApi.getTokenAddressById(tokenId)
    } catch (e) {
      log('Token with id %d not registered on contract', tokenId, e)
      return null
    }

    // Try again from our current list of tokens, by address
    token = getToken('address', tokenAddress, tokens)
    if (token) {
      return { ...token, id: tokenId }
      // TODO: update token list with new id?
    }

    // Not there, get it from the ERC20 contract
    return getTokenFromErc20({ ...factoryParams, tokenId, tokenAddress })
  }
}

export { getTokenFromExchangeByAddressFactory, getTokenFromExchangeByIdFactory }
