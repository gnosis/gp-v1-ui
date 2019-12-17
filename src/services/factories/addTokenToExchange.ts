import Web3 from 'web3'

import { ExchangeApi, Erc20Api } from 'types'
import { log, getImageUrl } from 'utils'

import { getErc20Info } from '../helpers'

interface Params {
  exchangeApi: ExchangeApi
  erc20Api: Erc20Api
  web3: Web3
}

/**
 * Factory of addTokenToExchange
 * Takes as input API instances
 * Returns async function to add tokenAddress to exchange
 */
export function addTokenToExchangeFactory(factoryParams: Params): (tokenAddress: string) => Promise<boolean> {
  const { exchangeApi } = factoryParams

  return async (tokenAddress: string): Promise<boolean> => {
    const erc20Info = getErc20Info({ ...factoryParams, tokenAddress })

    if (!erc20Info) {
      // TODO: I'm forbidding, but should it be allowed to use tokens without decimals for example?
      log('Cannot add token (%s) to exchange with missing details', tokenAddress)
      return false
    }

    try {
      await exchangeApi.addToken(tokenAddress)
    } catch (e) {
      log('Failed to add token (%s) to exchange', tokenAddress)
      return false
    }

    try {
      const id = exchangeApi.getTokenIdByAddress(tokenAddress)

      const token = {
        ...erc20Info,
        id,
        image: getImageUrl(tokenAddress),
      }

      // TODO: cache new token
      log('new token: ', token)
    } catch (e) {
      log('Failed to add new token (%s) to local list of tokens', tokenAddress, e)
      return false
    }

    return true
  }
}
