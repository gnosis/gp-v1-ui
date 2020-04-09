import React from 'react'
import { render } from 'enzyme'

import { EtherscanLink } from 'components/EtherscanLink'
import { TX_HASH, USER_1, CONTRACT, TOKEN_1 } from '../data'
import { abbreviateString } from 'utils'
import { Network } from 'types'
import { WalletInfo } from 'api/wallet/WalletApi'

let isConnected: boolean
let networkId: Network | undefined

jest.mock('hooks/useWalletConnection', () => {
  return {
    useWalletConnection: (): WalletInfo & { networkIdOrDefault: number } => {
      return { isConnected, networkId, networkIdOrDefault: networkId || Network.Mainnet }
    },
  }
})

describe('<EtherscanLink /> general', () => {
  beforeEach(() => {
    isConnected = true
  })

  it("doesn't change when isConnected == false", () => {
    isConnected = false
    networkId = Network.Mainnet
    const wrapper = render(<EtherscanLink type="tx" identifier={TX_HASH} />)
    expect(wrapper.prop('href')).toMatch(`https://etherscan.io/tx/${TX_HASH}`)
  })

  it('renders for mainnet if networkId is missing', () => {
    networkId = undefined
    const wrapper = render(<EtherscanLink type="tx" identifier={TX_HASH} />)
    expect(wrapper.prop('href')).toMatch(`https://etherscan.io/tx/${TX_HASH}`)
  })

  it('renders provided label', () => {
    networkId = Network.Mainnet
    const label = <div>Custom label</div>
    const wrapper = render(<EtherscanLink type="tx" identifier={TX_HASH} label={label} />)

    expect(wrapper.prop('href')).toMatch(`https://etherscan.io/tx/${TX_HASH}`)
    expect(wrapper.find('div').text()).toEqual('Custom label')
  })
})

describe('<EtherscanLink type="tx"/>', () => {
  beforeEach(() => {
    isConnected = true
  })

  it('renders the abbreviated tx hash inside a link', () => {
    networkId = Network.Mainnet
    const wrapper = render(<EtherscanLink type="tx" identifier={TX_HASH} />)
    const abbreviatedTxHash = abbreviateString(TX_HASH, 6, 4)

    expect(wrapper.is('a')).toBe(true)
    expect(wrapper.text()).toEqual(abbreviatedTxHash)
  })

  it('renders link to mainnet', () => {
    networkId = Network.Mainnet
    const wrapper = render(<EtherscanLink type="tx" identifier={TX_HASH} />)
    expect(wrapper.prop('href')).toMatch(`https://etherscan.io/tx/${TX_HASH}`)
  })

  it('renders link to rinkeby', () => {
    networkId = Network.Rinkeby
    const wrapper = render(<EtherscanLink type="tx" identifier={TX_HASH} />)
    expect(wrapper.prop('href')).toMatch(`https://rinkeby.etherscan.io/tx/${TX_HASH}`)
  })
})

describe('<EtherscanLink type="address"/>', () => {
  beforeEach(() => {
    isConnected = true
  })

  it('renders link to mainnet', () => {
    networkId = Network.Mainnet
    const wrapper = render(<EtherscanLink type="address" identifier={USER_1} />)
    expect(wrapper.prop('href')).toMatch(`https://etherscan.io/address/${USER_1}`)
  })
})

describe('<EtherscanLink type="contract"/>', () => {
  beforeEach(() => {
    isConnected = true
  })

  it('renders link to mainnet', () => {
    networkId = Network.Mainnet
    const wrapper = render(<EtherscanLink type="contract" identifier={CONTRACT} />)
    expect(wrapper.prop('href')).toMatch(`https://etherscan.io/address/${CONTRACT}#code`)
  })
})

describe('<EtherscanLink type="token"/>', () => {
  beforeEach(() => {
    isConnected = true
  })

  it('renders link to mainnet', () => {
    networkId = Network.Mainnet
    const wrapper = render(<EtherscanLink type="token" identifier={TOKEN_1} />)
    expect(wrapper.prop('href')).toMatch(`https://etherscan.io/token/${TOKEN_1}`)
  })
})
