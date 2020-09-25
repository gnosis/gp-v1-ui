import React from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta } from '@storybook/react/types-6-0'

import { SwapLayout } from 'components/layout'
import { RouterDecorator } from 'storybook/RouterDecorator'
import { LoremIpsum } from 'storybook/LoremIpsum'

export default {
  title: 'Layout/SwapLayout',
  component: SwapLayout,
  decorators: [RouterDecorator],
} as Meta

export const Normal: React.FC = () => (
  <SwapLayout>
    <LoremIpsum />
  </SwapLayout>
)

export const ShortPage: React.FC = () => <SwapLayout>This is a really short page...</SwapLayout>
