import { ZERO, ONE, ALLOWANCE_MAX_VALUE } from 'const'
import { formatAmountFull, toWei } from 'utils'
import BN from 'bn.js'
import { DEFAULT_PRECISION } from '../data'

describe('Integer amounts', () => {
  test('1 Ether', async () => {
    expect(formatAmountFull(new BN(toWei(new BN('1'), 'ether')), DEFAULT_PRECISION)).toEqual('1')
  })

  test('12,345 Ether', async () => {
    expect(formatAmountFull(new BN(toWei(new BN('12345'), 'ether')), DEFAULT_PRECISION)).toEqual('12,345')
  })

  test('0100 Ether', async () => {
    expect(formatAmountFull(new BN(toWei(new BN('0100'), 'ether')), DEFAULT_PRECISION)).toEqual('100')
  })

  test('123,456,789,012 Ether', async () => {
    expect(formatAmountFull(new BN(toWei(new BN('123456789012'), 'ether')), DEFAULT_PRECISION)).toEqual(
      '123,456,789,012',
    )
  })
})

describe('Exact decimal amounts', () => {
  test('0.5 Ether', async () => {
    expect(formatAmountFull(new BN(toWei(new BN('500'), 'milliether')), DEFAULT_PRECISION)).toEqual('0.5')
  })

  test('1.234 Ether', async () => {
    expect(formatAmountFull(new BN(toWei(new BN('1234'), 'milliether')), DEFAULT_PRECISION)).toEqual('1.234')
  })

  test('1.2345 Ether', async () => {
    expect(formatAmountFull(new BN(toWei(new BN('1234500'), 'microether')), DEFAULT_PRECISION)).toEqual('1.2345')
  })
})

describe('Rounding amounts', () => {
  test('0', async () => {
    expect(formatAmountFull(ZERO, DEFAULT_PRECISION)).toEqual('0')
  })

  test('1 wei', async () => {
    expect(formatAmountFull(ONE, DEFAULT_PRECISION)).toEqual('0.000000000000000001')
  })

  test('1000 wei', async () => {
    expect(formatAmountFull(new BN('1000'), DEFAULT_PRECISION)).toEqual('0.000000000000001')
  })

  test('1.23451 Ether', async () => {
    expect(formatAmountFull(new BN(toWei(new BN('1234510'), 'microether')), DEFAULT_PRECISION)).toEqual('1.23451')
  })

  test('1.234567890123456789 Ether', async () => {
    expect(formatAmountFull(new BN('1234567890123456789'), DEFAULT_PRECISION)).toEqual('1.234567890123456789')
  })
})

describe('Tokens with precision 6', () => {
  test('1 unit', async () => {
    const amount = new BN('1000000')
    expect(formatAmountFull(amount, 6)).toEqual('1')
  })

  test('12,345 units', async () => {
    const amount = new BN('12345000000')
    expect(formatAmountFull(amount, 6)).toEqual('12,345')
  })

  test('4,567,890.123444 units, round down', async () => {
    const amount = new BN('4567890123444')
    expect(formatAmountFull(amount, 6)).toEqual('4,567,890.123444')
  })
})

describe('Big amounts', () => {
  // TODO: Considering showing K,M,B,...
  test('1B Ether', async () => {
    expect(formatAmountFull(new BN(toWei(new BN('1000000000'), 'ether')), DEFAULT_PRECISION)).toEqual('1,000,000,000')
  })

  // TODO: Define what for arbitrarily big amounts
  test('uint max value', async () => {
    const expected =
      '115,792,089,237,316,195,423,570,985,008,687,907,853,269,984,665,640,564,039,457.584007913129639935'
    expect(formatAmountFull(new BN(new BN(ALLOWANCE_MAX_VALUE)), DEFAULT_PRECISION)).toEqual(expected)
  })
})
