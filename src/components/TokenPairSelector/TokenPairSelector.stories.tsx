import React from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta } from '@storybook/react/types-6-0'

import { GlobalStyles } from 'storybook/decorators'
import { RouterDecorator } from 'storybook/RouterDecorator'
import { TokenPairSelector } from 'components/TokenPairSelector'

export default {
  title: 'component/TokenPairSelector',
  component: TokenPairSelector,
  decorators: [RouterDecorator, GlobalStyles],
} as Meta

export const Normal: Story = () => <TokenPairSelector selectedPair="ETH/USDC" selectLabel="Select Pair" />
