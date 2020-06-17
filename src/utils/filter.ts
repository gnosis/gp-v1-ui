import { TokenDetails } from 'types'
import { DetailedAuctionElement, Trade } from 'api/exchange/ExchangeApi'

export function checkTokenAgainstSearch(token: TokenDetails | null, searchText: string): boolean {
  if (!token) return false
  return (
    token?.symbol?.toLowerCase().includes(searchText) ||
    token?.name?.toLowerCase().includes(searchText) ||
    token?.address.toLowerCase().includes(searchText)
  )
}

export const filterOrdersFn = (searchTxt: string) => ({
  id,
  buyToken,
  sellToken,
  market,
}: Trade | DetailedAuctionElement): boolean | null => {
  if (searchTxt === '') return null

  return (
    !!id.includes(searchTxt) ||
    (market && !!market.includes(searchTxt)) ||
    checkTokenAgainstSearch(buyToken, searchTxt) ||
    checkTokenAgainstSearch(sellToken, searchTxt)
  )
}
