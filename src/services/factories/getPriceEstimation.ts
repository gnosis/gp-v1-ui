import BigNumber from 'bignumber.js'
import { assert } from '@gnosis.pm/dex-js'

import { ZERO_BIG_NUMBER } from 'const'

import { TheGraphApi } from 'api/thegraph/TheGraphApi'
import { TokenList } from 'api/tokenList/TokenListApi'

export interface GetPriceParams {
  networkId: number
  numeratorTokenId: number
  denominatorTokenId: number
}

export function getPriceEstimationFactory(factoryParams: {
  theGraphApi: TheGraphApi
  tokenListApi: TokenList
}): (params: GetPriceParams) => Promise<BigNumber> {
  const { theGraphApi, tokenListApi } = factoryParams

  return async (params: GetPriceParams): Promise<BigNumber> => {
    const { networkId, numeratorTokenId, denominatorTokenId } = params

    assert(numeratorTokenId !== denominatorTokenId, 'Token ids cannot be the equal')

    // ---
    // For an 'optimization' of sorts, we always query all known tokens plus the requested token ids.
    // Assuming the caching is on for the TheGraphApi layer (it was last time I checked) and we don't
    // expect to have tokens ids not often outside of our list.
    // Thus, we can actually make a request once, and reuse the response for all token pairs falling into the same list

    // all known token ids
    const tokenIdsSet = new Set(tokenListApi.getTokens(networkId).map(token => token.id))
    // just in case the tokens are not in our initial list:
    tokenIdsSet.add(numeratorTokenId)
    tokenIdsSet.add(denominatorTokenId)
    // make it nice and sorted to help with caching
    const tokenIds = [...tokenIdsSet].sort()

    // end of the 'optimization' part
    // ---

    const prices = await theGraphApi.getPrices({ networkId, tokenIds })

    if (denominatorTokenId === 0) {
      // Optimization more for a matter of principle than performance:
      // OWL token is always tokenId == 0 on the contract
      // All prices are given in terms of OWL
      // OWL price is always 1
      // Anything divided by 1...
      return prices[numeratorTokenId]
    } else if (prices[numeratorTokenId].isZero() || prices[denominatorTokenId].isZero()) {
      // there was never a trade for one of these tokens
      return ZERO_BIG_NUMBER
    }

    return prices[numeratorTokenId].dividedBy(prices[denominatorTokenId])
  }
}
