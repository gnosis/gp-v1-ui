import BigNumber from 'bignumber.js'
import { assert, ONE_BIG_NUMBER } from '@gnosis.pm/dex-js'

import { TheGraphApi } from 'api/thegraph/TheGraphApi'
import { TokenList } from 'api/tokenList/TokenListApi'
import { Network } from 'types'

export interface GetPriceParams {
  baseTokenId: number
  quoteTokenId: number
}

export function getPriceEstimationFactory(factoryParams: {
  theGraphApi: TheGraphApi
  tokenListApi: TokenList
}): (params: GetPriceParams) => Promise<BigNumber | null> {
  const { theGraphApi, tokenListApi } = factoryParams

  // Only make sense to fetch prices for mainnet, thus we won't accept networkId parameter on this service
  const networkId = Network.Mainnet

  const tokenIdsSet = new Set(tokenListApi.getTokens(networkId).map(token => token.id))
  const tokenIds = Array.from(tokenIdsSet).sort()

  /**
   * Given a tokenId, checked whether it's already in our list.
   * Returns true if tokenId was added to the list and it requires sorting
   */
  function addTokenId(tokenId: number): boolean {
    if (!tokenIdsSet.has(tokenId)) {
      tokenIdsSet.add(tokenId)

      tokenIds.push(tokenId)

      return true
    }

    return false
  }

  return async (params: GetPriceParams): Promise<BigNumber | null> => {
    const { baseTokenId, quoteTokenId } = params

    assert(baseTokenId !== quoteTokenId, 'Token ids cannot be the equal')

    const baseTokenAdded = addTokenId(baseTokenId)
    const quoteTokenAdded = addTokenId(quoteTokenId)

    if (baseTokenAdded || quoteTokenAdded) {
      tokenIds.sort()
    }

    const prices = await theGraphApi.getPrices({ networkId, tokenIds })

    // OWL token is always tokenId == 0 on the contract
    // OWL price is always 1
    // All prices are given in terms of OWL
    const basePrice = baseTokenId === 0 ? ONE_BIG_NUMBER : prices[baseTokenId]
    const quotePrice = quoteTokenId === 0 ? ONE_BIG_NUMBER : prices[quoteTokenId]

    if (!basePrice || !quotePrice) {
      // there was never a trade for one of these tokens
      return null
    }

    return basePrice.dividedBy(quotePrice)
  }
}
