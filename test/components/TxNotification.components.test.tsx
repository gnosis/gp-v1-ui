import React from 'react'
import { render } from 'enzyme'

import { TxNotification } from 'components/TxNotification'
import { TX_HASH } from '../data'
import { abbreviateString } from 'utils'
import { Network, WalletInfo } from 'types'

let isConnected: boolean
let networkId: Network

jest.mock('hooks/useWalletConnection', () => {
  return {
    useWalletConnection: (): WalletInfo => {
      return { isConnected, networkId }
    },
  }
})

describe('<TxNotification />', () => {
  beforeEach(() => {
    isConnected = true
  })

  it("doesn't change when isConnected == false", () => {
    isConnected = false
    networkId = Network.Mainnet
    const wrapper = render(<TxNotification txHash={TX_HASH} />)
    expect(wrapper.find('a').prop('href')).toMatch(`https://etherscan.io/tx/${TX_HASH}`)
  })

  it('renders the abbreviated tx hash inside a link', () => {
    networkId = Network.Mainnet
    const wrapper = render(<TxNotification txHash={TX_HASH} />)
    const abbreviatedTxHash = abbreviateString(TX_HASH, 6, 4)

    expect(wrapper.find('a')).toHaveLength(1)
    expect(wrapper.find('a').text()).toEqual(abbreviatedTxHash)
  })

  it('does not render when networkId is missing', () => {
    networkId = undefined
    const wrapper = render(<TxNotification txHash={TX_HASH} />)
    expect(wrapper.html()).toBeNull()
  })

  it('renders link to mainnet', () => {
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
