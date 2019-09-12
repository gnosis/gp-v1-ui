import * as React from 'react'
import { render } from 'enzyme'

import { TokenBalanceDetails } from 'types'
import { Row } from 'components/DepositWidget/Row'

describe('<Row /> with deposit and withdraw', () => {
  const tokenBalanceDetails: TokenBalanceDetails = {
    address: '0x0',
    exchangeWallet: 25,
    pendingDeposits: 0,
    pendingWithdraws: 11,
    enabled: false,
  }

  it('renders single <tr> element', () => {
    const wrapper = render(<Row tokenBalances={tokenBalanceDetails} />)
    expect(wrapper.is('tr')).toBe(true)
  })

  it('contains 7 <td> elements', () => {
    const wrapper = render(<Row tokenBalances={tokenBalanceDetails} />)
    expect(wrapper.find('td')).toHaveLength(7)
  })

  it('contains 2 <button> elements', () => {
    const wrapper = render(<Row tokenBalances={tokenBalanceDetails} />)
    expect(wrapper.find('button')).toHaveLength(2)
  })
})

describe('<Row /> with enable', () => {
  const tokenBalanceDetails: TokenBalanceDetails = {
    address: '0x0',
    exchangeWallet: 25,
    pendingDeposits: 0,
    pendingWithdraws: 11,
    enabled: true,
  }

  it('renders single <tr> element', () => {
    const wrapper = render(<Row tokenBalances={tokenBalanceDetails} />)
    expect(wrapper.is('tr')).toBe(true)
  })

  it('contains 6 <td> elements', () => {
    const wrapper = render(<Row tokenBalances={tokenBalanceDetails} />)
    expect(wrapper.find('td')).toHaveLength(6)
  })

  it('contains 1 <button> element', () => {
    const wrapper = render(<Row tokenBalances={tokenBalanceDetails} />)
    expect(wrapper.find('button')).toHaveLength(1)
  })
})
