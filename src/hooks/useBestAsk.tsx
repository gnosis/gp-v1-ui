import { useEffect } from 'react'
import BigNumber from 'bignumber.js'
import useSafeState from './useSafeState'
import { dexPriceEstimatorApi } from 'api'

interface BestAskParams {
  networkId: number
  baseTokenId: number
  quoteTokenId: number
}

interface HookReturn {
  bestAskPrice: BigNumber | null
  bestAskPriceLoading: boolean
}

function useBestAsk(params: BestAskParams): HookReturn {
  const [bestAskPrice, setBestAskPrice] = useSafeState<BigNumber | null>(null)
  const [bestAskPriceLoading, setBestAskPriceLoading] = useSafeState<boolean>(false)
  const { networkId, baseTokenId, quoteTokenId } = params

  useEffect(() => {
    let cancelled = false

    async function estimateBestAsk(): Promise<void> {
      setBestAskPriceLoading(true)

      try {
        const getBestAskParams = {
          networkId,
          baseToken: { id: baseTokenId },
          quoteToken: { id: quoteTokenId },
        }

        const bestAsk = await dexPriceEstimatorApi.getBestAsk(getBestAskParams)

        if (!cancelled) {
          setBestAskPrice(bestAsk)
        }
      } catch (e) {
        console.error(`[useBestAsk] Error getting bestAsk price for tokens ${baseTokenId} and ${quoteTokenId}`, e)
      } finally {
        setBestAskPriceLoading(false)
      }
    }

    estimateBestAsk()

    return (): void => {
      cancelled = true
    }
  }, [baseTokenId, networkId, quoteTokenId, setBestAskPrice, setBestAskPriceLoading])

  return {
    bestAskPrice,
    bestAskPriceLoading,
  }
}

export default useBestAsk
