import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { LastTradesWidget, Props } from 'components/trade/LastTrades/LastTradesWidget'
import { DAI } from 'storybook/tokens'
import { Apollo } from 'storybook/decorators'

export default {
  title: 'trade/LastTradesWidget',
  component: LastTradesWidget,
  decorators: [Apollo],
} as Meta

const Template: Story<Partial<Props>> = (args) => <LastTradesWidget quoteToken={DAI} {...args} />

export const Basic = Template.bind({})
