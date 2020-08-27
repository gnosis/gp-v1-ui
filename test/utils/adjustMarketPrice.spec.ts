import { checkMarketAndSmartAdjust } from 'hooks/usePrioritiseTokensForPrice'
import tokenList from '../data/tokenList'

// QUOTE gives price
//     BASE/QUOTE
// e.g WETH/TUSD

describe('Check market and check base/quote token priorities', () => {
  const [WETH, TUSD, USDT, , , , , FAKE] = tokenList

  test('STABLE/STABLE => return with no change', () => {
    // QUOTE
    const sellToken = TUSD
    // BASE
    const receiveToken = USDT

    sellToken.priority = 1
    receiveToken.priority = 1

    // Run through checkMarketFn
    const adjustedMarket = checkMarketAndSmartAdjust({ sellToken, receiveToken })

    const expectedData = {
      // TUSD
      baseToken: receiveToken,
      // USDT
      quoteToken: sellToken,
      wasPriorityAdjusted: false,
    }

    expect(adjustedMarket).toEqual(expectedData)
  })

  test('WETH/STABLE => Price in STABLE', () => {
    // QUOTE
    const sellToken = TUSD
    // BASE
    const receiveToken = WETH

    sellToken.priority = 1
    receiveToken.priority = 3

    // Run through checkMarketFn
    const adjustedMarket = checkMarketAndSmartAdjust({ sellToken, receiveToken })

    const expectedData = {
      // WETH
      baseToken: receiveToken,
      // TUSD
      quoteToken: sellToken,
      wasPriorityAdjusted: false,
    }

    expect(adjustedMarket).toEqual(expectedData)
  })

  test('STABLE/WETH => Price in STABLE', () => {
    // QUOTE
    const sellToken = WETH
    // BASE
    const receiveToken = USDT

    sellToken.priority = 3
    receiveToken.priority = 1

    // Run through checkMarketFn
    const adjustedMarket = checkMarketAndSmartAdjust({ sellToken, receiveToken })

    const expectedData = {
      // WETH
      baseToken: sellToken,
      // USDT
      quoteToken: receiveToken,
      wasPriorityAdjusted: true,
    }

    expect(adjustedMarket).toEqual(expectedData)
  })

  test('VOLATILE/STABLE => Price in STABLE', () => {
    // QUOTE
    const sellToken = USDT
    // BASE
    const receiveToken = FAKE

    sellToken.priority = 1
    receiveToken.priority = undefined

    // Run through checkMarketFn
    const adjustedMarket = checkMarketAndSmartAdjust({ sellToken, receiveToken })

    const expectedData = {
      // FAKE
      baseToken: receiveToken,
      // USDT
      quoteToken: sellToken,
      wasPriorityAdjusted: false,
    }

    expect(adjustedMarket).toEqual(expectedData)
  })

  test('STABLE/VOLATILE => Price in STABLE', () => {
    // QUOTE
    const sellToken = FAKE
    // BASE
    const receiveToken = USDT

    sellToken.priority = undefined
    receiveToken.priority = 1

    // Run through checkMarketFn
    const adjustedMarket = checkMarketAndSmartAdjust({ sellToken, receiveToken })

    const expectedData = {
      // FAKE
      baseToken: sellToken,
      // USDT
      quoteToken: receiveToken,
      wasPriorityAdjusted: true,
    }

    expect(adjustedMarket).toEqual(expectedData)
  })

  test('WETH/VOLATILE => Price in WETH', () => {
    // QUOTE
    const sellToken = FAKE
    // BASE
    const receiveToken = WETH

    sellToken.priority = undefined
    receiveToken.priority = 3

    // Run through checkMarketFn
    const adjustedMarket = checkMarketAndSmartAdjust({ sellToken, receiveToken })

    const expectedData = {
      // FAKE
      baseToken: sellToken,
      // WETH
      quoteToken: receiveToken,
      wasPriorityAdjusted: true,
    }

    expect(adjustedMarket).toEqual(expectedData)
  })

  test('VOLATILE/WETH => Price in WETH', () => {
    // QUOTE
    const sellToken = WETH
    // BASE
    const receiveToken = FAKE

    sellToken.priority = 3
    receiveToken.priority = undefined

    // Run through checkMarketFn
    const adjustedMarket = checkMarketAndSmartAdjust({ sellToken, receiveToken })

    const expectedData = {
      // FAKE
      baseToken: receiveToken,
      // WETH
      quoteToken: sellToken,
      wasPriorityAdjusted: false,
    }

    expect(adjustedMarket).toEqual(expectedData)
  })

  test('VOLATILE/VOLATILE => no change', () => {
    // QUOTE
    const sellToken = FAKE
    // BASE
    const receiveToken = FAKE

    sellToken.priority = undefined
    receiveToken.priority = undefined

    // Run through checkMarketFn
    const adjustedMarket = checkMarketAndSmartAdjust({ sellToken, receiveToken })

    const expectedData = {
      // FAKE
      baseToken: receiveToken,
      // FAKE
      quoteToken: sellToken,
      wasPriorityAdjusted: false,
    }

    expect(adjustedMarket).toEqual(expectedData)
  })
})
