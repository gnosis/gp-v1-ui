import { ExchangeApi, Erc20Api } from 'types'
import { getErc20Info } from './getErc20Info'
import { log, getImageUrl } from 'utils'

interface Params {
  exchangeApi: ExchangeApi
  erc20Api: Erc20Api
}

/**
 * Factory of addTokenToExchange
 * Takes as input API instances
 * Returns async function to add tokenAddress to exchange
 */
export function addTokenToExchangeFactory({
  exchangeApi,
  erc20Api,
}: Params): (tokenAddress: string) => Promise<boolean> {
  return async (tokenAddress: string): Promise<boolean> => {
    const erc20Info = getErc20Info({ address: tokenAddress, erc20Api })

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
        address: tokenAddress,
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
