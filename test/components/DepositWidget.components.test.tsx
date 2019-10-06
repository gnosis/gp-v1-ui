import React from 'react'
import { render } from 'enzyme'
import BN from 'bn.js'

import { TokenBalanceDetails } from 'types'
import { Row, RowProps } from 'components/DepositWidget/Row'
import { ZERO } from 'const'

function _createRow(params: Partial<TokenBalanceDetails>): React.ReactElement<RowProps> {
  const tokenBalanceDetails: TokenBalanceDetails = {
    name: 'Test token',
    symbol: 'TTT',
    decimals: 18,
    address: '0x0',
    exchangeBalance: ZERO,
    depositingBalance: ZERO,
    withdrawingBalance: ZERO,
    claimable: false,
    walletBalance: ZERO,
    enabled: false,
    highlighted: false,
    enabling: false,
    withdrawing: false,
    // override with partial params
    ...params,
  }

  const onSubmitDeposit = jest.fn<Promise<void>, BN[]>()
  const onClaim = jest.fn<Promise<void>, void[]>()
  const onEnableToken = jest.fn<Promise<void>, void[]>()
  const onSubmitWithdraw = jest.fn<Promise<void>, BN[]>()
  return (
    <Row
      tokenBalances={tokenBalanceDetails}
      onEnableToken={onEnableToken}
      onClaim={onClaim}
      onSubmitDeposit={onSubmitDeposit}
      onSubmitWithdraw={onSubmitWithdraw}
    />
  )
}

describe('<Row /> not enabled', () => {
  const tokenBalanceDetails: Partial<TokenBalanceDetails> = {
    exchangeBalance: new BN(25),
    withdrawingBalance: new BN(11),
    claimable: true,
    walletBalance: new BN(2),
  }

  it('renders single <tr> element', () => {
    // FIX ME: ...callbacks didn't work, review wht
    const wrapper = render(_createRow(tokenBalanceDetails))
    expect(wrapper.is('tr')).toBe(true)
  })

  it('contains 6 <td> elements', () => {
    const wrapper = render(_createRow(tokenBalanceDetails))
    expect(wrapper.find('td')).toHaveLength(6)
  })

  it('contains 2 <button> elements', () => {
    const wrapper = render(_createRow(tokenBalanceDetails))
    expect(wrapper.find('button')).toHaveLength(2)
  })
})

describe('<Row /> with enable', () => {
  const tokenBalanceDetails: Partial<TokenBalanceDetails> = {
    exchangeBalance: new BN(25),
    withdrawingBalance: new BN(11),
    claimable: true,
    walletBalance: new BN(2),
    enabled: true,
  }

  it('renders single <tr> element', () => {
    const wrapper = render(_createRow(tokenBalanceDetails))
    expect(wrapper.is('tr')).toBe(true)
  })

  it('contains 6 <td> elements', () => {
    const wrapper = render(_createRow(tokenBalanceDetails))
    expect(wrapper.find('td')).toHaveLength(6)
  })

  it('contains 3 <button> element', () => {
    const wrapper = render(_createRow(tokenBalanceDetails))

    expect(wrapper.find('button')).toHaveLength(3)
  })
})
