import React from 'react'
import { render } from 'enzyme'
import BN from 'bn.js'

import { Row, RowProps } from 'components/DepositWidget/Row'

import { ZERO, ONE } from 'const'
import { TokenBalanceDetails } from 'types'
import { TokenLocalState } from 'reducers-actions'
import { createFlux } from '../data'

const fakeRowState: Record<keyof TokenLocalState, boolean> = {
  enabling: false,
  enabled: false,
  claiming: false,
  depositing: false,
  withdrawing: false,
  highlighted: false,
}

const initialTokenBalanceDetails = {
  id: 1,
  name: 'Test token',
  symbol: 'TTT',
  decimals: 18,
  address: '0x0',
  exchangeBalance: ZERO,
  totalExchangeBalance: ZERO,
  pendingDeposit: createFlux(),
  pendingWithdraw: createFlux(),
  claimable: false,
  walletBalance: ZERO,
  enabled: false,
}

function _createRow(params: Partial<TokenBalanceDetails> = {}, rowProps = fakeRowState): React.ReactElement<RowProps> {
  const tokenBalanceDetails: TokenBalanceDetails = {
    ...initialTokenBalanceDetails,
    // override with partial params
    ...params,
  }

  const onSubmitDeposit = jest.fn<Promise<void>, [BN, Function]>()
  const onClaim = jest.fn<Promise<void>, []>()
  const onEnableToken = jest.fn<Promise<void>, []>()
  const onSubmitWithdraw = jest.fn<Promise<void>, [BN, Function]>()
  return (
    <Row
      tokenBalances={tokenBalanceDetails}
      onEnableToken={onEnableToken}
      onClaim={onClaim}
      onSubmitDeposit={onSubmitDeposit}
      onSubmitWithdraw={onSubmitWithdraw}
      innerWidth={500}
      {...rowProps}
    />
  )
}

describe('<Row /> not enabled token', () => {
  it('contains 5 <td> elements', () => {
    const wrapper = render(_createRow())
    expect(wrapper.find('td')).toHaveLength(5)
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

  it('contains 5 <td> elements', () => {
    const wrapper = render(_createRow(tokenBalanceDetails))
    expect(wrapper.find('td')).toHaveLength(5)
  })

  it('contains 1 <button> elements (deposit)', () => {
    const wrapper = render(_createRow(tokenBalanceDetails))
    expect(wrapper.find('button')).toHaveLength(1)
  })
})

describe('<Row /> enabled token and wallet balance', () => {
  const tokenBalanceDetails: Partial<TokenBalanceDetails> = {
    enabled: true,
    totalExchangeBalance: ONE,
  }

  it('contains 2 <button> elements (deposit + withdraw)', () => {
    const wrapper = render(_createRow(tokenBalanceDetails))
    expect(wrapper.find('button')).toHaveLength(2)
  })
})

describe('<Row /> disabled token and wallet balance', () => {
  const tokenBalanceDetails: Partial<TokenBalanceDetails> = {
    enabled: false,
    totalExchangeBalance: ONE,
  }

  it('contains 2 <button> elements (enable + withdraw)', () => {
    const wrapper = render(_createRow(tokenBalanceDetails))
    expect(wrapper.find('button')).toHaveLength(2)
  })
})

describe('<Row /> claimable token', () => {
  const tokenBalanceDetails: Partial<TokenBalanceDetails> = {
    enabled: true,
    claimable: true,
    totalExchangeBalance: ONE,
    pendingWithdraw: createFlux(ONE),
  }

  it('contains 2 <button> elements (claim, deposit, withdraw)', () => {
    const wrapper = render(_createRow(tokenBalanceDetails))
    expect(wrapper.find('button')).toHaveLength(3)
  })
})

describe('<Row /> style', () => {
  it('is highlighted', () => {
    const wrapper = render(
      _createRow(undefined, {
        ...fakeRowState,
        highlighted: true,
      }),
    )
    expect(wrapper.attr('class')).toMatch(/highlight/)
  })

  it('is enabling', () => {
    const wrapper = render(
      _createRow(undefined, {
        ...fakeRowState,
        highlighted: false,
        enabling: true,
      }),
    )
    expect(wrapper.attr('class')).toMatch(/enabling/)
  })
})
