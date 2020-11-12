import React from 'react'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta } from '@storybook/react/types-6-0'

import { GenericLayout } from 'components/layout'
import { Router } from 'storybook/decorators'
import { LoremIpsum } from 'storybook/LoremIpsum'

export default {
  title: 'Layout/GenericLayout',
  component: GenericLayout,
  decorators: [Router],
} as Meta

export const Normal: React.FC = () => (
  <GenericLayout>
    <LoremIpsum />
  </GenericLayout>
)

export const ShortPage: React.FC = () => <GenericLayout>This is a really short page...</GenericLayout>
