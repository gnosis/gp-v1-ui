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
    setIsPriceLoading(true)

    getPriceEstimation({ baseTokenId, quoteTokenId }).then(price => {
      setPriceEstimation(price)
      setIsPriceLoading(false)
    }, logDebug)
  }, [quoteTokenId, baseTokenId, setPriceEstimation, setIsPriceLoading])

  return { priceEstimation, isPriceLoading }
}
