import { decodeAuctionElements } from 'api/exchange/utils/decodeAuctionElements'
import BN from 'bn.js'

function _transformBnToString(order: {
  sellTokenBalance: BN
  priceNumerator: BN
  priceDenominator: BN
  remainingAmount: BN
}): {
  sellTokenBalance: string
  priceNumerator: string
  priceDenominator: string
  remainingAmount: string
} {
  return {
    ...order,
    sellTokenBalance: order.sellTokenBalance.toString(),
    priceNumerator: order.priceNumerator.toString(),
    priceDenominator: order.priceDenominator.toString(),
    remainingAmount: order.remainingAmount.toString(),
  }
}

describe('Decode orders', () => {
  test('Test no orders', async () => {
    // GIVEN: An empty encoded order
    const encodedOrders = '0x'

    // WHEN: decoding
    const orders = decodeAuctionElements(encodedOrders)

    // THEN: The decoded orders are an empty array
    expect(orders).toEqual([])
  })

  test('Test single order', async () => {
    // GIVEN: A single order
    const encodedOrders =
      '0x0000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000040007005040240050402a0000000000000000000000000016e36000000000000000000de0b6b3a764000000000000000000000de0b6b3a7640000'

    // WHEN: decoding
    const orders = decodeAuctionElements(encodedOrders).map(_transformBnToString)

    // THEN: The decoded oder matches the order
    expect(orders).toEqual([
      {
        user: '0x0000000000000000000000000000000000000001',
        sellTokenBalance: '0',
        id: '0',
        buyTokenId: 4,
        sellTokenId: 7,
        validFrom: 5259300,
        validUntil: 5259306,
        priceNumerator: '1500000',
        priceDenominator: '1000000000000000000',
        remainingAmount: '1000000000000000000',
      },
    ])
  })

  test('Test empty orders', async () => {
    // GIVEN: An 2 empty encoded orders
    const encodedOrders =
      '0x0000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'

    // WHEN: when decoding
    const orders = decodeAuctionElements(encodedOrders).map(_transformBnToString)

    // THEN: The decoded orders matches the empty orders
    expect(orders).toEqual([
      {
        user: '0x0000000000000000000000000000000000000001',
        sellTokenBalance: '0',
        id: '0',
        buyTokenId: 0,
        sellTokenId: 0,
        validFrom: 0,
        validUntil: 0,
        priceNumerator: '0',
        priceDenominator: '0',
        remainingAmount: '0',
      },
      {
        user: '0x0000000000000000000000000000000000000001',
        sellTokenBalance: '0',
        id: '1',
        buyTokenId: 0,
        sellTokenId: 0,
        validFrom: 0,
        validUntil: 0,
        priceNumerator: '0',
        priceDenominator: '0',
        remainingAmount: '0',
      },
    ])
  })
})
