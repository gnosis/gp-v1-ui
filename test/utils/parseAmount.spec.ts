import { toWei, parseAmount } from 'utils'
import BN from 'bn.js'
import { ONE, ZERO, ALLOWANCE_MAX_VALUE } from 'const'

describe('Integer amounts', () => {
  test('0 wei', async () => {
    expect(parseAmount('0')).toEqual(ZERO)
  })

  test('1 Ether', async () => {
    expect(parseAmount('1')).toEqual(new BN(toWei(ONE, 'ether')))
  })

  test('12345 Ether', async () => {
    expect(parseAmount('12345')).toEqual(new BN(toWei(new BN('12345'), 'ether')))
  })

  test('0100 Ether', async () => {
    expect(parseAmount('100')).toEqual(new BN(toWei(new BN('0100'), 'ether')))
  })

  test('123456789012 Ether', async () => {
    expect(parseAmount('123456789012')).toEqual(new BN(toWei(new BN('123456789012'), 'ether')))
  })
})

describe('Exact decimal amounts', () => {
  test('0.5 Ether', async () => {
    expect(parseAmount('0.5')).toEqual(new BN(toWei(new BN('500'), 'milliether')))
  })

  test('1.234 Ether', async () => {
    expect(parseAmount('1.234')).toEqual(new BN(toWei(new BN('1234'), 'milliether')))
  })

  test('1.2345 Ether', async () => {
    expect(parseAmount('1.2345')).toEqual(new BN(toWei(new BN('1234500'), 'microether')))
  })
})

describe('Tokens with precision 6', () => {
  test('1 unit', async () => {
    expect(parseAmount('1', 6)).toEqual(new BN('1000000'))
  })

  test('12345 units', async () => {
    expect(parseAmount('12345', 6)).toEqual(new BN('12345000000'))
  })

  test('4567890.123456 units', async () => {
    expect(parseAmount('4567890.123456', 6)).toEqual(new BN('4567890123456'))
  })
})

describe('Tokens with precision 0', () => {
  test('1 unit', async () => {
    expect(parseAmount('1', 0)).toEqual(new BN('1'))
  })

  test('12345 units', async () => {
    expect(parseAmount('12345', 0)).toEqual(new BN('12345'))
  })

  test('4567890 units', async () => {
    expect(parseAmount('4567890', 0)).toEqual(new BN('4567890'))
  })
})

describe('Tokens with precision 2', () => {
  test('1 unit', async () => {
    expect(parseAmount('1', 2)).toEqual(new BN('100'))
  })

  test('12.34 units', async () => {
    expect(parseAmount('12.34', 2)).toEqual(new BN('1234'))
  })

  test('1234567.89 units', async () => {
    expect(parseAmount('1234567.89', 2)).toEqual(new BN('123456789'))
  })

  test('1234567.8 units', async () => {
    expect(parseAmount('1234567.8', 2)).toEqual(new BN('123456780'))
  })
})

describe('Big amounts', () => {
  // TODO: Considering showing K,M,B,...
  test('1B Ether', async () => {
    expect(parseAmount('1000000000')).toEqual(new BN(toWei(new BN('1000000000'), 'ether')))
  })

  // TODO: Define what for arbitrarily big amounts
  test('uint max value', async () => {
    const input = '115792089237316195423570985008687907853269984665640564039457.584007913129639935'
    expect(parseAmount(input)).toEqual(new BN(new BN(ALLOWANCE_MAX_VALUE)))
  })
})

describe('Over precision', () => {
  test('truncates at precision', () => {
    expect(parseAmount('1.23', 1)).toEqual(new BN('12'))
  })

  test('0 padding', () => {
    expect(parseAmount('10.000', 1)).toEqual(new BN('100'))
  })
})
