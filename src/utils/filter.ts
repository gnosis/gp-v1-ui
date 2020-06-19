import { TokenDetails } from 'types'
import { DetailedAuctionElement, Trade } from 'api/exchange/ExchangeApi'
import { computeMarketProp } from './display'

export function checkTokenAgainstSearch(token: TokenDetails | null, searchText: string): boolean {
  if (!token) return false
  return (
    token?.symbol?.toLowerCase().includes(searchText) ||
    token?.name?.toLowerCase().includes(searchText) ||
    token?.address.toLowerCase().includes(searchText)
  )
}

const filterTradesAndOrdersFnFactory = (includeInverseMarket?: boolean) => (searchTxt: string) => ({
  id,
  buyToken,
  sellToken,
}: Trade | DetailedAuctionElement): boolean | null => {
  if (searchTxt === '') return null

  const market =
    sellToken && buyToken && computeMarketProp({ sellToken, buyToken, inverseMarket: includeInverseMarket })

  return (
    !!id.includes(searchTxt) ||
    (market && !!market.includes(searchTxt)) ||
    checkTokenAgainstSearch(buyToken, searchTxt) ||
    checkTokenAgainstSearch(sellToken, searchTxt)
  )
}

export const filterOrdersFn = filterTradesAndOrdersFnFactory(true)
export const filterTradesFn = filterTradesAndOrdersFnFactory()
