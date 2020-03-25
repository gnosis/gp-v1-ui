import { useEffect } from 'react'
import BigNumber from 'bignumber.js'

import useSafeState from './useSafeState'

import { getPriceEstimation } from 'services'
import { logDebug } from 'utils'

interface Params {
  baseTokenId: number
  quoteTokenId: number
}

export function usePriceEstimation(params: Params): BigNumber | null {
  const { baseTokenId, quoteTokenId } = params
  const [price, setPrice] = useSafeState<BigNumber | null>(null)

  useEffect(() => {
    getPriceEstimation({ baseTokenId, quoteTokenId }).then(setPrice, logDebug)
  }, [quoteTokenId, baseTokenId, setPrice])

  return price
}
