import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { EtherscanLink, EtherscanLinkProps } from 'components/common/EtherscanLink'
import { Network } from 'types'
import { ADDRESS_GNO, ADDRESS_GNOSIS_PROTOCOL, ADDRESS_GNOSIS_PROTOCOL_RINKEBY, TX_EXAMPLE } from 'storybook/data'

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
  identifier: TX_EXAMPLE,
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
  identifier: ADDRESS_GNOSIS_PROTOCOL_RINKEBY,
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
  label: 'Gnosis Protocol contract',
  identifier: ADDRESS_GNOSIS_PROTOCOL,
}

export const Token = Template.bind({})
Token.args = {
  ...defaultParams,
  type: 'token',
  label: 'GNO token',
  identifier: ADDRESS_GNO,
}
