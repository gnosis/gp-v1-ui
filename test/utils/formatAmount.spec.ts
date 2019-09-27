import { ZERO, ONE, ALLOWANCE_VALUE } from 'const'
import { formatAmount, toWei } from 'utils'
import BN from 'bn.js'

describe('Integer amounts', () => {
  test('0 wei', async () => {
    expect(formatAmount(new BN('0'))).toEqual('0')
  })

  test('1 Ether', async () => {
    expect(formatAmount(new BN(toWei(new BN('1'), 'ether')))).toEqual('1')
  })

  test('12,345 Ether', async () => {
    expect(formatAmount(new BN(toWei(new BN('12345'), 'ether')))).toEqual('12,345')
  })

  test('0100 Ether', async () => {
    expect(formatAmount(new BN(toWei(new BN('0100'), 'ether')))).toEqual('100')
  })

  test('123,456,789,012 Ether', async () => {
    expect(formatAmount(new BN(toWei(new BN('123456789012'), 'ether')))).toEqual('123,456,789,012')
  })
})

describe('Exact decimal amounts', () => {
  test('0.5 Ether', async () => {
    expect(formatAmount(new BN(toWei(new BN('500'), 'milliether')))).toEqual('0.5')
  })

  test('1.234 Ether', async () => {
    expect(formatAmount(new BN(toWei(new BN('1234'), 'milliether')))).toEqual('1.234')
  })

  test('1.2345 Ether', async () => {
    expect(formatAmount(new BN(toWei(new BN('1234500'), 'microether')))).toEqual('1.2345')
  })
})

describe('Rounding amounts', () => {
  test('0', async () => {
    expect(formatAmount(ZERO)).toEqual('0')
  })

  test('1 wei', async () => {
    expect(formatAmount(ONE)).toEqual('0')
  })

  test('1000 wei', async () => {
    expect(formatAmount(new BN('1000'))).toEqual('0')
  })

  test('1.23451 Ether, round down', async () => {
    expect(formatAmount(new BN(toWei(new BN('1234510'), 'microether')))).toEqual('1.2345')
  })

  test('1.23456 Ether, round up', async () => {
    expect(formatAmount(new BN(toWei(new BN('1234560'), 'microether')))).toEqual('1.2346')
  })

  test('1.234567890123456789 Ether', async () => {
    expect(formatAmount(new BN('1234567890123456789'))).toEqual('1.2346')
  })
})

describe('Tokens with precision 6', () => {
  test('1 unit', async () => {
    const amount = new BN('1000000')
    expect(formatAmount(amount, 6)).toEqual('1')
  })

  test('12,345 units', async () => {
    const amount = new BN('12345000000')
    expect(formatAmount(amount, 6)).toEqual('12,345')
  })

  test('4,567,890.123444 units, round down', async () => {
    const amount = new BN('4567890123444')
    expect(formatAmount(amount, 6)).toEqual('4,567,890.1234')
  })

  test('4,567,890.123455 units, round up', async () => {
    const amount = new BN('4567890123455')
    expect(formatAmount(amount, 6)).toEqual('4,567,890.1235')
  })
})

describe('Tokens with precision 0', () => {
  test('1 unit', async () => {
    const amount = new BN('1')
    expect(formatAmount(amount, 0)).toEqual('1')
  })

  test('12,345 units', async () => {
    const amount = new BN('12345')
    expect(formatAmount(amount, 0)).toEqual('12,345')
  })

  test('4,567,890 units', async () => {
    const amount = new BN('4567890')
    expect(formatAmount(amount, 0)).toEqual('4,567,890')
  })
})

describe('Tokens with precision 2', () => {
  test('1 unit', async () => {
    const amount = new BN('100')
    expect(formatAmount(amount, 2)).toEqual('1')
  })

  test('12.34 units', async () => {
    const amount = new BN('1234')
    expect(formatAmount(amount, 2)).toEqual('12.34')
  })

  test('1,234,567.89 units', async () => {
    const amount = new BN('123456789')
    expect(formatAmount(amount, 2)).toEqual('1,234,567.89')
  })

  test('1,234,567.8 units', async () => {
    const amount = new BN('123456780')
    expect(formatAmount(amount, 2)).toEqual('1,234,567.8')
  })
})

describe('2 decimals', () => {
  test('1 unit', async () => {
    const amount = new BN('1000000')
    expect(formatAmount(amount, 6, 2)).toEqual('1')
  })

  test('12.34 units', async () => {
    const amount = new BN('12340000')
    expect(formatAmount(amount, 6, 2)).toEqual('12.34')
  })

  test('4,567,890.123333 units, round down', async () => {
    const amount = new BN('4567890123333')
    expect(formatAmount(amount, 6, 2)).toEqual('4,567,890.12')
  })

  test('4,567,890.125555 units, round up', async () => {
    const amount = new BN('4567890125555')
    expect(formatAmount(amount, 6, 2)).toEqual('4,567,890.13')
  })
})

describe('0 decimals', () => {
  test('1 unit', async () => {
    const amount = new BN('1000000')
    expect(formatAmount(amount, 6, 0)).toEqual('1')
  })

  test('12.34 units', async () => {
    const amount = new BN('12340000')
    expect(formatAmount(amount, 6, 0)).toEqual('12')
  })

  test('4,567,890.123333 units, round down', async () => {
    const amount = new BN('4567890123333')
    expect(formatAmount(amount, 6, 0)).toEqual('4,567,890')
  })

  test('4,567,890.125555 units, round up', async () => {
    const amount = new BN('4567890125555')
    expect(formatAmount(amount, 6, 0)).toEqual('4,567,890')
  })
})

describe('Big amounts', () => {
  // TODO: Considering showing K,M,B,...
  test('1B Ether', async () => {
    expect(formatAmount(new BN(toWei(new BN('1000000000'), 'ether')))).toEqual('1,000,000,000')
  })

  // TODO: Define what for arbitrarily big amounts
  test('uint max value', async () => {
    const expected = '115,792,089,237,316,195,423,570,985,008,687,907,853,269,984,665,640,564,039,457.584'
    expect(formatAmount(new BN(new BN(ALLOWANCE_VALUE)))).toEqual(expected)
  })
})

describe('Edge cases', () => {
  test('12,345.67 - More decimals, than precission', async () => {
    const amount = new BN('1234567')
    expect(formatAmount(amount, 2, 4)).toEqual('12,345.67')
  })
})
