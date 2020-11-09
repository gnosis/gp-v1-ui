import BigNumber from 'bignumber.js'
import { TokenDex } from '@gnosis.pm/dex-js'

export interface PriceImpactArgsBase {
  limitPrice?: string | null
  bestAskPrice: BigNumber | null
}

export interface PriceImpactArgs extends PriceImpactArgsBase {
  fillPrice: BigNumber | null
  baseTokenDecimals: number
  quoteTokenDecimals: number
}

export interface PriceImpactProps {
  baseToken: TokenDex
  quoteToken: TokenDex
  limitPrice?: string | null
  fillPrice: BigNumber | null
  networkId: number
}

export interface SimplePriceImpactProps {
  className?: string
  impactAmount: string | null
}

export interface UsePriceImpactReturn {
  priceImpactSmart: string
  priceImpactClassName: string
  priceImpactWarning: string | null
}

export type UsePriceImpactParams = PriceImpactProps
