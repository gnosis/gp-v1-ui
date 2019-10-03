import React from 'react'
import { render } from 'enzyme'

import { TxNotification } from 'components/TxNotification'
import { TX_HASH } from '../data'
import { abbreviateString } from 'utils'
import { Network, WalletInfo } from 'types'

let networkId: Network = undefined

jest.mock('hooks/useWalletConnection', () => {
  return {
    useWalletConnection: (): WalletInfo => {
      return { isConnected: true, networkId }
    },
  }
})

describe('<TxNotification />', () => {
  it('renders the abbreviated tx hash inside a link', () => {
    const wrapper = render(<TxNotification txHash={TX_HASH} />)
    const abbreviatedTxHash = abbreviateString(TX_HASH, 6, 4)

    expect(wrapper.find('a')).toHaveLength(1)
    expect(wrapper.find('a').text()).toEqual(abbreviatedTxHash)
  })

  it('renders link to mainnet when empty', () => {
    const wrapper = render(<TxNotification txHash={TX_HASH} />)
    expect(wrapper.find('a').prop('href')).toMatch(`https://etherscan.io/tx/${TX_HASH}`)
  })

  it('renders link to mainnet when set explicitly', () => {
    networkId = Network.Mainnet
    const wrapper = render(<TxNotification txHash={TX_HASH} />)
    expect(wrapper.find('a').prop('href')).toMatch(`https://etherscan.io/tx/${TX_HASH}`)
  })

  it('renders link to rinkeby', () => {
    networkId = Network.Rinkeby
    const wrapper = render(<TxNotification txHash={TX_HASH} />)
    expect(wrapper.find('a').prop('href')).toMatch(`https://rinkeby.etherscan.io/tx/${TX_HASH}`)
  })
})
