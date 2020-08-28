// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta } from '@storybook/react/types-6-0'

import About from 'pages/About'

export default {
  title: 'Pages/About',
  component: About,
} as Meta

export const Primary = About
