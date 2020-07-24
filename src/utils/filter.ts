import { TokenDetails } from 'types'
import { DetailedAuctionElement, Trade } from 'api/exchange/ExchangeApi'
import { computeMarketProp } from './display'
import { web3 } from 'api'

export function checkTokenAgainstSearch(token: TokenDetails | null, searchText: string): boolean {
  if (!token) return false
  return (
    token?.symbol?.toLowerCase().includes(searchText) ||
    token?.name?.toLowerCase().includes(searchText) ||
    (web3.utils.isAddress(searchText) && token?.address.toLowerCase().includes(searchText))
  )
}

const filterTradesAndOrdersFnFactory = <
  T extends { id: string; buyToken: TokenDetails | null; sellToken: TokenDetails | null; orderId?: string }
>(
  includeInverseMarket?: boolean,
) => (searchTxt: string) => ({ id, buyToken, sellToken, ...rest }: T): boolean | null => {
  if (searchTxt === '') return null

  const market =
    sellToken && buyToken && computeMarketProp({ sellToken, buyToken, inverseMarket: includeInverseMarket })
  console.debug(id, rest)
  return (
    (rest.orderId ? !!rest.orderId.includes(searchTxt) : !!id.includes(searchTxt)) ||
    (market && !!market.includes(searchTxt)) ||
    checkTokenAgainstSearch(buyToken, searchTxt) ||
    checkTokenAgainstSearch(sellToken, searchTxt)
  )
}

export const filterOrdersFn = filterTradesAndOrdersFnFactory<DetailedAuctionElement>(true)
export const filterTradesFn = filterTradesAndOrdersFnFactory<Trade>()
