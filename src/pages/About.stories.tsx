// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta } from '@storybook/react/types-6-0'

import About from 'pages/About'
import { PageDecorator } from 'storybook/PageDecorator'

export default {
  title: 'Pages/About',
  component: About,
  decorators: [PageDecorator],
} as Meta

export const Primary = About
