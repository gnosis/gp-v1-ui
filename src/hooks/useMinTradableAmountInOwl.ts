import { useEffect } from 'react'
import useSafeState from './useSafeState'
import { dexPriceEstimatorApi } from 'api'
import BigNumber from 'bignumber.js'

export function useMinTradableAmountInOwl(networkId: number): null | BigNumber {
  const [minAmount, setMinAmount] = useSafeState<null | BigNumber>(null)

  useEffect(() => {
    dexPriceEstimatorApi.getMinOrderAmounInOWL(networkId).then(setMinAmount)
  }, [networkId, setMinAmount])

  return minAmount
}
