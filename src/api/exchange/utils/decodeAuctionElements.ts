import BN from 'bn.js'
import { AuctionElement } from 'api/exchange/ExchangeApi'

const ADDRESS_WIDTH = 20 * 2
const UINT256_WIDTH = 32 * 2
const UINT16_WIDTH = 2 * 2
const UINT32_WIDTH = 4 * 2
const UINT128_WIDTH = 16 * 2

const hexPattern = '[0-9a-fA-F]'
const hn = (n: number): string => hexPattern + `{${n}}`

// /(address)(sellTokenBalance)(buyTokenId)(sellTokenId)(validFrom)(validUntil)(priceNumerator)(priceDenominator)(remainingAmount)/g
const orderPattern = `(${hn(ADDRESS_WIDTH)})(${hn(UINT256_WIDTH)})(${hn(UINT16_WIDTH)})(${hn(UINT16_WIDTH)})(${hn(
  UINT32_WIDTH,
)})(${hn(UINT32_WIDTH)})(${hn(UINT128_WIDTH)})(${hn(UINT128_WIDTH)})(${hn(UINT128_WIDTH)})`

// decodes Orders
export function decodeAuctionElements(bytes: string, startingIndex?: number): AuctionElement[] {
  const result: AuctionElement[] = []
  const oneOrder = new RegExp(orderPattern, 'g')
  let order
  // Order ID is given by position and it's not part of the encoded data
  // Thus, we use the `startingIndex` if given, for using with paginated queries
  let index = startingIndex || 0

  while ((order = oneOrder.exec(bytes))) {
    const [
      ,
      user,
      sellTokenBalance,
      buyTokenId,
      sellTokenId,
      validFrom,
      validUntil,
      priceNumerator,
      priceDenominator,
      remainingAmount,
    ] = order

    result.push({
      user: '0x' + user,
      sellTokenBalance: new BN(sellTokenBalance, 16),
      id: (index++).toString(),
      buyTokenId: parseInt(buyTokenId, 16),
      sellTokenId: parseInt(sellTokenId, 16),
      validFrom: parseInt(validFrom, 16),
      validUntil: parseInt(validUntil, 16),
      priceNumerator: new BN(priceNumerator, 16),
      priceDenominator: new BN(priceDenominator, 16),
      remainingAmount: new BN(remainingAmount, 16),
    })
  }
  return result
}
