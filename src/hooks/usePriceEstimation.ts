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

  console.log(`outside useEffect`, amount, baseTokenDecimals, baseTokenId, networkId, quoteTokenDecimals, quoteTokenId)

  useEffect(() => {
    let cancelled = false
    console.log(`inside useEffect`, amount, baseTokenDecimals, baseTokenId, networkId, quoteTokenDecimals, quoteTokenId)

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
          console.log(`not cancelled`)
          setPriceEstimation(price)
        } else {
          console.log(`cancelled`)
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
      console.log(`cancelled`)
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
