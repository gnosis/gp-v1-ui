import { useEffect, useRef } from 'react'
import BigNumber from 'bignumber.js'

import useSafeState from './useSafeState'

import { getPriceEstimation } from 'services'
import { dexPriceEstimatorApi } from 'api'
import { useDebounce } from './useDebounce'

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

interface Token {
  id: number
  decimals?: number
}

interface SlippageParams {
  networkId: number
  baseToken: Token
  quoteToken: Token
  amount: string
}

export function usePriceEstimationWithSlippage(params: SlippageParams): Result {
  const [isPriceLoading, setIsPriceLoading] = useSafeState(true)
  const [priceEstimation, setPriceEstimation] = useSafeState<BigNumber | null>(null)
  const querying = useRef(false)
  const { value: debouncedParams } = useDebounce(params, 5000)

  useEffect(() => {
    let cancelled = false
    const { networkId, baseToken, quoteToken, amount } = debouncedParams

    async function estimatePrice(): Promise<void> {
      setIsPriceLoading(true)
      console.log(`started loading`)
      try {
        const getPriceParams = { networkId, baseToken, quoteToken }
        if (+amount > 0) {
          // Default (when no amount is provided) is to query 1 unit
          getPriceParams['amountInUnits'] = amount
        }

        const price = await dexPriceEstimatorApi.getPrice(getPriceParams)
        console.log(`got price ${price}`)
        if (!cancelled) {
          console.log(`not cancelled, updating price`)
          setPriceEstimation(price)
        }
      } catch (e) {
        console.error(
          `[usePriceEstimationWithSlippage] Error getting price estimation for tokens ${baseToken.id} and ${quoteToken.id} amount ${amount}`,
          e,
        )
      } finally {
        console.log(`finished loading`)
        setIsPriceLoading(false)
      }
    }
    console.log('something changed', amount, baseToken, networkId, quoteToken)

    if (!querying.current) {
      console.log(`not querying, starting`)
      querying.current = true
      estimatePrice().then(() => {
        console.log(`done querying`)
        querying.current = false
      })
    }

    return (): void => {
      console.log(`umounting, cancelling and resting querying`)
      cancelled = true
      querying.current = false
    }
  }, [debouncedParams, setIsPriceLoading, setPriceEstimation])

  return { priceEstimation, isPriceLoading }
}
