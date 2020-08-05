import { TokenDetails } from 'types'
import { DetailedAuctionElement, Trade } from 'api/exchange/ExchangeApi'
import { computeMarketProp } from './display'
import { web3 } from 'api'

export function checkTokenAgainstSearch(token: TokenDetails | null, searchText: string, isAddress?: boolean): boolean {
  if (!token) return false
  return (
    token?.symbol?.toLowerCase().includes(searchText) ||
    token?.name?.toLowerCase().includes(searchText) ||
    (!!isAddress && token?.address.toLowerCase().includes(searchText))
  )
}

const filterTradesAndOrdersFnFactory = <
  T extends { id: string; buyToken: TokenDetails | null; sellToken: TokenDetails | null; orderId?: string }
>(
  includeInverseMarket?: boolean,
) => (searchTxt: string) => ({ id, buyToken, sellToken, ...rest }: T): boolean | null => {
  if (searchTxt === '') return null

  const searchIsAddress = web3.utils.isAddress(searchTxt)
  const market =
    sellToken && buyToken && computeMarketProp({ sellToken, buyToken, inverseMarket: includeInverseMarket })

  return (
    (rest.orderId ? !!rest.orderId.includes(searchTxt) : !!id.includes(searchTxt)) ||
    (market && !!market.includes(searchTxt)) ||
    checkTokenAgainstSearch(buyToken, searchTxt, searchIsAddress) ||
    checkTokenAgainstSearch(sellToken, searchTxt, searchIsAddress)
  )
}

export const filterOrdersFn = filterTradesAndOrdersFnFactory<DetailedAuctionElement>(true)
export const filterTradesFn = filterTradesAndOrdersFnFactory<Trade>()
