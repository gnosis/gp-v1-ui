import tokenList from '../data/tokenList'
import { TokenDetails } from 'types'
import { getMarket } from 'utils'

// QUOTE gives price
//     BASE/QUOTE
// e.g WETH/TUSD

interface Params {
  quoteToken: TokenDetails
  baseToken: TokenDetails
}

function assertMarket(expected: Params & { wasPriorityAdjusted: boolean }, { quoteToken, baseToken }: Params): void {
  // Run through checkMarketFn
  const adjustedMarket = getMarket({ sellToken: quoteToken, receiveToken: baseToken })

  expect(adjustedMarket).toEqual(expected)
}

describe('Check market and check base/quote token priorities', () => {
  const [WETH, TUSD, USDT, , , , , FAKE] = tokenList
  WETH.priority = 3
  TUSD.priority = 1
  USDT.priority = 1
  FAKE.priority = Number.MAX_SAFE_INTEGER

  test('STABLE/STABLE => return with no change USDT/TUSD', () => {
    const expectedData = {
      baseToken: USDT,
      quoteToken: TUSD,
      wasPriorityAdjusted: false,
    }

    // Expected, Given Market
    assertMarket(expectedData, { quoteToken: TUSD, baseToken: USDT })
  })

  test('STABLE/STABLE => return with no change TUSD/USDT', () => {
    const expectedData = {
      baseToken: TUSD,
      quoteToken: USDT,
      wasPriorityAdjusted: false,
    }

    assertMarket(expectedData, { baseToken: TUSD, quoteToken: USDT })
  })

  test('WETH/STABLE => Price in STABLE', () => {
    const expectedData = {
      baseToken: WETH,
      quoteToken: TUSD,
      wasPriorityAdjusted: false,
    }

    assertMarket(expectedData, { baseToken: WETH, quoteToken: TUSD })
  })

  test('STABLE/WETH => Price in STABLE', () => {
    const expectedData = {
      baseToken: WETH,
      quoteToken: USDT,
      wasPriorityAdjusted: true,
    }

    assertMarket(expectedData, { baseToken: USDT, quoteToken: WETH })
  })

  test('VOLATILE/STABLE => Price in STABLE', () => {
    const expectedData = {
      baseToken: FAKE,
      quoteToken: USDT,
      wasPriorityAdjusted: false,
    }

    assertMarket(expectedData, { baseToken: FAKE, quoteToken: USDT })
  })

  test('STABLE/VOLATILE => Price in STABLE', () => {
    const expectedData = {
      baseToken: FAKE,
      quoteToken: USDT,
      wasPriorityAdjusted: true,
    }

    assertMarket(expectedData, { baseToken: USDT, quoteToken: FAKE })
  })

  test('WETH/VOLATILE => Price in WETH', () => {
    const expectedData = {
      baseToken: FAKE,
      quoteToken: WETH,
      wasPriorityAdjusted: true,
    }

    assertMarket(expectedData, { baseToken: WETH, quoteToken: FAKE })
  })

  test('VOLATILE/WETH => Price in WETH', () => {
    const expectedData = {
      baseToken: FAKE,
      quoteToken: WETH,
      wasPriorityAdjusted: false,
    }

    assertMarket(expectedData, { baseToken: FAKE, quoteToken: WETH })
  })

  test('VOLATILE/VOLATILE => no change', () => {
    const expectedData = {
      baseToken: FAKE,
      quoteToken: FAKE,
      wasPriorityAdjusted: false,
    }

    assertMarket(expectedData, { baseToken: FAKE, quoteToken: FAKE })
  })
})
