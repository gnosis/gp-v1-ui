import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { EtherscanLink, EtherscanLinkProps } from 'components/common/EtherscanLink'
import { Network } from 'types'

const networkIds = Object.values(Network).filter(Number.isInteger)

export default {
  title: 'Common/EtherscanLink',
  component: EtherscanLink,
  argTypes: {
    label: { control: 'text' },
    networkId: { control: { type: 'inline-radio', options: networkIds } },
  },
} as Meta

const Template: Story<EtherscanLinkProps> = (args) => <EtherscanLink {...args} />

const defaultParams: EtherscanLinkProps = {
  type: 'tx',
  identifier: '0x5f995094ff596cf1aa27e8ec84fab21c4ec6a512981b13c563a58c9172607c3d',
  networkId: Network.Mainnet,
}

export const NoNetwork = Template.bind({})
NoNetwork.args = {
  ...defaultParams,
  networkId: undefined,
}

export const Mainnet = Template.bind({})
Mainnet.args = {
  ...defaultParams,
}

export const Rinkeby = Template.bind({})
Rinkeby.args = {
  ...defaultParams,
  networkId: Network.Rinkeby,
  type: 'contract',
  label: 'Gnosis Protocol (Rinkeby)',
  identifier: '0xC576eA7bd102F7E476368a5E98FA455d1Ea34dE2',
}

export const Labeled = Template.bind({})
Labeled.args = {
  ...defaultParams,
  label: '👀View transaction...',
}

export const Contract = Template.bind({})
Contract.args = {
  ...defaultParams,
  type: 'contract',
  label: 'Gnosis Protocol token',
  identifier: '0x6f400810b62df8e13fded51be75ff5393eaa841f',
}

export const Token = Template.bind({})
Token.args = {
  ...defaultParams,
  type: 'token',
  label: 'GNO token',
  identifier: '0x6810e776880c02933d47db1b9fc05908e5386b96',
}
