import { useMemo } from 'react'
import useBestAsk from 'hooks/useBestAsk'

import { calculatePriceImpact, determinePriceWarning, getImpactColourClass } from './utils'
import { UsePriceImpactParams, UsePriceImpactReturn } from './types'
import { amountToPrecisionDown, formatPercentage } from 'utils'

function usePriceImpact(params: UsePriceImpactParams): UsePriceImpactReturn {
  const {
    networkId,
    baseToken: { id: baseTokenId },
    quoteToken: { id: quoteTokenId, decimals: quoteTokenDecimals },
    limitPrice,
    fillPrice: preFillPrice,
  } = params

  // Format fill price to quoteToken decimals
  // Facilitates comparing limit/fill price
  const fillPrice = preFillPrice ? amountToPrecisionDown(preFillPrice, quoteTokenDecimals) : null

  const { bestAskPrice } = useBestAsk({
    networkId,
    baseTokenId,
    quoteTokenId,
  })

  return useMemo(() => {
    const priceImpact = calculatePriceImpact({ bestAskPrice, limitPrice })

    // Smart format, if possible
    let priceImpactSmart: string
    if (priceImpact && !priceImpact.isZero()) {
      priceImpactSmart = formatPercentage(priceImpact)
    } else {
      priceImpactSmart = '0%'
    }

    // Calculate any applicable trade warnings
    const priceImpactWarning = determinePriceWarning({ limitPrice, fillPrice, bestAskPrice }, priceImpact)
    // Dynamic class for styling
    const priceImpactClassName = getImpactColourClass(priceImpact)

    return {
      priceImpactSmart,
      priceImpactClassName,
      priceImpactWarning,
    }
  }, [bestAskPrice, fillPrice, limitPrice])
}

export default usePriceImpact
