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

describe('<Row /> not enabled token', () => {
  it('renders single <tr> element', () => {
    const wrapper = render(_createRow())
    wrapper.hasClass
    expect(wrapper.is('tr')).toBe(true)
  })

  it('contains 6 <td> elements', () => {
    const wrapper = render(_createRow())
    expect(wrapper.find('td')).toHaveLength(6)
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

  it('renders single <tr> element', () => {
    const wrapper = render(_createRow(tokenBalanceDetails))
    expect(wrapper.is('tr')).toBe(true)
  })

  it('contains 6 <td> elements', () => {
    const wrapper = render(_createRow(tokenBalanceDetails))
    expect(wrapper.find('td')).toHaveLength(6)
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
  it.only('is highlighted', () => {
    const wrapper = render(
      _createRow({
        highlighted: true,
      }),
    )
    expect(wrapper.attr('class')).toMatch(/highlight/)
  })

  it.only('is enabling', () => {
    const wrapper = render(
      _createRow({
        enabling: true,
      }),
    )
    expect(wrapper.attr('class')).toMatch(/enabling/)
  })

  // TODO: Click the enable button to have the row selected
  // it.only('is selected', () => {
  //   const wrapper = render(
  //     _createRow({
  //       enabled: true,
  //     }),
  //   )
  //   wrapper.find('button')[0]
  //   expect(wrapper.attr('class')).toMatch(/selected/)
  // })
})
