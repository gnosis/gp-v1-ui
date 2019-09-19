import React from 'react'
import { render } from 'enzyme'
import BN from 'bn.js'

import { TokenBalanceDetails } from 'types'
import { Row } from 'components/DepositWidget/Row'

describe('<Row /> not enabled', () => {
  const tokenBalanceDetails: TokenBalanceDetails = {
    address: '0x0',
    exchangeBalance: new BN(25),
    depositingBalance: new BN(0),
    withdrawingBalance: new BN(11),
    walletBalance: new BN(2),
    enabled: false,
  }

  it('renders single <tr> element', () => {
    const wrapper = render(<Row tokenBalances={tokenBalanceDetails} />)
    expect(wrapper.is('tr')).toBe(true)
  })

  it('contains 6 <td> elements', () => {
    const wrapper = render(<Row tokenBalances={tokenBalanceDetails} />)
    expect(wrapper.find('td')).toHaveLength(6)
  })

  it('contains 1 <button> elements', () => {
    const wrapper = render(<Row tokenBalances={tokenBalanceDetails} />)
    expect(wrapper.find('button')).toHaveLength(1)
  })
})

describe('<Row /> with enable', () => {
  const tokenBalanceDetails: TokenBalanceDetails = {
    address: '0x0',
    exchangeBalance: new BN(25),
    depositingBalance: new BN(0),
    withdrawingBalance: new BN(11),
    walletBalance: new BN(2),
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

  it('contains 2 <button> element', () => {
    const wrapper = render(<Row tokenBalances={tokenBalanceDetails} />)

    expect(wrapper.find('button')).toHaveLength(2)
  })
})
