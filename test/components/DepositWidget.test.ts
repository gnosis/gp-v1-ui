import { getButtonText, ButtonTypes } from '../../src/components/DepositWidget/Row'

describe('Get text for buttons', () => {
  test('Deposit', () => {
    expect(getButtonText(ButtonTypes.DEPOSIT, '')).toMatch(/Deposit/)
  })
  test('Withdraw', () => {
    expect(getButtonText(ButtonTypes.WITHDRAW, '')).toMatch(/Withdraw/)
  })
  test('Enable', () => {
    expect(getButtonText(ButtonTypes.ENABLE, 'TTT')).toMatch(/Enable TTT/)
  })
})
