import BigNumber from 'bignumber.js'
import { assert } from '@gnosis.pm/dex-js'

import { ZERO_BIG_NUMBER } from 'const'

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
}): (params: GetPriceParams) => Promise<BigNumber> {
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

  return async (params: GetPriceParams): Promise<BigNumber> => {
    const { baseTokenId, quoteTokenId } = params

    assert(baseTokenId !== quoteTokenId, 'Token ids cannot be the equal')

    // As much as it'd be visually pleasing, cannot simplify it to a single expression
    // We need to execute both functions.
    let needsToSort = addTokenId(baseTokenId)
    needsToSort = addTokenId(quoteTokenId) || needsToSort

    if (needsToSort) {
      tokenIds.sort()
    }

    const prices = await theGraphApi.getPrices({ networkId, tokenIds })

    if (quoteTokenId === 0) {
      // Optimization more for a matter of principle than performance:
      // OWL token is always tokenId == 0 on the contract
      // All prices are given in terms of OWL
      // OWL price is always 1
      // Anything divided by 1...
      return prices[baseTokenId]
    } else if (prices[baseTokenId].isZero() || prices[quoteTokenId].isZero()) {
      // there was never a trade for one of these tokens
      return ZERO_BIG_NUMBER
    }

    return prices[baseTokenId].dividedBy(prices[quoteTokenId])
  }
}
