import React from 'react'
import { render } from 'enzyme'
import BN from 'bn.js'

import { TokenBalanceDetails } from 'types'
import { Row, RowProps } from 'components/DepositWidget/Row'
import { ZERO, ONE } from 'const'

function _createRow(params: Partial<TokenBalanceDetails> = {}): React.ReactElement<RowProps> {
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
    claiming: false,
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
      innerWidth={500}
    />
  )
}

describe('<Row /> not enabled token', () => {
  it('contains 6 <div> elements', () => {
    const wrapper = render(_createRow())
    expect(wrapper.find('div')).toHaveLength(6)
  })

  it('contains 1 <button> (enable)', () => {
    const wrapper = render(_createRow())
    expect(wrapper.find('button')).toHaveLength(1)
  })
})

describe('<Row /> enabled token', () => {
  const tokenBalanceDetails: Partial<TokenBalanceDetails> = {
    enabled: true,
  }

  it('contains 6 <div> elements', () => {
    const wrapper = render(_createRow(tokenBalanceDetails))
    expect(wrapper.find('div')).toHaveLength(6)
  })

  it('contains 2 <button> elements (deposit and withdraw)', () => {
    const wrapper = render(_createRow(tokenBalanceDetails))
    expect(wrapper.find('button')).toHaveLength(2)
  })
})

describe('<Row /> claimable token', () => {
  const tokenBalanceDetails: Partial<TokenBalanceDetails> = {
    enabled: true,
    claimable: true,
    withdrawingBalance: ONE,
  }

  it('contains 2 <button> elements (claim, deposit, withdraw)', () => {
    const wrapper = render(_createRow(tokenBalanceDetails))
    expect(wrapper.find('button')).toHaveLength(3)
  })
})

describe('<Row /> style', () => {
  it('is highlighted', () => {
    const wrapper = render(
      _createRow({
        highlighted: true,
      }),
    )
    expect(wrapper.attr('class')).toMatch(/highlight/)
  })

  it('is enabling', () => {
    const wrapper = render(
      _createRow({
        enabling: true,
      }),
    )
    expect(wrapper.attr('class')).toMatch(/enabling/)
  })
})
