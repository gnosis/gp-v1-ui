import { getButtonText, ButtonTypes } from '../../components/DepositWidget/Row'

test('Deposit button text', () => {
  expect(getButtonText(ButtonTypes.DEPOSIT, '')).toMatch(/Deposit/)
})
test('Withdraw button text', () => {
  expect(getButtonText(ButtonTypes.WITHDRAW, '')).toMatch(/Withdraw/)
})
test('Deposit button text', () => {
  expect(getButtonText(ButtonTypes.ENABLE, 'TTT')).toMatch(/Enable TTT/)
})
