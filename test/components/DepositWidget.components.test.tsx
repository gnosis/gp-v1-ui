import * as React from 'react'
import { render } from 'enzyme'

import { RowProps, Row } from '../../src/components/DepositWidget/Row'

describe('<Row /> with deposit and withdraw', () => {
  const props: RowProps = {
    tokenLogo: 'image/path.png',
    tokenName: 'TTT',
    exchangeWallet: 25,
    pendingDeposits: 0,
    pendingWithdraws: 11,
  }

  it('renders single <tr> element', () => {
    const wrapper = render(<Row {...props} />)
    expect(wrapper.is('tr')).toBe(true)
  })

  it('contains 7 <td> elements', () => {
    const wrapper = render(<Row {...props} />)
    expect(wrapper.find('td')).toHaveLength(7)
  })

  it('contains 2 <button> elements', () => {
    const wrapper = render(<Row {...props} />)
    expect(wrapper.find('button')).toHaveLength(2)
  })
})

describe('<Row /> with enable', () => {
  const props: RowProps = {
    tokenLogo: 'image/path.png',
    tokenName: 'TTT',
    exchangeWallet: 25,
    pendingDeposits: 0,
    pendingWithdraws: 11,
    enableToken: true,
  }

  it('renders single <tr> element', () => {
    const wrapper = render(<Row {...props} />)
    expect(wrapper.is('tr')).toBe(true)
  })

  it('contains 6 <td> elements', () => {
    const wrapper = render(<Row {...props} />)
    expect(wrapper.find('td')).toHaveLength(6)
  })

  it('contains 1 <button> element', () => {
    const wrapper = render(<Row {...props} />)
    expect(wrapper.find('button')).toHaveLength(1)
  })
})
// describe('<Button />', () => {
//   it('renders Deposit', () => {
//     const wrapper = render(<Button btnType={ButtonTypes.DEPOSIT} />)
//     expect(wrapper.find(React.Button)).to.have.lengthOf(1)
//   })
// })
