import { useEffect } from 'react'
import BigNumber from 'bignumber.js'

import useSafeState from './useSafeState'

import { ZERO_BIG_NUMBER } from 'const'
import { getPriceEstimation } from 'services'
import { logDebug } from 'utils'

interface Params {
  numeratorTokenId: number
  denominatorTokenId: number
}

export function usePriceEstimation(params: Params): BigNumber {
  const { numeratorTokenId, denominatorTokenId } = params
  const [price, setPrice] = useSafeState(ZERO_BIG_NUMBER)

  useEffect(() => {
    async function updatePrice(): Promise<void> {
      try {
        const priceEstimate = await getPriceEstimation({
          numeratorTokenId,
          denominatorTokenId,
        })

        setPrice(priceEstimate)
      } catch (e) {
        // Fail silently. Not a critical part of the app, user doesn't need to know about it.
        logDebug(e)
      }
    }

    updatePrice()
  }, [denominatorTokenId, numeratorTokenId, setPrice])

  return price
}
