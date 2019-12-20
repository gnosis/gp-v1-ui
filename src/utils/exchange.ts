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
const orderPattern = `(?<user>${hn(ADDRESS_WIDTH)})(?<sellTokenBalance>${hn(UINT256_WIDTH)})(?<buyTokenId>${hn(
  UINT16_WIDTH,
)})(?<sellTokenId>${hn(UINT16_WIDTH)})(?<validFrom>${hn(UINT32_WIDTH)})(?<validUntil>${hn(
  UINT32_WIDTH,
)})(?<priceNumerator>${hn(UINT128_WIDTH)})(?<priceDenominator>${hn(UINT128_WIDTH)})(?<remainingAmount>${hn(
  UINT128_WIDTH,
)})`

// decodes Orders
export function decodeAuctionElements(bytes: string): AuctionElement[] {
  const result: AuctionElement[] = []
  const oneOrder = new RegExp(orderPattern, 'g')
  let order
  let index = 0 // order ID is given by position and it's not part of the encoded data

  while ((order = oneOrder.exec(bytes))) {
    const {
      user,
      sellTokenBalance,
      buyTokenId,
      sellTokenId,
      validFrom,
      validUntil,
      priceNumerator,
      priceDenominator,
      remainingAmount,
    } = order.groups as {
      user: string
      sellTokenBalance: string
      buyTokenId: string
      sellTokenId: string
      validFrom: string
      validUntil: string
      priceNumerator: string
      priceDenominator: string
      remainingAmount: string
    }

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
