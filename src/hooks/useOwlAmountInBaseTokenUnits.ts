import { useEffect, useMemo } from 'react'
import BigNumber from 'bignumber.js'

import { TokenDetails } from 'types'

import useSafeState from 'hooks/useSafeState'
import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'
import { logDebug } from 'utils'

const OWL_TOKEN_ID = 0

/**
 * Hook to query how much in base token is equivalent to given amount in OWL
 *
 * @param owlUnits How many OWL
 * @param networkId The network id
 * @param baseToken Token to base OWL in
 */
export function useOwlAmountInBaseTokenUnits(
  owlUnits: number,
  networkId: number,
  baseToken: TokenDetails,
): { amount: BigNumber | null; isLoading: boolean } {
  const [isLoading, setIsLoading] = useSafeState(false)
  const [owlsInBaseToken, setOwlsInBaseToken] = useSafeState<BigNumber | null>(null)

  const owlUnitsBigNumber = useMemo(() => new BigNumber(owlUnits), [owlUnits])

  // Get the price of 1 OWL in base token
  // But why quoting 1 OWL instead of `owlUnits` OWL ?
  // Because due to slippage, the price might be smaller.
  // We don't want that here, thus we multiply the result by given `owlUnits`
  const { priceEstimation, isPriceLoading } = usePriceEstimationWithSlippage({
    networkId,
    amount: '1',
    quoteTokenId: OWL_TOKEN_ID,
    baseTokenId: baseToken.id,
    baseTokenDecimals: baseToken.decimals,
  })

  useEffect(() => {
    if (isPriceLoading) {
      setIsLoading(true)
      setOwlsInBaseToken(null)
      return
    }

    setIsLoading(false)

    if (priceEstimation) {
      setOwlsInBaseToken(
        baseToken.id == OWL_TOKEN_ID
          ? owlUnitsBigNumber // Quote token is OWL, 1 OWL in OWL == 1
          : priceEstimation.multipliedBy(owlUnitsBigNumber),
      )
      logDebug(`[useOwlAmountInBaseTokenUnits] 1 OWL in ${baseToken.symbol} => ${priceEstimation.toString(10)}`)
    }
  }, [isPriceLoading, owlUnitsBigNumber, priceEstimation, setOwlsInBaseToken, setIsLoading, baseToken])

  return { amount: owlsInBaseToken, isLoading }
}
