import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { EtherscanLink, EtherscanLinkProps } from 'components/EtherscanLink'
import { Network } from 'types'

export default {
  title: 'Mesa/EtherscanLink',
  component: EtherscanLink,
  argTypes: {
    label: { control: 'text' },
    networkId: { control: { type: 'inline-radio', options: Object.values(Network).filter(Number.isInteger) } },
  },
  decorators: [
    (Story): JSX.Element => (
      <div
        onClick={(e): void => {
          const target = e.target as HTMLAnchorElement
          if (target.tagName !== 'A') return
          e.preventDefault()
          alert(`Link to ${target.href} clicked`)
        }}
      >
        <Story />
      </div>
    ),
  ],
} as Meta

const Template: Story<EtherscanLinkProps> = (args) => <EtherscanLink {...args} />

export const Primary = Template.bind({})
Primary.args = {
  type: 'tx',
  identifier: '0x5f995094ff596cf1aa27e8ec84fab21c4ec6a512981b13c563a58c9172607c3d',
  networkId: 1,
}
