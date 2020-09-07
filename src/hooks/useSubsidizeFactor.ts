import { useEffect } from 'react'
import useSafeState from './useSafeState'
import { dexPriceEstimatorApi } from 'api'

export function useSubsidizeFactor(networkId: number): null | number {
  const [subsidizefactor, setSubsidizeFactor] = useSafeState<null | number>(null)

  useEffect(() => {
    dexPriceEstimatorApi.getSubsidizeFactor(networkId).then(setSubsidizeFactor)
  }, [networkId, setSubsidizeFactor])

  return subsidizefactor
}
