import { useEffect } from 'react'
import BigNumber from 'bignumber.js'

import useSafeState from './useSafeState'

import { getPriceEstimation } from 'services'
import { logDebug } from 'utils'

interface Params {
  baseTokenId: number
  quoteTokenId: number
}

interface Result {
  priceEstimation: BigNumber | null
  isPriceLoading: boolean
}

export function usePriceEstimation(params: Params): Result {
  const { baseTokenId, quoteTokenId } = params
  const [isPriceLoading, setIsPriceLoading] = useSafeState(true)
  const [priceEstimation, setPriceEstimation] = useSafeState<BigNumber | null>(null)

  useEffect(() => {
    async function estimatePrice(): Promise<void> {
      setIsPriceLoading(true)
      try {
        setPriceEstimation(await getPriceEstimation({ baseTokenId, quoteTokenId }))
      } catch (e) {
        logDebug(e)
      } finally {
        setIsPriceLoading(false)
      }
    }

    estimatePrice()
  }, [quoteTokenId, baseTokenId, setPriceEstimation, setIsPriceLoading])

  return { priceEstimation, isPriceLoading }
}
