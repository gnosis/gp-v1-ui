import React from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'

import { GlobalStyles, Router } from 'storybook/decorators'
import { PriceDepthChartWidget } from 'components/PriceDepthChartWidget'

export default {
  title: 'component/OrderBookTrades',
  component: PriceDepthChartWidget,
  decorators: [Router, GlobalStyles],
} as Meta

export const Normal: Story = () => <PriceDepthChartWidget />
