import React from 'react'
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta } from '@storybook/react/types-6-0'

import About from 'pages/About'
import GlobalStyles from 'styles/global'

export default {
  title: 'Mesa/About',
  component: About,
  decorators: [
    (Story): JSX.Element => (
      <>
        <GlobalStyles />
        <Story />
      </>
    ),
  ],
} as Meta

export const Primary = About
