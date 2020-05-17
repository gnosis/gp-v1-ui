import { useEffect } from 'react'
import BigNumber from 'bignumber.js'

import useSafeState from './useSafeState'

import { getPriceEstimation } from 'services'
import { dexPriceEstimatorApi } from 'api'
import useGlobalState from './useGlobalState'
import { parseBigNumber } from 'utils'
import { ONE_BIG_NUMBER, ONE_HUNDRED_BIG_NUMBER } from 'const'

/**
 * @name checkSlippageAgainstPrice
 *
 * @param slippage - user set slippage as string
 * @param prePrice - pre-slippape adjusted price as BigNumber or null
 * @returns [BigNumber | null] - pre-price adjusted for slippage as BigNumber or null
 */
function checkSlippageAgainstPrice(slippage: string, prePrice: BigNumber | null): BigNumber | null {
  if (!prePrice) return null
  const slippageAsBigNumber = parseBigNumber(slippage)
  // if price slippage is not a BigNumber e.g 'abc' return prePrice
  if (!slippageAsBigNumber) return prePrice

  // slippageAsBigNumber here is defined and is indeed a valid number
  // convert slippage into fraction: (1 - (0.5/100)) = (1 - 0.005) = 99.995
  const slippageAsFraction = ONE_BIG_NUMBER.minus(slippageAsBigNumber.div(ONE_HUNDRED_BIG_NUMBER))
  const postSlippagePrice = prePrice.times(slippageAsFraction)

  return postSlippagePrice
}

interface Params {
  baseTokenId: number
  quoteTokenId: number
}

interface Result {
  priceEstimation: BigNumber | null
  isPriceLoading: boolean
}

/*
  PRICE ESTIMATION
  *
  BACKEND APPLIES A 0.1% SAFETY MARGIN ON ALL PRICES TO ACCOUNT FOR ROUNDING BY THE SOLVER
*/

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
  const [{ priceSlippage }] = useGlobalState()
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

        const preSlippagePrice = await dexPriceEstimatorApi.getPrice(getPriceParams)

        const price = checkSlippageAgainstPrice(priceSlippage, preSlippagePrice)

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
    priceSlippage,
    quoteTokenDecimals,
    quoteTokenId,
    setIsPriceLoading,
    setPriceEstimation,
  ])

  return { priceEstimation, isPriceLoading }
}
