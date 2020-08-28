import React from 'react'
import { MakeDecoratorResult } from '@storybook/addons'
import GlobalStyles from 'styles/global'

export const PageDecorator: MakeDecoratorResult = (Story): JSX.Element => (
  <>
    <GlobalStyles />
    <Story />
  </>
)
