import tokenList from '../data/tokenList'
import { TradeTokenSelection } from 'types'
import { getMarket, GetMarketResult } from 'utils'

// QUOTE gives price
//     BASE/QUOTE
// e.g WETH/TUSD

function assertMarket(tradeTokenSelection: TradeTokenSelection, expectedMarket: GetMarketResult): void {
  // Run through checkMarketFn
  const market = getMarket(tradeTokenSelection)
  expect(market).toEqual(expectedMarket)
}

describe('Check market and check base/quote token priorities', () => {
  const [WETH, TUSD, USDT, , , , , FAKE, FAKE2] = tokenList
  WETH.priority = 3
  TUSD.priority = 1
  USDT.priority = 1
  FAKE.priority = Number.MAX_SAFE_INTEGER

  describe('STABLE/STABLE Market', () => {
    test('When sell STABLE1, quote is STABLE1', () => {
      const givenTokens = {
        sellToken: TUSD,
        receiveToken: USDT,
      }
      const expectedResult = {
        quoteToken: TUSD,
        baseToken: USDT,
        wasPriorityAdjusted: false,
      }

      // Expected, Given Market
      assertMarket(givenTokens, expectedResult)
    })

    test('When sell STABLE2, quote is STABLE2', () => {
      const givenTokens = {
        sellToken: USDT,
        receiveToken: TUSD,
      }
      const expectedResult = {
        quoteToken: USDT,
        baseToken: TUSD,
        wasPriorityAdjusted: false,
      }

      assertMarket(givenTokens, expectedResult)
    })
  })

  describe('WETH/STABLE Market', () => {
    test('When selling STABLE, STABLE is quote', () => {
      const givenTokens = {
        sellToken: USDT,
        receiveToken: WETH,
      }
      const expectedResult = {
        quoteToken: USDT,
        baseToken: WETH,
        wasPriorityAdjusted: false,
      }

      assertMarket(givenTokens, expectedResult)
    })

    test('When selling WETH, STABLE is quote', () => {
      const givenTokens = {
        sellToken: WETH,
        receiveToken: USDT,
      }
      const expectedResult = {
        quoteToken: USDT,
        baseToken: WETH,
        wasPriorityAdjusted: true,
      }

      assertMarket(givenTokens, expectedResult)
    })
  })

  describe('VOLATILE/STABLE Market', () => {
    test('When selling VOLATILE, STABLE is quote', () => {
      const givenTokens = {
        sellToken: WETH,
        receiveToken: USDT,
      }
      const expectedResult = {
        quoteToken: USDT,
        baseToken: WETH,
        wasPriorityAdjusted: true,
      }

      assertMarket(givenTokens, expectedResult)
    })

    test('When selling STABLE, STABLE is quote', () => {
      const givenTokens = {
        sellToken: USDT,
        receiveToken: WETH,
      }
      const expectedResult = {
        quoteToken: USDT,
        baseToken: WETH,
        wasPriorityAdjusted: false,
      }

      assertMarket(givenTokens, expectedResult)
    })
  })

  describe('VOLATILE/STABLE Market', () => {
    test('When selling VOLATILE, STABLE is quote', () => {
      const givenTokens = {
        sellToken: WETH,
        receiveToken: USDT,
      }
      const expectedResult = {
        quoteToken: USDT,
        baseToken: WETH,
        wasPriorityAdjusted: true,
      }

      assertMarket(givenTokens, expectedResult)
    })

    test('When selling STABLE, STABLE is quote', () => {
      const givenTokens = {
        sellToken: USDT,
        receiveToken: WETH,
      }
      const expectedResult = {
        quoteToken: USDT,
        baseToken: WETH,
        wasPriorityAdjusted: false,
      }

      assertMarket(givenTokens, expectedResult)
    })
  })

  describe('VOLATILE/WETH Market', () => {
    test('When selling WETH, WETH is quote', () => {
      const givenTokens = {
        sellToken: WETH,
        receiveToken: FAKE,
      }
      const expectedResult = {
        quoteToken: WETH,
        baseToken: FAKE,
        wasPriorityAdjusted: false,
      }

      assertMarket(givenTokens, expectedResult)
    })

    test('When selling STABLE, STABLE is quote', () => {
      const givenTokens = {
        sellToken: FAKE,
        receiveToken: WETH,
      }
      const expectedResult = {
        quoteToken: WETH,
        baseToken: FAKE,
        wasPriorityAdjusted: true,
      }

      assertMarket(givenTokens, expectedResult)
    })
  })

  describe('VOLATILE/VOLATILE Market', () => {
    test('When selling VOLATILE1, VOLATILE1 is quote', () => {
      const givenTokens = {
        sellToken: FAKE,
        receiveToken: FAKE2,
      }
      const expectedResult = {
        quoteToken: FAKE,
        baseToken: FAKE2,
        wasPriorityAdjusted: false,
      }

      assertMarket(givenTokens, expectedResult)
    })

    test('When selling VOLATILE2, VOLATILE2 is quote', () => {
      const givenTokens = {
        sellToken: FAKE2,
        receiveToken: FAKE,
      }
      const expectedResult = {
        quoteToken: FAKE2,
        baseToken: FAKE,
        wasPriorityAdjusted: false,
      }

      assertMarket(givenTokens, expectedResult)
    })
  })
})
