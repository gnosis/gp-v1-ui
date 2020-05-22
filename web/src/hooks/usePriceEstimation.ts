import { useEffect } from 'react'
import BigNumber from 'bignumber.js'

import useSafeState from './useSafeState'

import { getPriceEstimation } from 'services'
import { dexPriceEstimatorApi } from 'api'

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
        console.error(
          `[usePriceEstimation] Error getting price estimation for tokens ${baseTokenId} and ${quoteTokenId}`,
          e,
        )
      } finally {
        setIsPriceLoading(false)
      }
    }

    estimatePrice()
  }, [quoteTokenId, baseTokenId, setPriceEstimation, setIsPriceLoading])

  return { priceEstimation, isPriceLoading }
}

interface SlippageParams {
  networkId: number
  baseTokenId: number
  baseTokenDecimals?: number
  quoteTokenId: number
  quoteTokenDecimals?: number
  amount: string
}

export function usePriceEstimationWithSlippage(params: SlippageParams): Result {
  const [isPriceLoading, setIsPriceLoading] = useSafeState(true)
  const [priceEstimation, setPriceEstimation] = useSafeState<BigNumber | null>(null)
  const { networkId, baseTokenId, baseTokenDecimals, quoteTokenId, quoteTokenDecimals, amount } = params

  useEffect(() => {
    let cancelled = false

    async function estimatePrice(): Promise<void> {
      setIsPriceLoading(true)

      try {
        const getPriceParams = {
          networkId,
          baseToken: { id: baseTokenId, decimals: baseTokenDecimals },
          quoteToken: { id: quoteTokenId, decimals: quoteTokenDecimals },
        }
        if (+amount > 0) {
          // Default (when no amount is provided) is to query 1 unit
          getPriceParams['amountInUnits'] = amount
        }

        const price = await dexPriceEstimatorApi.getPrice(getPriceParams)

        if (!cancelled) {
          setPriceEstimation(price)
        }
      } catch (e) {
        console.error(
          `[usePriceEstimationWithSlippage] Error getting price estimation for tokens ${baseTokenId} and ${quoteTokenId} amount ${amount}`,
          e,
        )
      } finally {
        setIsPriceLoading(false)
      }
    }

    estimatePrice()

    return (): void => {
      cancelled = true
    }
  }, [
    amount,
    baseTokenDecimals,
    baseTokenId,
    networkId,
    quoteTokenDecimals,
    quoteTokenId,
    setIsPriceLoading,
    setPriceEstimation,
  ])

  return { priceEstimation, isPriceLoading }
}
