import React from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import { SwapPrice, Props } from './SwapPrice'

export default {
  title: 'Common/SwapPrice',
  component: SwapPrice,
} as Meta

const Template: Story<Props> = (props) => <SwapPrice {...props} />

export const Basic = Template.bind({})
Basic.args = {
  baseToken: {
    id: 1,
    address: '0x1',
    symbol: 'GNO',
  },
  quoteToken: {
    id: 2,
    address: '0x2',
    symbol: 'DAI',
  },
  isPriceInverted: true,
}

// FIXME: It looks like it allows to use this component with no argument, but then it fails to render
export const NoArgs = Template.bind({})
NoArgs.args = {}
