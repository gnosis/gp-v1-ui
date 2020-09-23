import BigNumber from 'bignumber.js'
import { calcMinTradableAmountInOwl, roundToNext } from 'utils/minFee'

const DEFAULT_SUBSIDIZE_FACTOR = 1

describe('calcMinTradableAmountInOwl', () => {
  const samples = {
    gasPrice: [1, 50, 120], // Gwei
    wethPrice: [100, 380, 801], // OWL
  }

  const Gwei = 1e9

  it('calculates amount based on gasPrice and ETH price', () => {
    const results = []

    for (const gasPrice of samples.gasPrice) {
      for (const ethPrice of samples.wethPrice) {
        const minAmountInOwl = calcMinTradableAmountInOwl({
          gasPrice: gasPrice * Gwei,
          ethPriceInOwl: new BigNumber(ethPrice),
          subsidizeFactor: DEFAULT_SUBSIDIZE_FACTOR,
        })

        results.push({
          gasPrice,
          ethPrice,
          minAmountInOwl: minAmountInOwl.toString(10),
        })
      }
    }

    // run tests with --updateSnapshot to recreate snapshots
    expect(results).toMatchInlineSnapshot(`
      Array [
        Object {
          "ethPrice": 100,
          "gasPrice": 1,
          "minAmountInOwl": "21.6",
        },
        Object {
          "ethPrice": 380,
          "gasPrice": 1,
          "minAmountInOwl": "82.08",
        },
        Object {
          "ethPrice": 801,
          "gasPrice": 1,
          "minAmountInOwl": "173.016",
        },
        Object {
          "ethPrice": 100,
          "gasPrice": 50,
          "minAmountInOwl": "1080",
        },
        Object {
          "ethPrice": 380,
          "gasPrice": 50,
          "minAmountInOwl": "4104",
        },
        Object {
          "ethPrice": 801,
          "gasPrice": 50,
          "minAmountInOwl": "8650.8",
        },
        Object {
          "ethPrice": 100,
          "gasPrice": 120,
          "minAmountInOwl": "2592",
        },
        Object {
          "ethPrice": 380,
          "gasPrice": 120,
          "minAmountInOwl": "9849.6",
        },
        Object {
          "ethPrice": 801,
          "gasPrice": 120,
          "minAmountInOwl": "20761.92",
        },
      ]
    `)
  })
})

describe('roundToNext', () => {
  it('rounds up to a number', () => {
    const rounded = roundToNext(1234, 500)

    expect(rounded.isEqualTo(1500)).toBe(true)
  })

  it('does not increase when already matching', () => {
    const rounded = roundToNext(2000, 500)

    expect(rounded.isEqualTo(2000)).toBe(true)
  })
})
