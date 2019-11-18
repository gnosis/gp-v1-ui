import { adjustPrecision } from 'utils'

describe('bellow precision', () => {
  test('with decimals', () => {
    expect(adjustPrecision('1.1', 3)).toBe('1.1')
  })
  test('only integers', () => {
    expect(adjustPrecision('1', 3)).toBe('1')
  })
  test('partial number', () => {
    expect(adjustPrecision('1.', 3)).toBe('1.')
  })
})

describe('over precision', () => {
  test('truncating', () => {
    expect(adjustPrecision('1.2345', 3)).toBe('1.234')
  })
  test('zero padding', () => {
    expect(adjustPrecision('1.00000000', 2)).toBe('1.00')
  })
})

describe('null values', () => {
  test('empty string', () => {
    expect(adjustPrecision('', 2)).toBe('')
  })
  test('undefined', () => {
    expect(adjustPrecision(undefined, 2)).toBe('')
  })
  test('null', () => {
    expect(adjustPrecision(null, 2)).toBe('')
  })
})
