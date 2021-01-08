import React from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'

import { GlobalStyles, Router } from 'storybook/decorators'
import { MarketNavBar } from 'components/MarketNavBar'

export default {
  title: 'component/MarketNavBar',
  component: MarketNavBar,
  decorators: [Router, GlobalStyles],
} as Meta

export const Normal: Story = () => <MarketNavBar />
