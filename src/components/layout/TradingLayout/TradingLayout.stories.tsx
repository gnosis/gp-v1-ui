import React from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta } from '@storybook/react/types-6-0'

import { TradingLayout } from 'components/layout'
import { RouterDecorator } from 'storybook/RouterDecorator'
import { LoremIpsum } from 'storybook/LoremIpsum'

export default {
  title: 'Layout/TradingLayout',
  component: TradingLayout,
  decorators: [RouterDecorator],
} as Meta

export const Normal: React.FC = () => (
  <TradingLayout>
    <LoremIpsum />
  </TradingLayout>
)

export const ShortPage: React.FC = () => <TradingLayout>This is a really short page...</TradingLayout>
