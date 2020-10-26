import BN from 'bn.js'
import { useMemo } from 'react'
import { formatSmart, parseAmount } from '@gnosis.pm/dex-js'

import useBestAsk from 'hooks/useBestAsk'

import { calculatePriceImpact, determinePriceWarning, getImpactColourClass } from './utils'
import { UsePriceImpactParams, UsePriceImpactReturn } from './types'

function usePriceImpact(params: UsePriceImpactParams): UsePriceImpactReturn {
  const { networkId, baseTokenId, quoteTokenId, limitPrice, fillPrice } = params

  const { bestAskPrice } = useBestAsk({
    networkId,
    baseTokenId,
    quoteTokenId,
  })

  return useMemo(() => {
    const priceImpact = calculatePriceImpact({ bestAskPrice, limitPrice })
    // Smart format, if possible
    const priceImpactSmart =
      (priceImpact &&
        !priceImpact.isZero() &&
        formatSmart({ amount: parseAmount(priceImpact.toString(), 4) as BN, precision: 4, smallLimit: '0.01' })) ||
      '<0.01'

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
