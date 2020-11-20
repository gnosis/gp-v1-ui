import React from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta } from '@storybook/react/types-6-0'

import { LegacyTradeLayout } from 'components/layout'
import { Router } from 'storybook/decorators'
import { LoremIpsum } from 'storybook/LoremIpsum'

export default {
  title: 'Layout/LegacyTradeLayout',
  component: LegacyTradeLayout,
  decorators: [Router],
} as Meta

export const Normal: React.FC = () => (
  <LegacyTradeLayout>
    <LoremIpsum />
  </LegacyTradeLayout>
)

export const ShortPage: React.FC = () => <LegacyTradeLayout>This is a really short page...</LegacyTradeLayout>
