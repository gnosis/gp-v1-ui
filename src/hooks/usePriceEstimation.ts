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
    getriceEstimation({ baseTokenId, quoteTokenId }).then(setPrice, logDebug)
  }, [quoteTokenId, baseTokenId, setPrice])

  return price
}
