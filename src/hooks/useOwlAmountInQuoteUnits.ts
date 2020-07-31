import { useEffect } from 'react'
import BigNumber from 'bignumber.js'

import { TokenDetails } from 'types'

import useSafeState from 'hooks/useSafeState'
import { usePriceEstimationWithSlippage } from 'hooks/usePriceEstimation'

/**
 * Hook to query how much in quote token is equivalent to given amount in OWL
 *
 * @param owlUnits How many OWL
 * @param networkId The network id
 * @param quoteToken Token to quote OWL in
 */
export function useOwlAmountInQuoteUnits(
  owlUnits: number,
  networkId: number,
  quoteToken: TokenDetails,
): { amount: BigNumber | null; isLoading: boolean } {
  const [isLoading, setIsLoading] = useSafeState(false)
  const [owlsInQuote, setOwlsInQuote] = useSafeState<BigNumber | null>(null)

  // Get the price of 1 OWL in quote token
  // But why quoting 1 OWL instead of `owlUnits` OWL ?
  // Because due to slippage, the price might be smaller.
  // We don't want that here, thus we multiply the result by given `owlUnits`
  const { priceEstimation, isPriceLoading } = usePriceEstimationWithSlippage({
    networkId,
    amount: '1',
    baseTokenId: 0, // OWL
    quoteTokenId: quoteToken.id,
    quoteTokenDecimals: quoteToken.decimals,
  })

  useEffect(() => {
    if (isPriceLoading) {
      setIsLoading(true)
      return
    }
    setIsLoading(false)
    priceEstimation && setOwlsInQuote(priceEstimation.multipliedBy(owlUnits))
  }, [isPriceLoading, owlUnits, priceEstimation, setOwlsInQuote, setIsLoading])

  return { amount: owlsInQuote, isLoading }
}
