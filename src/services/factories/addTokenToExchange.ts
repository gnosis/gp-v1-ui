import Web3 from 'web3'

import { logDebug, getImageUrl } from 'utils'

import { getErc20Info } from '../helpers'
import { ExchangeApi } from 'api/exchange/ExchangeApi'
import { Erc20Api } from 'api/erc20/Erc20Api'
import { TokenDetails } from 'types'

interface Params {
  exchangeApi: ExchangeApi
  erc20Api: Erc20Api
  web3: Web3
}

interface AddTokenToExchangeParams {
  userAddress: string
  tokenAddress: string
  networkId: number
}

/**
 * Factory of addTokenToExchange
 * Takes as input API instances
 * Returns async function to add tokenAddress to exchange
 */
export function addTokenToExchangeFactory(
  factoryParams: Params,
): (params: AddTokenToExchangeParams) => Promise<TokenDetails | null> {
  const { exchangeApi } = factoryParams

  return async ({ userAddress, tokenAddress, networkId }: AddTokenToExchangeParams): Promise<TokenDetails | null> => {
    const erc20Info = await getErc20Info({ ...factoryParams, tokenAddress, networkId })

    if (!erc20Info) {
      logDebug('[services:factories:addTokenToExchange] Address %s does not contain a valid ERC20 token', tokenAddress)
      return null
    }

    try {
      await exchangeApi.addToken({ userAddress, tokenAddress, networkId })
    } catch (e) {
      console.error('[services:factories:addTokenToExchange] Failed to add token (%s) to exchange', tokenAddress)
      return null
    }

    // TODO: I guess we might want to return the token and leave the proxy/cache layer to deal with it.
    // Revisit once we add it to the interface
    try {
      const id = await exchangeApi.getTokenIdByAddress({ tokenAddress, networkId })

      const token: TokenDetails = {
        ...erc20Info,
        id,
        image: getImageUrl(tokenAddress),
      }

      // TODO: cache new token
      logDebug('[services:factories:addTokenToExchange] New token: ', token)
      return token
    } catch (e) {
      console.error(
        '[services:factories:addTokenToExchange] Failed to add new token (%s) to local list of tokens',
        tokenAddress,
        e,
      )
      return null
    }
  }
}
