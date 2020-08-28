
import React from 'react'
import GlobalStyles from 'styles/global'
import { BaseDecorators } from '@storybook/addons'

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}

export const decorators: BaseDecorators<JSX.Element> = [
  (Story) => (
    <>
      <GlobalStyles />
      <Story />
    </>
  ),
];