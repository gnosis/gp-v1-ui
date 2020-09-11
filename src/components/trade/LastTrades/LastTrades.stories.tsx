import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0'

import { LastTrades, Props, LastTradesItem } from 'components/trade/LastTrades/LastTrades'
import { DAI } from 'storybook/tokens'
import BigNumber from 'bignumber.js'
import { CenteredAndFramed } from 'storybook/decorators'

const lastTrades: LastTradesItem[] = [
  {
    id: '1',
    size: new BigNumber('33.234812451221'),
    price: new BigNumber('358.3721221'),
    time: new Date(),
  },
  {
    id: '2',
    size: new BigNumber('33.234812451221'),
    price: new BigNumber('358.3721221'),
    time: new Date(),
  },
  {
    id: '3',
    size: new BigNumber('33.234812451221'),
    price: new BigNumber('358.3721221'),
    time: new Date(),
  },
  {
    id: '4',
    size: new BigNumber('33.234812451221'),
    price: new BigNumber('358.3721221'),
    time: new Date(),
  },
]

export default {
  title: 'trade/LastTrades',
  component: LastTrades,
  decorators: [CenteredAndFramed],
} as Meta

const Template: Story<Partial<Props>> = (args) => <LastTrades quoteToken={DAI} trades={lastTrades} {...args} />

export const NoNetwork = Template.bind({})
