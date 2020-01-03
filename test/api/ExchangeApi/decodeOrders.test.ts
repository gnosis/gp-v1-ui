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

function _encodeOrder(order: {
  user: number
  sellTokenBalance: number
  buyTokenId: number
  sellTokenId: number
  validFrom: number
  validUntil: number
  priceNumerator: number
  priceDenominator: number
  remainingAmount: number
}): string {
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
  } = order
  return (
    user.toString(16).padStart(40, '0') +
    sellTokenBalance.toString(16).padStart(64, '0') +
    buyTokenId.toString(16).padStart(4, '0') +
    sellTokenId.toString(16).padStart(4, '0') +
    validFrom.toString(16).padStart(8, '0') +
    validUntil.toString(16).padStart(8, '0') +
    priceNumerator.toString(16).padStart(32, '0') +
    priceDenominator.toString(16).padStart(32, '0') +
    remainingAmount.toString(16).padStart(32, '0')
  )
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
    // GIVEN: An encode order
    const user = 1
    const sellTokenBalance = 0
    const buyTokenId = 4
    const sellTokenId = 7
    const validFrom = 5259300
    const validUntil = 5259306
    const priceNumerator = 1500000
    const priceDenominator = 1000000000000000000
    const remainingAmount = 1000000000000000000
    const encodedOrder = _encodeOrder({
      user,
      sellTokenBalance,
      buyTokenId,
      sellTokenId,
      validFrom,
      validUntil,
      priceNumerator,
      priceDenominator,
      remainingAmount,
    })
    const encodedOrders = '0x' + encodedOrder

    // WHEN: decoding
    const orders = decodeAuctionElements(encodedOrders).map(_transformBnToString)

    // THEN: The decoded oder matches the order
    expect(orders).toEqual([
      {
        user: '0x' + user.toString(16).padStart(40, '0'),
        sellTokenBalance: '0',
        id: '0',
        buyTokenId,
        sellTokenId,
        validFrom,
        validUntil,
        priceNumerator: priceNumerator.toString(),
        priceDenominator: priceDenominator.toString(),
        remainingAmount: remainingAmount.toString(),
      },
    ])
  })

  test('Test empty orders', async () => {
    // GIVEN: An 2 empty encoded orders
    const user = 0
    const sellTokenBalance = 0
    const buyTokenId = 0
    const sellTokenId = 0
    const validFrom = 0
    const validUntil = 0
    const priceNumerator = 0
    const priceDenominator = 0
    const remainingAmount = 0
    const encodedOrder1 = _encodeOrder({
      user,
      sellTokenBalance,
      buyTokenId,
      sellTokenId,
      validFrom,
      validUntil,
      priceNumerator,
      priceDenominator,
      remainingAmount,
    })
    const encodedOrder2 = _encodeOrder({
      user,
      sellTokenBalance,
      buyTokenId,
      sellTokenId,
      validFrom,
      validUntil,
      priceNumerator,
      priceDenominator,
      remainingAmount,
    })
    const encodedOrders = '0x' + encodedOrder1 + encodedOrder2

    // WHEN: when decoding
    const orders = decodeAuctionElements(encodedOrders).map(_transformBnToString)

    // THEN: The decoded orders matches the empty orders
    expect(orders).toEqual([
      {
        user: '0x' + user.toString(16).padStart(40, '0'),
        sellTokenBalance: '0',
        id: '0',
        buyTokenId,
        sellTokenId,
        validFrom,
        validUntil,
        priceNumerator: '0',
        priceDenominator: '0',
        remainingAmount: '0',
      },
      {
        user: '0x' + user.toString(16).padStart(40, '0'),
        sellTokenBalance: '0',
        id: '1',
        buyTokenId,
        sellTokenId,
        validFrom,
        validUntil,
        priceNumerator: '0',
        priceDenominator: '0',
        remainingAmount: '0',
      },
    ])
  })
})
