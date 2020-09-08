import React from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import { SwapPrice, Props } from './SwapPrice'
import { GNO, DAI } from 'storybook/tokens'

export default {
  title: 'Common/SwapPrice',
  component: SwapPrice,
} as Meta

const Template: Story<Props> = (props) => <SwapPrice {...props} />

export const Basic = Template.bind({})
Basic.args = {
  baseToken: GNO,
  quoteToken: DAI,
  isPriceInverted: true,
}
