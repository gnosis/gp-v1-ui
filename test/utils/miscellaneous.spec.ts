import { tokenList } from '../data'
import { getToken } from 'utils'
import BN from 'bn.js'

describe('getToken', () => {
  describe('empty cases', () => {
    it('returns `undefined` on `undefined` symbol', () => {
      expect(getToken('symbol', undefined, tokenList)).toBeUndefined()
    })
    it('returns `undefined` on empty tokens list', () => {
      expect(getToken('symbol', 'any', [])).toBeUndefined()
    })
    it('returns `undefined` on `undefined` tokens list', () => {
      expect(getToken('symbol', 'any', undefined)).toBeUndefined()
    })
    it('returns `undefined` on `null` tokens list', () => {
      expect(getToken('symbol', 'any', null)).toBeUndefined()
    })
    it('returns `undefined` when value not in tokens list', () => {
      expect(getToken('symbol', 'any', tokenList)).toBeUndefined()
    })
    it('returns `undefined` when id not found', () => {
      expect(getToken('id', -1, tokenList)).toBeUndefined()
    })
  })

  describe('value is a number', () => {
    it('returns token when id in the list', () => {
      const expected = tokenList[0]
      const actual = getToken('id', expected.id, tokenList)
      expect(actual).not.toBeUndefined()
      expect(actual).toBe(expected)
    })
  })

  describe('string case', () => {
    it('ignores `value` case', () => {
      const expected = tokenList[0]
      const lowerCaseSymbol = expected.symbol?.toLowerCase()
      const actual = getToken('symbol', lowerCaseSymbol, tokenList)
      expect(actual).not.toBeUndefined()
      expect(actual).toBe(expected)
    })

    it("it's case insensitive", () => {
      const expected = tokenList[0]
      const actual = getToken('symbol', expected.symbol?.toLowerCase(), tokenList)
      expect(actual).not.toBeUndefined()
      expect(actual).toBe(expected)
    })
  })

  describe('TokenDetails', () => {
    it('finds a token by symbol', () => {
      const expected = tokenList[0]
      const actual = getToken('symbol', expected.symbol, tokenList)
      expect(actual).not.toBeUndefined()
      expect(actual).toBe(expected)
    })

    it('finds a token by address', () => {
      const expected = tokenList[0]
      const actual = getToken('address', expected.address, tokenList)
      expect(actual).not.toBeUndefined()
      expect(actual).toBe(expected)
    })
  })

  describe('TokenBalanceDetails', () => {
    const balances = [
      {
        ...tokenList[0],
        exchangeBalance: new BN(0),
        depositingBalance: new BN(0),
        withdrawingBalance: new BN(0),
        claimable: true,
        walletBalance: new BN(0),
        enabled: true,
        highlighted: false,
        enabling: false,
        claiming: false,
      },
    ]
    it('finds item in TokenBalanceDetails[]', () => {
      const expected = balances[0]
      const actual = getToken('symbol', expected.symbol, balances)
      expect(actual).not.toBeUndefined()
      expect(actual).toBe(expected)
    })
  })
})
