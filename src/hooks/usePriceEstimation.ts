import { useEffect } from 'react'
import BigNumber from 'bignumber.js'

import useSafeState from './useSafeState'

import { getPriceEstimation } from 'services'
import { logDebug } from 'utils'

interface Params {
  numeratorTokenId: number
  denominatorTokenId: number
}

export function usePriceEstimation(params: Params): BigNumber | null {
  const { numeratorTokenId: baseTokenId, denominatorTokenId: quoteTokenId } = params
  const [price, setPrice] = useSafeState<BigNumber | null>(null)

  useEffect(() => {
    async function updatePrice(): Promise<void> {
      try {
        const priceEstimate = await getPriceEstimation({
          baseTokenId,
          quoteTokenId,
        })

        setPrice(priceEstimate)
      } catch (e) {
        // Fail silently. Not a critical part of the app, user doesn't need to know about it.
        logDebug(e)
      }
    }

    updatePrice()
  }, [quoteTokenId, baseTokenId, setPrice])

  return price
}
